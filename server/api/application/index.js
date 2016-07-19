'use strict';

var express = require('express');
var controller = require('./application.controller');
var auth = require('../../auth/auth.service');
var config = require('../../config/environment');

var router = express.Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.get('/sponsors', auth.isAuthenticated(), controller.sponsors);
// router.get('/:id', controller.show);
router.get('/me', auth.isAuthenticated(), controller.showMe);
router.post('/me', auth.isAuthenticated(), checkOpenRegistrations, controller.updateMe);
router.post('/me/save', auth.isAuthenticated(), checkOpenRegistrations, controller.saveMe);
router.post('/:id/accept', auth.hasRole('admin'), controller.accept);
router.post('/:id/reject', auth.hasRole('admin'), controller.reject);
// router.post('/', controller.create);
// router.put('/:id', controller.update);
// router.patch('/:id', controller.update);
// router.delete('/:id', controller.destroy);
router.post('/cv', auth.isAuthenticated(), checkOpenRegistrations, controller.uploadCV);
router.get('/cv/:filename', auth.isAuthenticated(), controller.getCV);
router.get('/export/all', auth.hasRole('admin'), controller.exportAll);
router.get('/export/accepted', auth.hasRole('admin'), controller.exportAccepted);
router.get('/export/visa', auth.hasRole('admin'), controller.exportVisaNeeded);
router.get('/export/pending', auth.hasRole('admin'), controller.exportPending);
router.post('/email/accepted', auth.hasRole('admin'), controller.emailAccepted);
router.post('/email/rejected', auth.hasRole('admin'), controller.emailRejected);
router.post('/email/unfinished', auth.hasRole('admin'), controller.emailUnfinished);
router.post('/email/everyone', auth.hasRole('admin'), controller.emailEveryone);
router.post('/email/custom', auth.hasRole('admin'), controller.emailCustom);

function checkOpenRegistrations(req, res, next) {
  if (config.registrationsOpen) {
    return next();
  }
  
  return res.send(500, {
    message: 'Unfortunately the registrations are closed. Follow us at @jacobs_hack to see when they open again.'
  });
}

module.exports = router;