(function () {
  'use strict';

  angular
    .module('app.reports')
    .controller('ReportController', ReportController)

  /** @ngInject */
  function ReportController($cookies, $mdDialog, api, $scope, $rootScope) {

    var vm = this;
    vm.closeDialog = closeDialog;



      // $mdDialog.show({
      //   scope: $scope,
      //   preserveScope: true,
      //   templateUrl: 'app/main/teammembers/dialogs/subscription-alert.html',
      //   clickOutsideToClose: false
      // });


    function closeDialog() {
      $mdDialog.hide();
    }


    function readReports(id, key) {
      var key = key ? key : '';
      return api.notifications.read(id, 'notification-read').success(function (resp) {
        if (resp) {
          vm.isLoader = false;
          if (resp.code == '-1') {
          } else {


          }


        }
      })

    };

    readReports();

    // Content sub menu
    vm.submenu = [
      { link: 'summary', title: 'Issues' },
      { link: 'schedule', title: 'Schedules' },
      { link: '', title: 'Reports' },
      { link: 'dashboard', title: 'Dashboard' }
  ];


    $('.Communicate').addClass('communicate');
    $('.Analyze').removeClass('analyze');
    $('.Process').removeClass('opacity1');

  }


})();
