(function () {
  'use strict';

  angular
    .module('app.notification')
    .controller('NotificationController', NotificationController)

  /** @ngInject */
  function NotificationController($rootScope, $stateParams, $http, $scope, api, $mdSidenav) {

    var vm = this;

        // Content sub menu
        vm.submenu = [
          { link: '#', title: 'Alerts' },
          { link: 'invitations', title: 'Action Items' },
          { link: 'chat', title: 'Messages' },
          { link: '', title: 'Notifications' }
    
        ];

  };






})();
