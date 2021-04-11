'use strict'

/*requerimos mongoose*/
var mongoose = require('mongoose');

/*requerimos el server*/
var app = require('./app');

/*puerto para esta aplicacion */
var port = 3900;

/*Desactivamos metodos viejos para usar los nuevos */
mongoose.set('useFindAndModify', false);

/*Utilizamos promesa para evitar errores*/
mongoose.Promise = global.Promise;

/*conexion a mongodb*/
const URL = 'mongodb://localhost:27017/api_blog';
mongoose.connect(URL,{useNewUrlParser: true})
.then(() =>{
    console.log('Connection succesfuly');

    //Crear servidor y escuchar peticiones http
    app.listen(port,() =>{
        console.log('Servidor corriendo en http://localhost:' + port);
    });
});

