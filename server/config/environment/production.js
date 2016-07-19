'use strict';

// Production specific configuration
// =================================
module.exports = {
  // Server IP
  ip:       process.env.OPENSHIFT_NODEJS_IP ||
            process.env.IP ||
            undefined,

  // Server port
  port:     process.env.OPENSHIFT_NODEJS_PORT ||
            process.env.PORT ||
            8080,

  // MongoDB connection options
  mongo: {
    uri:    process.env.CUSTOMCONNSTR_MONGOLAB_URI ||
            process.env.MONGOLAB_URI ||
            process.env.MONGOHQ_URL ||
            process.env.OPENSHIFT_MONGODB_DB_URL+process.env.OPENSHIFT_APP_NAME ||
            'mongodb://localhost/jacobshack'
  },
  
  azure: {
    storage_account:    process.env.CUSTOMCONNSTR_AZURE_STORAGE_ACCOUNT || 
                        process.env.AZURE_STORAGE_ACCOUNT ||
                        '',
    storage_access_key: process.env.CUSTOMCONNSTR_AZURE_STORAGE_ACCESS_KEY || 
                        process.env.AZURE_STORAGE_ACCESS_KEY ||
                        '',
    appinsights:        process.env.CUSTOMCONNSTR_APPINSIGHTS_INSTRUMENTATIONKEY ||
                        process.env.APPINSIGHTS_INSTRUMENTATIONKEY ||
                        ''
  }
};