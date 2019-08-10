const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    info: {
      fullName: {
        type: String,
        required: true,
      },
      birthdate: Date,
      phone: String,
      mobile: String,
			rfc: String,
			address: {
        street: String,
        number: String,
        neighborhood: String,
        municipality: String,
        state: String,
        cp: String,
      },
    },
    role: {
      type: String,
      required: true,
      enum: ["AGENTE", "EMPLEADO", "ADMIN"],
      default: "AGENTE"
    },
    employees: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User" }
      }
		],
		companies: [
			{
				companyId: { type: Schema.Types.ObjectId, ref: "Company"}
			}
		],
    isActive: {
      type: Boolean,
      default: true
    },
    plan: {
      type: String,
      required: true,
      enum: ["TRIAL", "TRIAL-EXPIRADA", "SUSCRIPTOR"],
      default: "TRIAL"
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);

//Método que se utilizará para asignar nuevos empleados a la cuenta padre.
userSchema.methods.addNewEmployee = function(req, res, user) {
  let newUser = new User();

  newUser.username = req.body.username;
  newUser.email = req.body.email;
  newUser.info.fullName = req.body.info.fullName;
  newUser.role = "EMPLEADO";
  newUser.employees = null;
  newUser.parent = req.params.id;
  newUser.isActive = user.isActive;
  newUser.plan = user.plan;

  newUser
    .save()

    .then(newEmployee => {
      if (!newEmployee || newEmployee.length === 0) {
        return res.status(500).json({
          text: "No se pudo crear el usuario"
        });
      }

      //Y después se relaciona el nuevo empleado con su creador
      const updatedEmployees = [...this.employees];

      updatedEmployees.push({
        userId: newEmployee._id
      });

      this.employees = updatedEmployees;

      this.save();
      res.status(200).json({
        text: "Empleado creado con éxito",
        data: newEmployee
      });
    })
    .catch(err => {
      res.status(500).json({
        text: "Error en el servidor",
        error: err
      });
    });
};

//Método que se utilizará para remover empleados de la cuenta padre.
userSchema.methods.removeEmployee = function(employee) {
  const updatedEmployees = this.employees.filter(e => {
    return e.userId.toString() !== employee._id.toString();
  });

  this.employees = updatedEmployees;
  console.log(this.employees);
  return this.save();
};

userSchema.methods.checkRoleAndDelete = function(req, res, user) {
  if (user.role === "EMPLEADO") {
    //Si existe, primero busca al padre (en caso de ser empleado) para eliminar la relación
    User.findOne(user.parent, (err, parent) => {
      parent.removeEmployee(user);
    });

    //Después, elimina la cuenta del empleado
    User.findByIdAndRemove({
      _id: req.params.id
    })
      .then(user => {
        res.status(200).json({
          text: "Usuario eliminado con éxito",
          data: user
        });
      })
      .catch(err => {
        res.status(500).json({
          text: "Error en el servidor",
          error: err
        });
      });
  }

  if (user.role === "AGENTE") {
    //Si existe, primero elimina todas las cuentas de empleado.
    let empleados = user.employees;

    empleados.forEach(e => {
      User.findOne(e.userId, (err, child) => {
        User.findByIdAndRemove(child)
          .then(deletedChild => {})
          .catch(err => {
            res.status(500).json({
              text: "Error en el servidor",
              error: err
            });
          });
      });
    });

    //Después, elimina al agente

    User.findByIdAndRemove({
      _id: req.params.id
    })
      .then(user => {
        res.status(200).json({
          text: "Usuario eliminado con éxito",
          data: user
        });
      })
      .catch(err => {
        res.status(500).json({
          text: "Error en el servidor",
          error: err
        });
      });
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
