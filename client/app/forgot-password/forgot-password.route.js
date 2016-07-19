(function () {
  'use strict';
  
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
        url: '/forgot-password',
        config: {
          templateUrl: 'app/forgot-password/forgot-password.html',
          controller: 'ForgotPasswordCtrl',
          controllerAs: 'vm'
        }
      }
    ];
  }
  
  angular.module('jacobshackApp.forgotPassword').config(configureRoutes);
})();