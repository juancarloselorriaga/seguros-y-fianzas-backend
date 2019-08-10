const express   = require('express');
const router    = express.Router();
const multer    = require('multer');

const fileFilter = function(req, file, cb) {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', "application/pdf"];

  if(!allowedTypes.includes(file.mimetype)){
    const error = new Error('Tipo de archivo no permitido');
    error.code = "LIMIT_FILE_TYPES";
    return cb(error, false);
  }
  cb(null, true);
}

const MAX_SIZE = 10000000;
const upload = multer({
  dest: './uploads/',
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
})

const policyController = require('../controllers/policies')

// Eliminar una póliza por _id de Mongo
router.delete('/:id', policyController.deletePolicy)

// Editar una póliza por _id de Mongo
router.put('/:id', policyController.editPolicy)

// Ver archivos de la póliza
router.post('/:id/delete-file', policyController.deleteAwsFile)

// Añadir un archivo a la póliza y guardarlos en AWS
router.post('/:id/save-file', upload.single('file'), policyController.addAndUploadFile)

// Ver archivos de la póliza
router.get('/:id/get-files', policyController.getFiles)

// Extrae información de una póliza en PDF y crea una póliza a partir de eso.
router.post('/read-pdf', upload.single('file'), policyController.readPdf)



// // Añadir un archivo a la póliza
// router.post('/:id/add-file', upload.single('file'), policyController.addFile)

// // Añadir varios archivos a la póliza
// router.post('/:id/add-files', upload.array('files'), policyController.addFiles)



module.exports = router;