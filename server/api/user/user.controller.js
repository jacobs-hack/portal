'use strict';

var User = require('./user.model');
var Application = require('../application/application.model');
var passport = require('passport');
var request = require('request');
var config = require('../../config/environment');
var FileSystem = require('../../components/filesystem');
var jwt = require('jsonwebtoken');
var md5 = require('md5');
var fs = require('fs');
var path = require('path');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, {data: users});
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

exports.deleteMe = function (req, res) {
  var userId = req.user._id;
  Application.findOne({'user': userId}, function (err, application) {
    if (err) return handleError(res, err);
    if (application) {
      var filename = userId + '.pdf';
      application.remove(function (err, application) {
        if (err) return handleError(res, err);
        FileSystem.deleteFileIfExists(filename, 'cvs', function (err) {
          if (err) return handleError(res, err);
          User.findByIdAndRemove(userId, function(err, user) {
            if(err) return res.send(500, err);
            return res.send(200, {message: 'User deleted!'});
          });
        });
      });
    } else {
      User.findByIdAndRemove(userId, function(err, user) {
        if(err) return res.send(500, err);
        return res.send(200, {message: 'User deleted!'});
      });
    }
  });
}

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  var userId = req.params.id;
  Application.findOne({'user': userId}, function (err, application) {
    if (err) return handleError(res, err);
    if (application) {
      var filename = userId + '.pdf';
      application.remove(function (err, application) {
        if (err) return handleError(res, err);
        FileSystem.deleteFileIfExists(filename, 'cvs', function (err) {
          if (err) return handleError(res, err);
          User.findByIdAndRemove(userId, function(err, user) {
            if(err) return res.send(500, err);
            return res.send(200, {message: 'User deleted!'});
          });
        });
      });
    } else {
      User.findByIdAndRemove(userId, function(err, user) {
        if(err) return res.send(500, err);
        return res.send(200, {message: 'User deleted!'});
      });
    }
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

exports.makeAdmin = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId, function (err, user) {
    if (err) { return res.send(500, err); }
    if (!user) { return res.send(404, {error: 'UNKNOWN', message: 'User not found'}); }
    user.role = 'admin';
    user.save(function (err) {
      if (err) { return res.send(500, err); }
      return res.send(200);
    })
  });
}

exports.removeAdmin = function (req, res, next) {
  var userId = req.params.id;
  User.findById(userId, function (err, user) {
    if (err) { return res.send(500, err); }
    if (!user) { return res.send(404, {error: 'UNKNOWN', message: 'User not found'}); }
    user.role = 'user';
    user.save(function (err) {
      if (err) { return res.send(500, err); }
      return res.send(200);
    })
  });
}

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};

/**
 * Gravatar forward
 */
exports.gravatar = function (req, res, next) {
  var email = req.params.email ? req.params.email : 'foo';
  var hash = md5(email.trim().toLowerCase());
  var size = req.query.s ? req.query.s : 500;
  var url = 'https://secure.gravatar.com/avatar/'+hash+'?s='+size;
  request.get(url).pipe(res);
};

function handleError(res, err) {
  return res.send(500, err);
}