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
router.use('/facebook', passport.authenticate('facebook', { scope: 'email', session:false}));

/* facebook callback function*/
router.use('/facebook/callback', passport.authenticate('facebook', 
	{
	 successRedirect: '/', 	
	 failureRedirect: '/login' 
	}));

/* github auth*/
router.use('/github', passport.authenticate('github', {scope: ['user', 'user:email']}));

/* github callback */
router.use('/github/callback', passport.authenticate('github', {
	successRedirect: '/',
	failureRedirect: '/login'
}));

module.exports = router;