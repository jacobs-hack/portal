'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config/environment');
var User = require('../api/user/user.model');

// Passport Configuration
require('./local/passport').setup(User, config);

var router = express.Router();

router.use('/local', require('./local'));

/* facebook auth */
router.use('/facebook', passport.authenticate('facebook', { scope: 'email'}));

/* callback function*/
router.use('/facebook/callback', passport.authenticate('facebook', 
	{
	 successRedirect: '/', 	
	 failureRedirect: '/login' 
	}));

module.exports = router;