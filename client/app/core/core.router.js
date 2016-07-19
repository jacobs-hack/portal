/// <reference path="../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  configureRoutes.$inject = ['$routeProvider', '$locationProvider', '$httpProvider'];
  function configureRoutes($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.otherwise({
      redirectTo: '/apply'
    });
    
    $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  }
  
  angular.module('jacobshackApp.core').config(configureRoutes);
})();