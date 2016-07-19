/// <reference path="../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  AdminCtrl.$inject = ['$http', '$rootScope', 'User', 'Auth'];
  
  function AdminCtrl($http, $rootScope, User, Auth) {
    var vm = this;
    
    vm.active = 'applications';
    vm.showSubmitted = true;
    
    if (Auth.isAdmin()) {
      $http.get('/api/users').success(function (users) {
        vm.users = users.data;
      });
      
      $http.get('/api/applications').success(function (applications) {
        applications = applications.data;
        vm.applications = applications;
        var pendingCount = 0;
        applications.forEach(function (application) {
          if (application.submitted === false) {
            pendingCount++;
          }
        });
        
        vm.numberPending = pendingCount;
        vm.numberSubmitted = applications.length - pendingCount;
        vm.numberTotal = applications.length;
      });
    }
    
    if (Auth.isSponsor() || Auth.isMainsponsor()) {
      $http.get('/api/applications/sponsors').success(function (applications) {
        vm.applications = applications.data;
        vm.sponsorView = true;
        vm.showSubmitted = true;
      });
    }
    
    vm.delete = function (user) {
      User.remove({
        id: user._id
      });
      
      angular.forEach(vm.users, function (u, i) {
        if (u._id === user._id) {
          vm.users.splice(i, 1);
        }
      });
    };
    
    vm.admin = function (user, index) {
      if (user.role !== 'admin') {
        User.makeAdmin({
          id: user._id
        }, {}, function (user) {
          vm.users[index].role = 'admin';
          $rootScope.showSuccess('New Admin appointed!');
        }, function (err) {
          $rootScope.showError(err.message);
        });
      } else {
        User.removeAdmin({}, {}, function (user) {
          vm.users[index].role = 'user';
          $rootScope.showInfo('Degraded back to user');
        }, function (err) {
          $rootScope.showError(err.message);
        });
      }
    };
    
    vm.accept = function (application, index) {
      $http.post('/api/applications/'+application.user._id+'/accept', {}).success(function (data) {
        vm.applications[index].status = 'accepted';
        $rootScope.showSuccess('Application of ' + application.user.name + ' Accepted!');
      }).error(function (data) {
        $rootScope.showError(data.message);
      });
    };
    
    vm.reject = function (application, index) {
      $http.post('/api/applications/'+application.user._id+'/reject', {}).success(function (data) {
        vm.applications[index].status = 'rejected';
        $rootScope.showWarning('Application of ' + application.user.name + ' Rejected!');
      }).error(function (data) {
        $rootScope.showError(data.message);
      });
    };
  }
  
  angular.module('jacobshackApp.admin').controller('AdminCtrl', AdminCtrl);
})();