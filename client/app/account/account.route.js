(function () {
  'use strict';
  
  angular.module('jacobshackApp.account').config(configureRoutes);
  
  configureRoutes.$inject = ['$routeProvider'];
  
  function configureRoutes($routeProvider) {
    var routes = getRoutes();
    routes.forEach(function (route) {
      $routeProvider.when(route.url, route.config);
    });
  }
  
  function getRoutes() {
    return [
      {
        url: '/login',
        config: {
          templateUrl: 'app/account/login/login.html',
          controller: 'LoginCtrl',
          controllerAs: 'vm'
        }
      },
      {
        url: '/signup',
        config: {
          templateUrl: 'app/account/signup/signup.html',
          controller: 'SignupCtrl',
          controllerAs: 'vm'
        }
      },
      {
        url: '/settings',
        config: {
          templateUrl: 'app/account/settings/settings.html',
          controller: 'SettingsCtrl',
          authenticate: true,
          controllerAs: 'vm'
        }
      }
    ]
  }
})();