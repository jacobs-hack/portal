/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  ForgotPasswordCtrl.$inject = ['$http', '$rootScope', '$routeParams', '$location', 'User', 'Auth'];
  
  function ForgotPasswordCtrl($http, $rootScope, $routeParams, $location, User, Auth) {
    var vm = this;
    var defaultButtonMessage = 'Request Password Reset';
    
    vm.errors = {};
    vm.active = false;
    vm.requestButtonMessage = defaultButtonMessage;
    vm.forgotPassword = forgotPassword;
    
    function forgotPassword(form) {
      if (form.$valid) {
        $('#requestButton').addClass('active').html('Requesting Password Reset...');
        vm.active = true;
        vm.requestButtonMessage = 'Requesting Password Reset...';
        $http.post('/api/request', {
          email: vm.email
        }).success(function (data, status, headers, config) {
          vm.active = false;
          vm.requestButtonMessage = defaultButtonMessage;
          $rootScope.showSuccess(data.message); 
        }).error(function (data, status, headers, config) {
          vm.active = false;
          vm.requestButtonMessage = defaultButtonMessage;
          $rootScope.showError(data.message);
        });
      }
    }
  }
  
  angular.module('jacobshackApp.forgotPassword').controller('ForgotPasswordCtrl', ForgotPasswordCtrl);
})();