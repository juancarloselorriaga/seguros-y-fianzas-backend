require('dotenv').config()

const express    = require('express');
const logger     = require('morgan');
const bodyParser = require('body-parser');
const mongoose   = require('mongoose');
const path      = require('path')

const app = express();

//Connecting to the db

mongoose
.connect(`${process.env.DB_LOCAL_HOST}`, {useNewUrlParser: true})
.then(x => {
  console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
})
.catch(err => {
  console.error('Error connecting to mongo', err)
});

//Middleware setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next();
});

//Routes
const userRoutes = require('./routes/users');
const clientRoutes = require('./routes/clients');
const contactInfoRoutes = require('./routes/contactInfo');
const policyRoutes = require('./routes/policies');

app.use('/users', userRoutes);
app.use('/clients', clientRoutes);
app.use('/contact-info', contactInfoRoutes);
app.use('/policies', policyRoutes);

//Public
app.use(express.static('public'));

//Errors
const errorController = require('./controllers/errors')

//Handler 422 - Validaciones de archivo

app.use(function(err, req, res, next){

  if(err.code == 'LIMIT_FILE_TYPES') {
    res.status(422).json({
      err: `Error: solo se permiten archivos png, jpeg y PDF.`
    });
    return;
  }

  if(err.code == 'LIMIT_FILE_SIZE') {
    res.status(422).json({
      err: `Archivo muy grande. El tamaño máximo es de 2 MB`
    });
    return;
  }
})

//Handler error 404 - Resource not found
app.use(errorController.get404)

//Handler error 505 - Internal server error
app.use(errorController.get500)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.info(`Server has started on ${PORT}`))

