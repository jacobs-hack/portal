/// <reference path="../../../typings/jquery/jquery.d.ts"/>
/// <reference path="../../../typings/angularjs/angular.d.ts"/>
(function () {
  'use strict';
  
  ApplyCtrl.$inject = ['$scope', '$http', '$location', '$rootScope', '$upload', '$timeout', 'Auth', '$log'];
  
  function ApplyCtrl($scope, $http, $location, $rootScope, $upload, $timeout, Auth, $log) {
    var vm = this;
    
    var saveTimeout = null;
    
    $log.warn('EXAMPLE WARN');
    
    vm.active = 'info';
    vm.fileSelected = false;
    vm.progressCvUpload = 0;
    vm.conditionsAccepted = false;
    vm.codeOfConductAccepted = false;
    vm.additionalInformation = {
      shirt: {}
    };
    vm.cvUploaded = false;
    vm.personalInformation = {
      name: Auth.getCurrentUser().name,
      email: Auth.getCurrentUser().email,
      address: {},
      profiles: {}
    };
    vm.userId = Auth.getCurrentUser()._id;
    vm.newApplication = true;
    vm.loadDataFromServer = false;
    
    $http.get('/api/applications/me').success(function (data, status, headers, config) {
      vm.loadDataFromServer = true;
      vm.personalInformation = data.personalInformation;
      vm.newApplication = !data.submitted;
      vm.cvUploaded = !!data.cvUploaded;
      vm.personalInformation.name = vm.personalInformation.name || Auth.getCurrentUser().name;
      vm.personalInformation.email = vm.personalInformation.email || Auth.getCurrentUser().email;
      vm.personalInformation.visaNeeded = vm.personalInformation.visaNeeded || false;
      vm.additionalInformation = data.additionalInformation;
      vm.additionalInformation.shirt = vm.additionalInformation.shirt || {};
      vm.additionalInformation.careerloft = vm.additionalInformation.careerloft || false;
      vm.conditionsAccepted = data.conditionsAccepted;
      vm.codeOfConductAccepted = data.codeOfConductAccepted;
      
      if (data.additionalInformation && 
          data.additionalInformation.teammates && 
          data.additionalInformation.teammates.length !== 0) {
        vm.teammate1 = data.additionalInformation.teammates[0] || null;
        vm.teammate2 = data.additionalInformation.teammates[1] || null;
        vm.teammate3 = data.additionalInformation.teammates[2] || null;
      } 
      
      vm.progressCvUpload = vm.cvUploaded ? 100 : 0;
      
      if (!vm.newApplication) {
        vm.setActive('profile');
        vm.part1Submitted = true;
        vm.part2Submitted = true;
        vm.part3Submitted = true;
      }
      
      vm.userId = Auth.getCurrentUser()._id;
      vm.lastSaved = data.lastSaved;
    }).error(function (data, status, header, config) {
      return;
    });
    
    function saveData(fromClick) {
      vm.loadDataFromServer = vm.loadDataFromServer ? false : vm.loadDataFromServer;
      
      if (vm.active === 'profile' && $scope.standardForm.$invalid && fromClick) {
        $rootScope.showError('Please make sure you filled out all fields appropriately.');
      }
      
      if (vm.active === 'additionalInfo' && $scope.additionalForm.$invalid && fromClick) {
        $rootScope.showError('Please make sure you filled out all fields appropriately.');
      }
      
      vm.saving = true;
      
      var application = {
        personalInformation: JSON.parse(angular.toJson(vm.personalInformation)),
        additionalInformation: JSON.parse(angular.toJson(vm.additionalInformation)),
        conditionsAccepted: JSON.parse(angular.toJson(vm.conditionsAccepted)),
        codeOfConductAccepted: JSON.parse(angular.toJson(vm.codeOfConductAccepted))
      };
      application.additionalInformation.teammates = [vm.teammate1, vm.teammate2, vm.teammate3];
      
      $http.post('/api/applications/me/save', { 
        application: application 
      }).success(function (data, status, headers, config) {
        vm.lastSaved = data.lastSaved;
        vm.saving = false;
      }).error(function (data, status, headers, config) {
        $rootScope.showError(data.message);
      });
    };
    
    function validateData(form, field) {
      return function (oldVal, newVal) {
        var validationCheckField = vm[form] ? vm[form][field] : null;
        if (oldVal === newVal) {
          return;
        } 
        if (!((validationCheckField != null ? validationCheckField.$valid : void 0) || validationCheckField === null)) {
          return;
        }
        
        if (saveTimeout) {
          $timeout.cancel(saveTimeout);
        }
        saveTimeout = $timeout(saveData, 1000);
        return;
      };
    };
    
    $scope.$watch('vm.personalInformation.university', validateData('standardForm', 'university'));
    $scope.$watch('vm.personalInformation.birthday', validateData('standardForm', 'birthday'));
    $scope.$watch('vm.personalInformation.address.street', validateData('standardForm', 'street'));
    $scope.$watch('vm.personalInformation.address.zip', validateData('standardForm', 'postal'));
    $scope.$watch('vm.personalInformation.address.city', validateData('standardForm', 'city'));
    $scope.$watch('vm.personalInformation.address.state', validateData('standardForm', 'state'));
    $scope.$watch('vm.personalInformation.address.country', validateData('standardForm', 'country'));
    $scope.$watch('vm.personalInformation.profiles.facebook', validateData(null));
    $scope.$watch('vm.personalInformation.profiles.twitter', validateData(null));
    $scope.$watch('vm.personalInformation.profiles.github', validateData(null));
    $scope.$watch('vm.personalInformation.profiles.googleplus', validateData(null));
    $scope.$watch('vm.personalInformation.profiles.linkedin', validateData(null));
    $scope.$watch('vm.personalInformation.phone', validateData('standardForm', 'phone'));
    $scope.$watch('vm.personalInformation.nationality', validateData('standardForm', 'nationality'));
    $scope.$watch('vm.personalInformation.visaNeeded', validateData(null));
    $scope.$watch('vm.additionalInformation.discipline', validateData('additionalForm', 'expertise'));
    $scope.$watch('vm.additionalInformation.whereDidYouHear', validateData('additionalForm', 'wheredidyouhear'));
    $scope.$watch('vm.additionalInformation.previousHackathons', validateData('additionalForm', 'experience'));
    $scope.$watch('vm.additionalInformation.coolProjects', validateData('additionalForm', 'projects'));
    $scope.$watch('vm.additionalInformation.shirt.size', validateData('additionalForm', 'shirtsize'));
    $scope.$watch('vm.additionalInformation.shirt.type', validateData('additionalForm', 'shirttype'));
    $scope.$watch('vm.additionalInformation.careerloft', validateData(null));
    $scope.$watch('vm.additionalInformation.dietaryRestrictions', validateData('additionalForm', 'restrictions'));
    $scope.$watch('vm.additionalInformation.remarks', validateData(null));
    $scope.$watch('vm.teammate1', validateData(null));
    $scope.$watch('vm.teammate2', validateData(null));
    $scope.$watch('vm.teammate3', validateData(null));
    
    vm.save = function () {
      saveData(true);
    };
    
    vm.setActive = function (value) {
      vm.active = value;
      scrollTo(0, 0);
    }
    
    vm.openPicker = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      
      vm.pickerOpened = true;
    };
    
    vm.openFileDialogWindow = function () {
      $('#cvUploadFile').click();
      return;
    };
    
    vm.onFileSelect = function ($files) {
      if (Array.isArray($files) && $files.length > 0) {
        vm.cvFile = $files[0];
      } else {
        vm.cvFile = $files;
      }
      
      if (vm.cvFile.size > 5000000) {
        vm.showFileError();
        return;
      }
      
      if (vm.cvFile.type !== 'application/pdf') {
        vm.showFileError();
        return;
      }
      
      vm.cvFileName = vm.cvFile.name;
      vm.fileSelected = true;
    };
    
    vm.agreeTermsAndUpload = function () {
      $('#legalModal').modal('hide');
      vm.progressCvUpload = 0;
      vm.$uploadCV = $upload.upload({
        url: '/api/applications/cv',
        method: 'POST',
        file: vm.cvFile
      }).then(function (res) {
        vm.fileUploaded(res);
      }, null, function (evt) {
        vm.progressCvUpload = 100.0 * evt.loaded / evt.total;
      });
    };
    
    vm.fileUploaded = function (res) {
      $rootScope.showSuccess('CV file has been uploaded!');
      vm.cvUploaded = true;
    };
    
    vm.showFileError = function () {
      $rootScope.showError('Your file needs to be smaller than 5MB and a PDF file. If this error occurs multiple times please try Chrome.');
    };
    
    vm.submitApplication = function () {
      var application = {
        personalInformation: JSON.parse(angular.toJson(vm.personalInformation)),
        additionalInformation: JSON.parse(angular.toJson(vm.additionalInformation)),
        conditionsAccepted: JSON.parse(angular.toJson(vm.conditionsAccepted)),
        codeOfConductAccepted: JSON.parse(angular.toJson(vm.codeOfConductAccepted)),
        submitted: !JSON.parse(angular.toJson(vm.newApplication))
      };
      application.additionalInformation.teammates = [vm.teammate1, vm.teammate2, vm.teammate3];
      
      $http.post('/api/applications/me', {
        application: application
      }).success(function (data, status, headers, config) {
        if (vm.newApplication) {
          $rootScope.showSuccess('You successfully applied for jacobsHack! Fall 2015.');
        } else {
          $rootScope.showSuccess('Your application has been successfully updated.');
        }
        vm.active = 'info';
      }).error(function (data, status, headers, config) {
        $rootScope.showError(data.message);
      });
    };
    
    vm.showLegal = function () {
      vm.readTerms = true;
      $('#legalModal').modal('show');
    };
    
    vm.showLegalForUpload = function () {
      vm.readTerms = false;
      $('#legalModal').modal('show');
    };
    
    vm.disagreeTerms = function () {
      vm.readTerms = false;
      $('#legalModal').modal('hide');
    };
    
    vm.submitPart1 = function (form) {
      vm.part1Submitted = true;
      if (form.$invalid) {
        $rootScope.showError('Please make sure you filled out all fields appropriately');
      } else {
        vm.setActive('additionalInfo');
      }
    };
    
    vm.submitPart2 = function (form) {
      vm.part2Submitted = true;
      if (form.$invalid) {
        $rootScope.showError('Please make sure you filled out all fields appropriately');
      } else {
        vm.setActive('cvUpload');
      }
    };
    
    vm.submitPart3 = function (form) {
      vm.part3Submitted = true;
      if (form.$invalid) {
        $rootScope.showError('Please make sure you uploaded a CV before advancing.');
      } else {
        vm.setActive('submit');
      }
    };
    
    vm.navigate = function (negcondition, path) {
      if (!negcondition) {
        vm.setActive(path);
      }
    }
    
    var countries = "Afghanistan;Akrotiri;Albania;Algeria;American Samoa;Andorra;Angola;Anguilla;Antarctica;Antigua and Barbuda;Argentina;Armenia;Aruba;Ashmore and Cartier Islands;Australia;Austria;Azerbaijan;Bahamas, The;Bahrain;Bangladesh;Barbados;Bassas da India;Belarus;Belgium;Belize;Benin;Bermuda;Bhutan;Bolivia;Bosnia and Herzegovina;Botswana;Bouvet Island;Brazil;British Indian Ocean Territory;British Virgin Islands;Brunei;Bulgaria;Burkina Faso;Burma;Burundi;Cambodia;Cameroon;Canada;Cape Verde;Cayman Islands;Central African Republic;Chad;Chile;China;Christmas Island;Clipperton Island;Cocos (Keeling) Islands;Colombia;Comoros;Congo, Democratic Republic of the;Congo, Republic of the;Cook Islands;Coral Sea Islands;Costa Rica;Cote d'Ivoire;Croatia;Cuba;Cyprus;Czech Republic;Denmark;Dhekelia;Djibouti;Dominica;Dominican Republic;Ecuador;Egypt;El Salvador;Equatorial Guinea;Eritrea;Estonia;Ethiopia;Europa Island;Falkland Islands (Islas Malvinas);Faroe Islands;Fiji;Finland;France;French Guiana;French Polynesia;French Southern and Antarctic Lands;Gabon;Gambia, The;Gaza Strip;Georgia;Germany;Ghana;Gibraltar;Glorioso Islands;Greece;Greenland;Grenada;Guadeloupe;Guam;Guatemala;Guernsey;Guinea;Guinea-Bissau;Guyana;Haiti;Heard Island and McDonald Islands;Holy See (Vatican City);Honduras;Hong Kong;Hungary;Iceland;India;Indonesia;Iran;Iraq;Ireland;Isle of Man;Israel;Italy;Jamaica;Jan Mayen;Japan;Jersey;Jordan;Juan de Nova Island;Kazakhstan;Kenya;Kiribati;Korea, North;Korea, South;Kuwait;Kyrgyzstan;Laos;Latvia;Lebanon;Lesotho;Liberia;Libya;Liechtenstein;Lithuania;Luxembourg;Macau;Macedonia;Madagascar;Malawi;Malaysia;Maldives;Mali;Malta;Marshall Islands;Martinique;Mauritania;Mauritius;Mayotte;Mexico;Micronesia, Federated States of;Moldova;Monaco;Mongolia;Montserrat;Morocco;Mozambique;Namibia;Nauru;Navassa Island;Nepal;Netherlands;Netherlands Antilles;New Caledonia;New Zealand;Nicaragua;Niger;Nigeria;Niue;Norfolk Island;Northern Mariana Islands;Norway;Oman;Pakistan;Palau;Panama;Papua New Guinea;Paracel Islands;Paraguay;Peru;Philippines;Pitcairn Islands;Poland;Portugal;Puerto Rico;Qatar;Reunion;Romania;Russia;Rwanda;Saint Helena;Saint Kitts and Nevis;Saint Lucia;Saint Pierre and Miquelon;Saint Vincent and the Grenadines;Samoa;San Marino;Sao Tome and Principe;Saudi Arabia;Senegal;Serbia and Montenegro;Seychelles;Sierra Leone;Singapore;Slovakia;Slovenia;Solomon Islands;Somalia;South Africa;South Georgia and the South Sandwich Islands;Spain;Spratly Islands;Sri Lanka;Sudan;Suriname;Svalbard;Swaziland;Sweden;Switzerland;Syria;Taiwan;Tajikistan;Tanzania;Thailand;Timor-Leste;Togo;Tokelau;Tonga;Trinidad and Tobago;Tromelin Island;Tunisia;Turkey;Turkmenistan;Turks and Caicos Islands;Tuvalu;Uganda;Ukraine;United Arab Emirates;United Kingdom;United States;Uruguay;Uzbekistan;Vanuatu;Venezuela;Vietnam;Virgin Islands;Wake Island;Wallis and Futuna;West Bank;Western Sahara;Yemen;Zambia;Zimbabwe";
    vm.countries = countries.split(';');
  }
  
  angular.module('jacobshackApp.apply').controller('ApplyCtrl', ApplyCtrl);
})();