(function () {
  'use strict';
  
  var app = angular.module('jacobshackApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ui.bootstrap',
    'ApplicationInsightsModule',
    'angularFileUpload',
    'jacobshackApp.core',
    'jacobshackApp.account',
    'jacobshackApp.admin',
    'jacobshackApp.apply',
    'jacobshackApp.email',
    'jacobshackApp.forgotPassword',
    'jacobshackApp.resetPassword'
  ]);
  
})();