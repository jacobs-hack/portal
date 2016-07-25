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
      process.nextTick(function() {

        User.findOne({'facebook.id': profile.id}, function(err, user){
          if (err) return done(err);

          if (user){
            return done(null, user);
          }
          else{
            // add new user
            var newUser = new User();

            newUser.facebook.id = profile.id;
            newUser.facebook.token = accessToken;
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            console.log(profile.email);
            console.log(profile.emails);
            // if (profile.emails !== "undefined") newUser.facebook.email = profile.emails[0].value;
            newUser.provider = 'facebook';

            // save created user
            newUser.save(function(err){
              if(err)
                throw err;
            });  
          }
        });

      });  

    }
  ));
};