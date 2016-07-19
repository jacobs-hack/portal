'use strict';

var _ = require('lodash');
var Request = require('./request.model');
var User = require('../user/user.model');
var email = require('../../utils/email');


// Get a single request
exports.show = function(req, res) {
  Request.findById(req.params.id, function (err, request) {
    if(err) { return handleError(res, err); }
    if(!request) { return res.send(404); }
    return res.json({_id: request._id});
  });
};

// Creates a new request in the DB.
exports.create = function(req, res) {
  var emailAddress = String(req.body.email);
  User.findOne({'email': emailAddress}, function (err, user) {
    if (err) { return handleError(res, err); }
    if(!user) { return res.send(404); }
    var request = {};
    request.email = user.email;
    request.user = user._id;
    request.createdAt = new Date(Date.now());
    Request.create(request, function (err, request) {
      if (err) { return handleError(res, err); }
      email.send(user.email, 'Password Request', email.TEMPLATES.forgotten(email, request._id), function (err, info) {
        if (err) {
          return res.send(500, {error:'ERRNOEMAILSENT', message: 'No email could be sent.'});
        }
        return res.send(200, {message: 'Password reset link was sent to your email. It was 30 minutes valid.'});
      });
    });
  });
};

// Updates an existing request in the DB.
exports.update = function(req, res) {
  Request.findById(req.params.id, function (err, request) {
    if (err) { return handleError(res, err); }
    if(!request) { return res.send(404); }
    User.findById(request.user, function (err, user) {
      if (err) { return handleError(res, err); }
      if(!user) { return res.send(404); }
      user.password = String(req.body.newPassword);
      user.save(function (err) {
        if (err) { return handleError(res, err); }
        res.send(200, {message: 'Your new password was successfully set. Please log in now.'});
        request.remove(function (err, request) {});
      });
    });
  });
};

function handleError(res, err) {
  return res.send(500, err);
}