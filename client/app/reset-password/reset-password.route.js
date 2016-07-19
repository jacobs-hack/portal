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
        url: '/reset-password/:id',
        config: {
          templateUrl: 'app/reset-password/reset-password.html',
          controller: 'ResetPasswordCtrl',
          controllerAs: 'vm'
        }
      }
    ];
  }
  
  angular.module('jacobshackApp.resetPassword').config(configureRoutes);
})();