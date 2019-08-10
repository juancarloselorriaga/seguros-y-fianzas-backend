const ContactInfo = require("../models/Setup/ContactInfo");

// Eliminar una tarjeta de contacto por _id de Mongo => DELETE
exports.deleteContactCard = (req, res) => {
  ContactInfo.findOne({ _id: req.params.id }, (err, contactInfo) => {
    if (err) {
      //Si no existe, manda error
     return  res.status(500).json({
        text: "Imposible eliminar, tarjeta inexistente"
      });
    }
    if(contactInfo){
      //Elimina la tarjeta
      contactInfo.deleteCard(req, res, contactInfo)
    }
    else {
      return res.status(200).json({
        text: "Tarjeta de contacto no encontrada"
      });
    }
  })
};

// Editar una tarjeta de contacto por _id de Mongo => DELETE
exports.editContactCard = (req, res) => {
  ContactInfo.findOne({ _id: req.params.id }, (err, contactInfo) => {
    if (err) {
      //Si no existe, manda error
      return res.status(500).json({
        text: "Imposible editar, tarjeta inexistente"
      });
    }
    if(contactInfo){
      //Edita la tarjeta
      ContactInfo.findOneAndUpdate(
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
            text: "Tarjeta actualizada con éxito",
            data: req.body
          });
        }
      );
    }
    else {
      return res.status(200).json({
        text: "Tarjeta de contacto no encontrada"
      });
    }
  })
};






// // Editar una tarjeta de contacto por _id de Mongo => DELETE
// exports.editContactCard = (req, res) => {
//   ContactInfo.findOne({ _id: req.params.id }, (err, contactInfo) => {
//     if (err) {
//       //Si no existe, manda error
//       res.status(500).json({
//         text: "Imposible editar, tarjeta inexistente"
//       });
//     }
//     if(contactInfo){
//       //Elimina la tarjeta
//       contactInfo.editCard(req, res, contactInfo)
//     }
//   })
// };


// exports.editCard = (req, res, contactInfo) => {
//   //Primero busca si la tarjeta existe
//   User.findOne({ _id: req.params.id }, (err, card) => {
//     if (err) {
//       //Si no existe, manda error
//       res.status(500).json({
//         text: "Imposible editar, tarjeta inexistente"
//       });
//     }
//     if (card) {
//       //Si existe, actualiza la información
//       ContactInfo.findOneAndUpdate(
//         { _id: req.params.id },
//         { $set: req.body },
//         (err, doc) => {
//           if (err) {
//             return res.status(500).json({
//               text: "Error en el servidor",
//               err: err
//             });
//           }
//           res.status(200).json({
//             text: "Tarjeta actualizada con éxito",
//             data: req.body
//           });
//         }
//       );
//     }
//   });
// };

