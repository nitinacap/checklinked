(function () {

  'use strict';

  angular
    .module('app.alerts')
    .controller('alertsController', alertsController);

  /** @ngInject */
  function alertsController($scope,$rootScope) {
    var vm = this;

        // Content sub menu
          vm.submenu = [
          { link: '', title: 'Alerts' },
          { link: 'invitations', title: 'Action Items' },
          { link: 'chat.message', title: 'Messages', notification: $rootScope.message_count },
          { link: 'notification', title: 'Notifications', notification: $rootScope.notification_count }
        ];

        setTimeout(function () {
          $('.Communicate').addClass('communicate');
        }, 800);
  }

})();
