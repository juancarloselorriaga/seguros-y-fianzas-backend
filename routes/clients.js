const express   = require('express');
const router    = express.Router();

const clientsController = require('../controllers/clients')

// Crear un nuevo cliente
router.post('/add-client', clientsController.addClient)

// Consulta un cliente por _id de Mongo
router.get('/:id', clientsController.getOneClient)

// Editar un usuario por _id de Mongo
router.put('/:id', clientsController.editClient)

// Eliminar un usuario por _id de Mongo
router.delete('/:id', clientsController.deleteClient)

//Crear una nueva tarjeta de contacto y asignarla al cliente a través de su ID
router.post('/:id/add-contact', clientsController.addContact)

//Crear una nueva poliza y asignarla al cliente a través de su ID
router.post('/:id/add-policy', clientsController.addPolicy)

// Consultar todos los clientes disponibles
router.get('/', clientsController.getAllClients)

module.exports = router;