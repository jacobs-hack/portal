/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  ResetPasswordCtrl.$inject = ['$http', '$rootScope', '$routeParams', '$location', 'User', 'Auth'];
  
  function ResetPasswordCtrl($http, $rootScope, $routeParams, $location, User, Auth) {
    var vm = this;
    
    vm.errors = {};
    vm.changePassword = changePassword;
    
    function changePassword(form) {
      if (form.$valid) {
        var url = '/api/request/' + $routeParams.id;
        $http.post(url, {
          newPassword: vm.newPassword
        }).success(function (data, status, headers, config) {
          $rootScope.showSuccess(data.message);
          $location.path('/login');
        }).error(function (data, status, headers, config) {
          $rootScope.showError(data.message);
        });
      }
    }
  }
  
  angular.module('jacobshackApp.resetPassword').controller('ResetPasswordCtrl', ResetPasswordCtrl);
})();