'use strict';

var express = require('express');
var controller = require('./user.controller');
var config = require('../../config/environment');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);

router.get('/gravatar', controller.gravatar);
router.get('/gravatar/', controller.gravatar);
router.get('/gravatar/:email', controller.gravatar);
router.delete('/me', auth.isAuthenticated(), controller.deleteMe);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.put('/:id/admin', auth.hasRole('admin'), controller.makeAdmin);
router.delete('/:id/admin', auth.hasRole('admin'), controller.removeAdmin);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

module.exports = router;
