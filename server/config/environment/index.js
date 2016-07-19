'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if(!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: path.normalize(__dirname + '/../../..'),

  // Server port
  port: process.env.PORT || 9000,

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: process.env.SESSION_SECRET || process.env.APPSETTING_SESSION_SECRET || 'jacobshack-secret'
  }, 
  
  registrationsOpen: stringToBoolean(process.env.REGISTRATIONS_OPEN || process.env.APPSETTING_REGISTRATIONS_OPEN || 'true'),

  // List of user roles
  userRoles: ['guest', 'user', 'admin'],

  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  },
  zoho: {
    password: process.env.ZOHO_PW || process.env.CUSTOMCONNSTR_ZOHO_PW || '',
    email: process.env.ZOHO_EMAIL || process.env.APPSETTING_ZOHO_EMAIL || 'noreply@jacobshack.com'
  }
};


function stringToBoolean(str) {
  return str.toLowerCase() === 'true';
}

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./' + process.env.NODE_ENV + '.js') || {});