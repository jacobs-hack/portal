var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var facebookStrategy = require('passport-facebook').Strategy;
var githubStrategy = require('passport-github2').Strategy;
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

  passport.serializeUser(function(user, done)
    {
      done(null, user);
    });
  passport.deserializeUser(function(obj, done){
    done(null, obj);
  });

  /* facebook strategy */
  passport.use(new facebookStrategy({
    clientID: OAuth.facebook.clientID,
    clientSecret: OAuth.facebook.clientSecret,
    callbackURL: OAuth.facebook.callbackURL,
    profileFields: ['id', 'displayName', 'email', 'first_name', 'last_name', 'middle_name']
    },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {

        User.findOne({'facebook.id': profile.id}, function(err, user){
          if (err) return done(err);

          if (user){
            return done(null, user);
          }
          // add new user
          var newUser = new User();

          newUser.facebook.id = profile.id;
          newUser.facebook.token = accessToken;
          newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
          newUser.facebook.email = profile.emails[0].value;
          newUser.provider = profile.provider;

          // save created user
          newUser.save(function(err){
            if(err)
              throw err;
          });

          return done(null, newUser);
          
        });

      });  
    }

  ));

  /* github strategy */
  passport.use(new githubStrategy({
      clientID: OAuth.github.clientID,
      clientSecret: OAuth.github.clientSecret,
      callbackURL: OAuth.github.callbackURL
      //profileFields: ['user:email']
    },
    function(accessToken, refreshToken, profile, done) {
      process.nextTick(function() {

        // console.log(profile.displayName + " " + profile.emails[0].value); 

        User.findOne({'github.id': profile.id}, function(err, user){
          if (err) return done(err);

          if (user) return done(null, user);

          // add new user
          var newUser = new User();

          newUser.github.id = profile.id;
          newUser.github.token = accessToken;
          newUser.github.name = profile.displayName;
          newUser.github.email = profile.emails[0].value;
          newUser.provider = profile.provider;

          // save created user
          newUser.save(function(err){
            if(err)
              throw err;
          });

          return done(null, newUser);
          
        });
      })
    }
  ));  

 
};