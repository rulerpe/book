'use strict';

var express = require('express');
var controller = require('./user.controller');
var jwt = require('express-jwt')
var auth = jwt({secret: 'SECRET', userProperty:'payload'});

var router = express.Router();

router.get('/', controller.index);
router.get('/user', auth, controller.getUser);
router.post('/register', controller.create);
router.post('/login', controller.login);
router.put('/', auth, controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;