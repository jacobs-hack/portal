var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var OAuth = require('../../config/environment').OAuth;

exports.setup = function (User, config) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) return done(err);

        if (!user) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, user);
      });
    }
  ));

  passport.use(new facebookStrategy({
    clientID: OAuth.facebook.clientID,
    clientSecret: OAuth.facebook.clientSecret,
    callbackURL: OAuth.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, cb) {
      console.log(profile);
    }
  ));
};