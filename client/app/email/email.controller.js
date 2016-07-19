/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  EmailCtrl.$inject = ['$scope', '$http', '$location', '$rootScope', '$upload', '$timeout', 'Auth', '$log'];
  
  function EmailCtrl($scope, $http, $location, $rootScope, $upload, $timeout, Auth, $log) {
    var vm = this;
    
    vm.sendEmail = function () {
      var requestBody = {
        content: vm.content,
        subject: vm.subject
      };
      
      var requestUrl = '/api/applications/email/' + vm.type;
      
      $http.post(requestUrl, requestBody).success(function (data, status, headers, config) {
        $rootScope.showSuccess(data.message);
      }).error(function (data, status, headers, config) {
        $rootScope.showError(data.message);
      });
    }
  }
  
  angular.module('jacobshackApp.email').controller('EmailCtrl', EmailCtrl);
})();