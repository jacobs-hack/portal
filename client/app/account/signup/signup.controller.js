/// <reference path="../../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  SignupCtrl.$inject = ['Auth', '$location', '$window'];
  
  function SignupCtrl(Auth, $location, $window) {
    var vm = this;
    
    vm.user = {
      email: ''
    };
    
    vm.errors = {};
    
    vm.register = function (form) {
      vm.submitted = true;
      
      if (form.$valid && vm.user.password === vm.confirmPassword) {
        Auth.createUser({
          name: vm.user.name,
          email: vm.user.email,
          password: vm.user.password
        }).then(function () {
          $location.path('/');
        }).catch(function (err) {
          err = err.data;
          vm.errors = {};
          
          angular.forEach(err.errors, function (error, field) {
            form[field].$setValidity('mongoose', false);
            vm.errors[field] = error.message;
          });
        });
      }
    };
    
    vm.loginOauth = function (provider) {
      $window.location.href = '/auth/' + provider;
    };
  }
  
  angular.module('jacobshackApp.account').controller('SignupCtrl', SignupCtrl);
})();