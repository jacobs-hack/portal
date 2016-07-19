(function () {
  'use strict';
  
  authInterceptor.$inject = ['$rootScope', '$q', '$cookieStore', '$location'];
  function authInterceptor($rootScope, $q, $cookieStore, $location) {
    return {
      request: function (config) {
        if (config.url === 'https://dc.services.visualstudio.com/v2/track') {
          // no auth headers
          return config;
        }
        config.headers = config.headers || {};
        if ($cookieStore.get('token')) {
          config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },
      responseError: function (response) {
        if (response.status === 401) {
          $location.path('/login');
          $cookieStore.remove('token');
        }
        
        return $q.reject(response);
      }
    }
  }
  
  angular.module('jacobshackApp.core').factory('authInterceptor', authInterceptor);
})();