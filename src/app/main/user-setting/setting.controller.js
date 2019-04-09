(function () {
  'use strict';

  angular
    .module('app.usersetting')
    .controller('UserSettingController', UserSettingController)

  /** @ngInject */
  function UserSettingController($rootScope, api) {
    var vm = this;
    vm.twoFactorLogin = twoFactorLogin;
    vm.isLoader = false;
    if($rootScope.userData){
      vm.setting = { twoFactor:$rootScope.userData.two_step ? true : ''};
    }


    function twoFactorLogin() {
      vm.isLoader = true;
      return api.account.setting(vm.setting.twoFactor ? 1 : 0,'setting').error(function (res) {
        return $rootScope.message('Server not responsing properly.', 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if(res.type=='success')
         $rootScope.message('Two factor setting changed successfully', 'success');
      });

    }

    vm.submenu = [
      { link: '', title: 'My Profile' },
      { link: 'contacts', title: 'Contacts' },
      { link: 'organization', title: 'Organization' },
      { link: 'account', title: 'Account' }
    ];


  };






})();
