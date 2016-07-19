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
        url: '/admin/email',
        config: {
          templateUrl: 'app/email/email.html',
          controller: 'EmailCtrl',
          controllerAs: 'vm',
          authenticate: true,
          restricted: true
        }
      }
    ];
  }
  
  angular.module('jacobshackApp.email').config(configureRoutes);
})();