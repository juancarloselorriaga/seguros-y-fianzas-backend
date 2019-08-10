const Client = require("../models/Client/Client");

// Consultar todos los clientes disponibles => GET
exports.getAllClients = (req, res) => {
  
  Client.find({})
  .populate('contactInfo.contactId')
  .populate('policies.policyId')
    .then(clients => {
      res.status(200).json({
        text: "Consulta de clientes exitosa",
        data: clients
      });
    })
    .catch(err => {
      res.status(500).json(err);
    });
};

exports.getOneClient = (req, res) => {
  Client.findOne({ _id: req.params.id }, (err, client) => {
    if(err){
      res.status(500).json({
      text: "Error en el servidor",
      error: err
    });
    }
    if(client){
      client.cleanContactInfo(req, res, client)
    }
}).populate('contactInfo.contactId')
.populate('policies.policyId');
}

// Crear un nuevo cliente => POST
exports.addClient = (req, res) => {
  if (!req.body) {
    return res.status(400).json({
      text: "Falta información: req.body"
    });
  }


  let model = Client(req.body);
  model
    .save()
    .then(doc => {
      if (!doc || doc.length === 0) {
        return res.status(500).json({
          text: "No se pudo crear el cliente"
        });
      }

      res.status(200).json({
        text: "Cliente creado con éxito",
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


// Editar un cliente por _id de Mongo => PUT
exports.editClient = (req, res) => {
  //Primero busca si el cliente existe
  Client.findOne({ _id: req.params.id }, (err, client) => {
    if (err) {
      //Si no existe, manda error
      res.status(500).json({
        text: "Imposible editar, cliente inexistente"
      });
    }
    if (client) {
      //Si existe, actualiza la información
      Client.findOneAndUpdate(
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
            text: "Cliente actualizado con éxito",
            data: req.body
          });
        }
      );
    }
  });
};

// Eliminar un cliente por _id de Mongo => DELETE
exports.deleteClient = (req, res) => {
  Client.findOne({ _id: req.params.id }, (err, client) => {
    if (err) {
      //Si no existe, manda error
      res.status(500).json({
        text: "Imposible eliminar, cliente inexistente"
      });
    }
    if(client){
      //Elimina las pólizas y posteriormente al cliente.
      client.checkChildrenAndDelete(req, res, client)
    }
  })
};


  // Crear una tarjeta de contacto y la asigna al cliente.
exports.addContact = (req, res) => {
  Client.findOne({ _id: req.params.id }, (err, client) => {
    if (err) {
      // Si no existe, manda error
      res.status(500).json({
        text: "Imposible añadir contacto, cliente inexistente"
      });
    }
    if (client) {
      // Si existe, crea y asigna la nueva tarjeta de contacto.
      client.addNewContact(req, res, client)
    }
  });
};

  // Crear una poliza y la asigna al cliente.
  exports.addPolicy = (req, res) => {
    Client.findOne({ _id: req.params.id }, (err, client) => {
      if (err) {
        // Si no existe, manda error
        res.status(500).json({
          text: "Imposible añadir contacto, cliente inexistente"
        });
      }
      if (client) {
        // Si existe, crea y asigna la nueva tarjeta de contacto.
        client.addNewPolicy(req, res, client)
      }
    });
  };