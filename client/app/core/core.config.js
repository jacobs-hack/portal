(function () {
  'use strict';
  
  configureToastr.$inject = ['toastr'];
  
  function configureToastr(toastr) {
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": true,
      "positionClass": "toast-bottom-right",
      "preventDuplicates": true,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "4000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    }
  }
  
  configure.$inject = ['$rootScope', '$location', 'Auth', 'toastr'];
  
  function configure($rootScope, $location, Auth, toastr) {
    $rootScope.globalAlert = {
      type: 'alert-info',
      show: false,
      title: 'Info:',
      message: 'Some blabla bla'
    };
    
    $rootScope.showMessage = function (type, title, message, time) {
      toastr.info(title, message)
    };
    
    $rootScope.showInfo = function (message, time) {
      toastr.info(message);
      // $rootScope.showMessage('alert-info', 'Info:', message, time);
    };
    
    $rootScope.showWarning = function (message, time) {
      toastr.warning(message);
      // $rootScope.showMessage('alert-warning', 'Warning:', message, time);
    };
    
    $rootScope.showError = function (message, time) {
      toastr.error(message);
      // $rootScope.showMessage('alert-danger', 'Error:', message, time);
    };
    
    $rootScope.showSuccess = function (message, time) {
      toastr.success(message);
      // $rootScope.showMessage('alert-success', 'Success:', message, time);
    };
    
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function (loggedIn) {
        if (next.authenticated && !loggedIn) {
          $location.path('/login');
        }
        
        if (next.adminOnly && !Auth.isAdmin()) {
          $location.path('/');
        }
        
        if (next.restricted && !(Auth.isAdmin() || Auth.isSponsor() || Auth.isMainsponsor())) {
          $location.path('/');
        }
      });
    });
  }
  
  configureAppInsights.$inject = ['applicationInsightsServiceProvider'];
  function configureAppInsights (applicationInsightsServiceProvider) {
    var options = {
      applicationName: 'my-jacobshack'
    };
    
    applicationInsightsServiceProvider.configure('3b98cb6a-9f02-4079-9053-4bdba7534433', options);
  }
  
  angular.module('jacobshackApp.core').config(configureToastr).config(configureAppInsights).run(configure);
})();