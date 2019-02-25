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
      { link: 'folders', title: 'Projects' },
      { link: '', title: 'Workflows' },
      { link: 'checklist', title: 'Checklists' },
      { link: 'templates', title: 'Templates' },
      { link: 'other', title: 'Other' },
      { link: 'archives', title: 'Archives' }
    ];


  }

})();
