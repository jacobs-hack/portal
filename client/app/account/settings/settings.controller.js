/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  SettingsCtrl.$inject = ['$http', '$rootScope', '$location', 'User', 'Auth'];
  
  function SettingsCtrl($http, $rootScope, $location, User, Auth) {
    var vm = this;
    
    vm.errors = {};
    
    vm.changePassword = function (form) {
      vm.submitted = true;
      
      if (form.$valid) {
        Auth.changePassword(vm.user.oldPassword, vm.user.newPassword).then(function () {
          $rootScope.showSuccess('Password updated!');
        }).catch(function () {
          form.password.$setValidity('mongoose', false);
          vm.errors.other = 'Incorrect password';
          vm.message = '';
          $rootScope.showError('Incorrect password!');
        });
      }
    };
    
    vm.delete = function () {
      $http.delete('/api/users/me').success(function (data, status, headers, config) {
        $rootScope.showSuccess(data.message);
      }).error(function (data, status, headers, config) {
        $rootScope.showError(data.message);
      }); 
    };
  }
  
  angular.module('jacobshackApp.account').controller('SettingsCtrl', SettingsCtrl);
})();