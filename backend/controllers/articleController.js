'use strict'

//Requerimos el validator para validaciones
var validator = require('validator');

var fs = require('fs');
var path = require('path');

//Requerimos el modelo del articulo
var Article = require('../models/article');

const { param } = require("../routes/articleRoutes");

var controller = {
    test: (req,res) =>{
    
        return res.status(200).send({
            message: 'Entra al metodo test controlador articulo'
        });
    },

    save: (req,res) => {
        //recojer parametros por post
        var params = req.body;


        //validar datos (validator)
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
            
        } catch (err) {
            return res.status(400).send({
                message: 'Faltan datos por enviar'
            });
        }

        if(validate_content && validate_title) {
            //Crear el objeto a guardar
            var article = new Article();

            //Asignar valores al objeto
            article.title = params.title;
            article.content = params.content;
            article.image = null;

            //Guardar el objeto(articulo)
            article.save((err,articleStored) =>{
                if(err || !articleStored){
                    return res.status(404).send({
                        status: 'error',
                        message: 'Error al guardar el articulo'
                    });
                }else{
                    return res.status(200).send({
                        status: 'Articulo Guardado correctamente',
                        article: articleStored
                    });
                }
            });

            //Devolver una respuesta

            /*return res.status(200).send({
                status: 'Success',
                article
            });*/

        }else {
            return res.status(400).send({
                message: 'Datos invalidos'
            });
        }
    },

    getArticles: (req,res) =>{

        //last sirve para traer la cantidad de articulos que se requiera
        var last = req.params.last;
        var query = Article.find({});

        if(last || last != undefined){
            query.limit(5);
        }
        //Find y ordenado descendente de la lista que trae
        query.sort('-_id').exec((err, articles) =>{
           
            if(err){
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al cargar los articulos'
                });
            }
            if(!articles){
                return res.status(404).send({
                    status: 'Error',
                    message: 'No hay articulos en la BD'
                });
            }

            return res.status(200).send({
                status: 'Success',
                articles
            });
            
        })
    },

    getArticle: (req, res) =>{

        //Recoger el id de la url
        var articleId = req.params.id;

        //comprobar que existe
        if (!articleId || articleId == null ) {
            return res.status(404).send({
                status: 'Error',
                message: 'El articulo no existe'
            });
        }

        //buscar el articulo
        Article.findById(articleId, (err, article) => {
            if(!article || err) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No existe el articulo'
                });
            }

            //devolverlo en json
            return res.status(200).send({
                status: 'Success',
                article
            });
        })

    },

    updateArticle: (req, res) => {
        //recoger el id del articulo de la url
        var articleId = req.params.id;

        //obtener los datos del articulo que llegan por put
        var params = req.body;

        //validar los datos
        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

            if (validate_title && validate_content) {
                 //find and update
                 Article.findOneAndUpdate({_id: articleId}, params, {new: true}, (err,articleUpdated) => {
                    if(err) {
                        return res.status(404).send({
                            status: 'Error',
                            message: 'Error al actualizar'
                        });
                    }

                    if(!articleId) {
                        return res.status(404).send({
                            status: 'Error',
                            message: 'No existe el articulo'
                        });
                    }

                    //si es exitoso
                    return res.status(200).send({
                        status: 'Success',
                        article: articleUpdated
                    });
                   
                 });
            }else{
                //devolver respuesta
                return res.status(404).send({
                    status: 'Error',
                    message: 'Datos invalidos'
                });
            }
            
        } catch (err) {
            return res.status(404).send({
                status: 'Error',
                message: 'Faltan datos por enviar'
            });
        }

    },

    deleteArticle: (req, res) => {
        //Recoger el id de la url
        var articleId = req.params.id;

        //find and delete del id
        Article.findOneAndDelete({_id: articleId}, (err, articleRemoved) => {
            if(err) {
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error al borrar'
                });
            }
            if(!articleRemoved) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No se ha borrado el articulo, posiblemente no exista'
                });
            }

            //respuesta positiva
            return res.status(200).send({
                status: 'Success',
                article: articleRemoved
            });
        })
    },

    upload: (req, res) => {
        //configurar el modulo del connect-multiparty routes/articleRuotes.js (hecho)
        //recoger el fichero de la peticion
        var file_name = 'Imagen no subida...';

        if(!req.files) {
            return res.status(404).send({
                status: 'Error',
                message: file_name
            });
        }
//----------------------------------------------
        //conseguir el nombre y la extension del archivo
        var file_path = req.files.file0.path;
        var file_split = file_path.split('\\');
        //ADVERTENCIA EN LINUX O MAC 
        //var file_split = file_path.split('/');

        //nombre del archivo
        var file_name = file_split[2];
        //extension
        var extension_split = file_name.split('\.');
        var file_ext = extension_split[1];
//-----------------------------------------------
        //comprobar la extension- solo imagenes
        if (file_ext != 'jpg' && file_ext != 'png' && file_ext != 'jpeg' && file_ext != 'gif') {

            //borrar el archivo del directorio en caso de que no sea imagen
            fs.unlink(file_path, (err) => {

                return res.status(200).send({
                    status: 'Error',
                    message: 'La extension de la imagen no es valida'
                });
            });
        }else{
            //si todo es valido saco el id de la url
            var articleId = req.params.id;
            //Buscar el articulo, asignarle el nombre de la imagen y actualizar
            Article.findOneAndUpdate({_id: articleId}, {image: file_name}, {new: true}, (err,articleUpdated) => {

                if(err || !articleUpdated){
                    return res.status(500).send({
                        status: 'Error',
                        message: 'Error al guardar imagen del articulo',
                        articleUpdated
                    });
                }

                return res.status(200).send({
                    status: 'Success',
                    article: articleUpdated
                });
            });

        }
    },//end upload

    getImage: (req, res) => {
        var file = req.params.image;
        var path_file = './upload/articles/' + file;
        fs.exists(path_file, (exist) => {
            
            if(exist) {
               
                //devuelve la imagen en crudo listo para meterla en una etiqueta
                return res.sendFile(path.resolve(path_file));
            
            }else {

                return res.status(500).send({
                    status: 'Error',
                    message: 'La imagen no existe'
                });
            }
        });
    },

    search: (req, res) => {
        //sacar el string a buscar
        var searchString = req.params.search;

        //find or
        Article.find({ "$or": [
            {title: {"$regex": searchString, "$options": "i"}},
            {content: {"$regex": searchString, "$options": "i"}}
        ]})
        .sort([['date', 'descending']])
        .exec((err,articles) => {
             console.log(articles);
            if(err) {
                return res.status(500).send({
                    status: 'Error',
                    message: 'Error en la peticion'
                });
            }

            if(!articles || articles.length <= 0) {
                return res.status(404).send({
                    status: 'Error',
                    message: 'No se encontro ningun articulo'
                });
            }

            return res.status(200).send({
                status: 'Success',
                articles
            });
        });
    }


};

module.exports = controller;