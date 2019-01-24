(function () {
  'use strict';

  angular
    .module('app.usersetting')
    .controller('UserSettingController', UserSettingController)

  /** @ngInject */
  function UserSettingController($rootScope, $mdDialog, $cookies, $document, $stateParams, $state, $http, $scope, api, $mdSidenav) {
    var vm = this;
    vm.twoFactorLogin = twoFactorLogin;
    vm.isLoader = false;


    function twoFactorLogin() {
      vm.isLoader = true;
      $http.post(BASEURL +'setting.php', {
        type: 'twoFacror',
        user_id: $cookies.get("useridCON"),
        token: $cookies.get("token")

      }, {headers: {'Content-Type': 'application/x-www-form-urlencoded' },
        cache: false
      }).success(function (res) {
        vm.isLoader = false;
        if(res.code==1){
           $scope.errtoken =  res.message
        }
        else if(res.code==0){
        $scope.successtoken = "Two factoe login has been updated successfully";
        }
      }).error(function (res) {
        $scope.errtoken = res.message;
  
      })
    }

    vm.submenu = [
      { link: '', title: 'My Profile' },
      { link: 'contacts', title: 'Contacts' },
      { link: 'organization', title: 'Organization' },
      { link: 'account', title: 'Account' }
    ];


  };






})();
