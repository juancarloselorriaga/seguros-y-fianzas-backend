const Policy = require("../models/Policies/Policies");
const AWS    = require('aws-sdk');
const fs     = require('fs')
const sharp  = require('sharp')
const path   = require('path')
const pdf = require('pdf-parse');

AWS.config.setPromisesDependency();
AWS.config.update({
  accessKeyId: `${process.env.AWS_ACCESS_KEY}`,
  secretAccessKey: `${process.env.AWS_SECRET_KEY}`
})

// Eliminar una poliza de contacto por _id de Mongo => DELETE
exports.deletePolicy = (req, res) => {
  Policy.findOne({ _id: req.params.id }, (err, policy) => {
    if (err) {
      //Si no existe, manda error
      return res.status(500).json({
        text: "Imposible eliminar, póliza inexistente"
      });
    }
    if(policy){
      //Elimina la poliza
      policy.deletePolicyItem(req, res, policy)
    }
    else {
      return res.status(200).json({
        text: "Póliza chingao"
      });
    }
  })
};

// Editar una poliza de contacto por _id de Mongo => DELETE
exports.editPolicy = (req, res) => {
  Policy.findOne({ _id: req.params.id }, (err, policy) => {
    if (err) {
      //Si no existe, manda error
      return res.status(500).json({
        text: "Imposible editar, póliza inexistente"
      });
    }
    if(policy){
      //Edita la poliza
      Policy.findOneAndUpdate(
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
            text: "Póliza actualizada con éxito",
            data: req.body
          });
        }
      );
    }
    else {
      return res.status(200).json({
        text: "Póliza no encontrada"
      });
    }
  })
};

// Añadir archivos a la póliza
exports.addFiles = (req, res) => {
  res.status(200).json({ files: req.files })
 };


 // Añadir archivos a la póliza y después subirlos a AWS
exports.addAndUploadFile = async (req, res) => {

  const s3 = new AWS.S3();
  const now = Date.now()

  try{
    if(req.file.mimetype === 'application/pdf'){

      const readFile = (path) =>
      new Promise((resolve, reject) =>{
        fs.readFile(path, (err, data) => {
          if(err){
            reject (err)
          }
          else resolve(data)
        })
      })

      const fileData = await readFile(req.file.path)
      
      var base64data = new Buffer(fileData, 'binary');

      const s3res = await s3.upload({
      Bucket: `${process.env.AWS_BUCKET}`,
      Key: `${req.params.id}/${now}-${req.file.originalname}`,
      Body: base64data,
      ContentType: 'application/pdf',
      ACL: 'public-read'
    }).promise();

    fs.unlink(req.file.path, () => {
      res.status(200).json({ file: s3res.Location })
    })


  }
    else{
      const buffer = await sharp(req.file.path)
    .toBuffer()

    const s3res = await s3.upload({
      Bucket: `${process.env.AWS_BUCKET}`,
      Key: `${req.params.id}/${now}-${req.file.originalname}`,
      Body: buffer,
      ACL: 'public-read'
    }).promise();

    fs.unlink(req.file.path, () => {
      res.status(200).json({ file: s3res.Location })
    })
    }
    
  } catch (err) {
    res.status(500).json({
      text: "Error en el servidor",
      err: err
    })
  }
 }

// Consultar archivos de la póliza
exports.getFiles = async (req, res) => {
  try{
    
    const s3 = new AWS.S3();
    const response = await s3.listObjectsV2({
      Bucket: `${process.env.AWS_BUCKET}`,
      Prefix: `${req.params.id}`
    }).promise();

    res.status(200).json({ 
      text: 'Consulta de archivos exitosa',
      policyFiles: response.Contents })    
  } catch (err){
      res.status(500).json({
      text: "Error en el servidor",
      err: err
    });
  }
};

// Eliminar un archivo de la póliza y AWS
exports.deleteAwsFile = async (req, res) => {

  var params = {
    Bucket: `${process.env.AWS_BUCKET}`,
    Key: `${req.body.Key}`
  };

  try{
    const s3 = new AWS.S3();

    const s3res = await s3.deleteObject(params).promise();
    res.status(200).json({
      text: "Elemento borrado",
      data: s3res
    })
  } catch (err){
    res.status(500).json({
    text: "Error en el servidor",
    err: err
  });
}
};

 //Extrae información de una póliza en PDF y crea una póliza a partir de eso. 
 exports.readPdf = async (req, res) => {
  try{
    //Si el archivo es PDF
    if(req.file.mimetype === 'application/pdf'){

      let dataBuffer = fs.readFileSync(req.file.path);

      pdf(dataBuffer).then(data => {
        // PDF text
        fs.unlink(req.file.path, () => {
          res.status(200).json({
            text: 'Lectura de PDF correcta',
            pdfData: data.text
          })
        })
      })

      
    }
    else{
       //Si el archivo no es PDF, manda error en el servidor.
       res.status(500).json({
        text: "Tipo de archivo incorrecto",
        err: err
      })
    }
   
   
  } catch (err) {
    res.status(500).json({
      text: "Error en el servidor",
      err: err
    })
  }
 }
