'use strict';

// Test specific configuration
// ===========================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/jacobshack-test'
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