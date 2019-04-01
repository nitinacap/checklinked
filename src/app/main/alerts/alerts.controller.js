(function () {

  'use strict';

  angular
    .module('app.alerts')
    .controller('alertsController', alertsController);

  /** @ngInject */
  function alertsController($scope) {
    var vm = this;

        // Content sub menu
        vm.submenu = [
          { link: '', title: 'Alerts' },
          { link: 'invitations', title: 'Action Items' },
          { link: 'chat.message', title: 'Messages' },
          { link: 'notification', title: 'Notifications' }
    
        ];
  }

})();
