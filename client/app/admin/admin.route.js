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
        url: '/admin',
        config: {
          templateUrl: 'app/admin/admin.html',
          controller: 'AdminCtrl',
          controllerAs: 'vm',
          authenticate: true,
          restricted: true
        }
      }
    ];
  }
  
  angular.module('jacobshackApp.admin').config(configureRoutes);
})();