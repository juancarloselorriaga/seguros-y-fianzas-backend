const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ContactInfo = require("../Setup/ContactInfo");
const Policy = require("../Policies/Policies");

const clientSchema = new Schema(
  {
    personalInfo: {
      name: String,
      birthdate: String,
      maritalStatus: String,
      gender: {
        type: String,
        enum: ["Otro", "Hombre", "Mujer"]
      }
    },
    contactInfo: [
      {
        contactId: { type: Schema.Types.ObjectId, ref: "ContactInfo" }
      }
    ],
    professionalInfo: {
      company: String,
      occupation: String
    },
    legalInfo: {
      rfc: String,
      curp: String
    },
    medicalInfo: {
      isSmoker: {
        type: Boolean,
        default: false
      },
      diseases: [
      ]
    },
    additionalInfo: {
      comments: String,
      reference: String
    },
    policies: [
      {
        policyId: { type: Schema.Types.ObjectId, ref: "Policy" }
      }
    ],
    validPolicies: Number,
    type: {
      type: String,
      enum: ["CONTRATANTE", "ASEGURADO"],
      default: 'CONTRATANTE'
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
  }
);


//Método que se utilizará para asignar nuevas pólizas a un cliente
clientSchema.methods.addNewPolicy = function(req, res, client) {
  var c = client
  
  //FALTA HACER VALIDACION DE CLIENTE EXISTENTE

  let policy = new Policy();

  policy._policyNumber = req.body._policyNumber
  policy.address = req.body.address;
  policy.additionalInfo = req.body.additionalInfo;
  policy.company = req.body.company
  policy.class.title = req.body.class.title
  policy.class.key = req.body.class.key
  policy.issuanceDate = req.body.issuanceDate
  policy.expirationDate = req.body.expirationDate
  policy.paymentType = req.body.paymentType
  policy.paymentMethod = req.body.paymentMethod
  policy.currency = req.body.currency
  policy.hasExtraPremium = req.body.hasExtraPremium
  policy.extraPremiumCause = req.body.extraPremiumCause
  policy.plan.title = req.body.plan.title
  policy.plan.key = req.body.plan.key
  policy.plan.coverage = req.body.plan.coverage
  // policy.plan.sumInsured.concept = req.body.sumInsured.concept
  policy.plan.totalPremium = req.body.plan.totalPremium
  policy.plan.netPremium = req.body.plan.netPremium


  if(req.body._buyer){
    policy._buyer = c._id
  }

  if(req.body._insured){
    policy._insured = c._id
  } 

  if(req.body.paymentStatus === true){
    policy.paymentStatus = 'pagado'
  }

  policy
    .save()

    .then(newPolicy => {
      if (!newPolicy || newPolicy.length === 0) {
        return res.status(500).json({
          text: "No se pudo crear la tarjeta de contacto"
        });
      }

      //Y después se relaciona la nueva póliza con un cliente
      const updatedPolicies = [...this.policies];

      updatedPolicies.push({
        policyId: newPolicy._id
      });

      this.policies = updatedPolicies;

      this.save();
      res.status(200).json({
        text: "Póliza creada con éxito",
        data: newPolicy
      });
    })
    .catch(err => {
      res.status(500).json({
        text: "Error en el servidor",
        error: err
      });
    });
};

//Antes de enviar la información de consulta del cliente, limpia las tarjetas de contacto vacías.
clientSchema.methods.cleanContactInfo = function (req, res, client) {

  //Borra tarjetas de contacto vacías
  let filteredContactInfoArray = client.contactInfo.filter(e => e.contactId !== null)

  this.contactInfo = filteredContactInfoArray;

  //Borra polizas vacías
  let filteredPolicyArray = client.policies.filter(e => e.policyId !== null)

  this.policies = filteredPolicyArray;

  this.save();
  res.status(200).json({
    text: "Consulta exitosa",
    data: client
  });
}

//Método que se utilizará para asignar nuevas tarjetas de contacto a un cliente
clientSchema.methods.addNewContact = function(req, res, client) {
  let contactCard = new ContactInfo();

  contactCard.title = req.body.title;
  contactCard.email = req.body.email;
  contactCard.phone = req.body.phone;
  contactCard.mobile = req.body.mobile;
  contactCard.address.street = req.body.address.street;
  contactCard.address.number = req.body.address.number;
  contactCard.address.neighborhood = req.body.address.neighborhood;
  contactCard.address.municipality = req.body.address.municipality;
  contactCard.address.state = req.body.address.state;
  contactCard.address.cp = req.body.address.cp;
  contactCard.address.additionalInfo = req.body.address.additionalInfo;
  contactCard._client = client._id;

  contactCard
    .save()

    .then(newContactCard => {
      if (!newContactCard || newContactCard.length === 0) {
        return res.status(500).json({
          text: "No se pudo crear la tarjeta de contacto"
        });
      }

      //Y después se relaciona la nueva tarjeta de contacto con un cliente
      const updatedContactCards = [...this.contactInfo];

      updatedContactCards.push({
        contactId: newContactCard._id
      });

      this.contactInfo = updatedContactCards;

      this.save();
      res.status(200).json({
        text: "Tarjeta de contacto creada con éxito",
        data: newContactCard
      });
    })
    .catch(err => {
      res.status(500).json({
        text: "Error en el servidor",
        error: err
      });
    });
};

//Método para eliminar a un cliente y a sus pólizas.
clientSchema.methods.checkChildrenAndDelete = function(req, res, client) {
  //Primero elimina las polizas
  let policies = client.policies;

  policies.forEach(e => {
      Policy.findByIdAndRemove(e.policyId)
        .then(deletedPolicy => {})
        .catch(err => {
          res.status(500).json({
            text: "Error en el servidor",
            error: err
          });
        });
  });

  //Después, elimina las tarjetas de contacto
  let contactCards = client.contactInfo;

  contactCards.forEach(e => {
    ContactInfo.findByIdAndRemove(e.contactId)
        .then(deletedContactCard => {})
        .catch(err => {
          res.status(500).json({
            text: "Error en el servidor",
            error: err
          });
        });
  });

  //Fianliza, eliminando al cliente
  Client.findByIdAndRemove({
    _id: req.params.id
  })
    .then(client => {
      res.status(200).json({
        text: "Cliente eliminado con éxito",
        data: client
      });
    })
    .catch(err => {
      res.status(500).json({
        text: "Error en el servidor",
        error: err
      });
    });
};

const Client = mongoose.model("Client", clientSchema);

module.exports = Client;
