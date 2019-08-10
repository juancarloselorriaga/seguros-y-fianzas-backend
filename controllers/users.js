const User = require("../models/Setup/User");

// Consultar todos los usuarios disponibles => GET
exports.getAllUsers = (req, res) => {
  User.find({})
    .then(users => {
      res.status(200).json({
        text: "Consulta de usuarios exitosa",
        data: users
      });
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

// Consulta un usuario por _id de Mongo => GET
exports.getOneUser = (req, res) => {
  User.findById(req.params.id)
    .populate('employees.userId', '-plan -__v -employees')
    .populate('parent', '-employees')
    .then(user => {
      res.status(200).json({
        text: "Consulta exitosa",
        data: user
      });
    })
    .catch(err => {
      res.status(500).json({
        text: "Error en el servidor",
        error: err
      });
    });
};

// Crear un nuevo usuario => POST
exports.addUser = (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      text: "Falta información: req.body"
    });
  }

  let model = User(req.body);
  model
    .save()
    .then(doc => {
      if (!doc || doc.length === 0) {
        return res.status(500).json({
          text: "No se pudo crear el usuario"
        });
      }

      res.status(200).json({
        text: "Usuario creado con éxito",
        data: doc
      });
    })
    .catch(err => {
      res.status(500).json({
        text: "Error en el servidor",
        error: err
      });
    });
};

// Editar un usuario por _id de Mongo => PUT
exports.editUser = (req, res) => {
  //Primero busca si el usuario existe
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      //Si no existe, manda error
      res.status(500).json({
        text: "Imposible editar, usuario inexistente"
      });
    }
    if (user) {
      //Si existe, actualiza la información
      User.findOneAndUpdate(
        { _id: req.params.id },
        { $set: req.body },
        (err, doc) => {
          if (err) {
            return res.status(500).json({
              text: "Error en el servidor",
              err: err
            });
          }
          res.status(200).json({
            text: "Usuario actualizado con éxito",
            data: req.body
          });
        }
      );
    }
  });
};

// Eliminar un usuario por _id de Mongo => DELETE
exports.deleteUser = (req, res) => {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      //Si no existe, manda error
      res.status(500).json({
        text: "Imposible eliminar, usuario inexistente"
      });
    }
    if(user){
      //Revisa si es empleado y rompe la relación con el padre, posteriormente, elimina.
      //Revisa si es agente y elimina a todas sus cuentas hijo
      user.checkRoleAndDelete(req, res, user)
    }
  });
};

// Buscar un usuario por mail => ..users/search?email=doe@gmail.com => GET
exports.searchUserBy = (req, res) => {
  if (!req.query.email) {
    //Se toma al email como parámetro para buscar, este puede cambiar según la necesidad
    return res.status(400).json({
      text: "Missing URL parameter: email"
    });
  }

  User.findOne({
    email: req.query.email
  })
    .then(doc => {
      res.status(200).json({
        text: "Búsqueda exitosa",
        data: doc
      });
    })
    .catch(err => {
      res.status(500).json({
        text: "Error en el servidor",
        error: err
      });
    });
};

// Crear un usuario 'empleado', asignado a un usuario 'agente'
exports.addEmployee = (req, res) => {
  User.findOne({ _id: req.params.id }, (err, user) => {
    if (err) {
      // Si no existe, manda error
      res.status(500).json({
        text: "Imposible añadir empleados, usuario inexistente"
      });
    }
    if (user) {
      // Si existe, crea y asigna al nuevo empleado
      user.addNewEmployee(req, res, user)
    }
  });
};

