(function () {
'use strict';

  angular
    .module('app.setting')
    .controller('settingController', settingController);

  /** @ngInject */
  function settingController($scope, $rootScope, api, $stateParams, $mdDialog, $mdSidenav) 
  {
    alert('setting called');
   // var vm = this;
  //  vm.isLoader = true;
    // Content sub menu
    vm.submenu = [
      { link: 'folders', title: 'Projects', active : false },
      { link: 'groups', title: 'Workflows', active : false },
      { link: 'checklist', title: 'Checklists', active : false },
      { link: 'templates', title: 'Templates', active : false },
      { link: 'other', title: 'Other', active : true },
      { link: 'archives', title: 'Archives', active : false }
    ];


  }

})();
