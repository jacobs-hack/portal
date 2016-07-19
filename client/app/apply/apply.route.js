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
        url: '/apply',
        config: {
          templateUrl: 'app/apply/apply.html',
          controller: 'ApplyCtrl',
          controllerAs: 'vm',
          authenticate: true
        }
      }
    ];
  }
  
  angular.module('jacobshackApp.apply').config(configureRoutes);
})();