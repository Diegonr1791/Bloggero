'use strict'

//requerimos express
var express = require('express');

//requerimos el connect-multiparty y lo configuramos
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './upload/articles'});

//requerimos los controladores
var articleController = require('../controllers/articleController');

//requerimos el router
var router = express.Router();

//definimos las rutas
router.get('/test', articleController.test);
router.post('/save', articleController.save);
router.get('/articles/:last?', articleController.getArticles);
router.get('/article/:id', articleController.getArticle);
router.put('/article/:id', articleController.updateArticle);
router.delete('/article/:id', articleController.deleteArticle);
router.post('/upload-image/:id', md_upload, articleController.upload);
router.get('/get-image/:image', articleController.getImage);
router.get('/search/:search', articleController.search);

//exportamos el modulo
module.exports = router;