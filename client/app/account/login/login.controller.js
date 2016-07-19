/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  LoginCtrl.$inject = ['Auth', '$location', '$window'];
  
  function LoginCtrl(Auth, $location, $window) {
    var vm = this;
    
    vm.user = {};
    vm.errors = {};
    
    Auth.isLoggedInAsync(function (loggedIn) {
      if (loggedIn) {
        $location.path('/');
      }
    });
    
    vm.login = function (form) {
      vm.submitted = true;
      
      if (form.$valid) {
        Auth.login({
          email: vm.user.email,
          password: vm.user.password
        }).then(function () {
          $location.path('/');
        }).catch(function (err) {
          vm.errors.other = err.message;
        });
      }
    };
    
    vm.loginOauth = function (provider) {
      $window.location.href = '/auth/' + provider;
    };
  }
  
  angular.module('jacobshackApp.account').controller('LoginCtrl', LoginCtrl);
})();