'use strict';

var express = require('express');
var controller = require('./book.controller');
var jwt = require('express-jwt')
var auth = jwt({secret: 'SECRET', userProperty:'payload'});

var router = express.Router();

router.get('/', auth,controller.index);
router.get('/mybooks', auth, controller.showMyBooks);

router.get('/:bookid', auth, controller.show);
router.post('/addbook', auth, controller.create);
router.put('/:id', controller.update);
router.put('/trade/:id', auth,controller.trade);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;