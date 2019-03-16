(function () {
  'use strict';

  angular
    .module('app.notification')
    .controller('NotificationController', NotificationController)

  /** @ngInject */
  function NotificationController($cookies, $mdDialog, api, $scope) {

    var vm = this;
    vm.closeDialog = closeDialog;

    // Content sub menu
    vm.submenu = [
      { link: '#', title: 'Alerts' },
      { link: 'invitations', title: 'Action Items' },
      { link: 'chat.message', title: 'Messages' },
      { link: '', title: 'Notifications' }

    ];

    function getUserNotification() {
      return api.notifications.get($cookies.get('token')).success(function (resp) {
        if (resp) {
          if(resp.code=='-1'){
            $scope.subscriptionAlert(resp.message);  
          }else{
            vm.notifications = resp.notifications;
            vm.closeList = false;
    
          }
      

        }
      }).error(function (resp) {

      })
    };
    vm.totUsers = totUsers;
    vm.projectList = projectList;
    vm.notificationList = notificationList;
    vm.notificationDate = notificationDate;
    vm.closeList = true;
    vm.chk_changes = [];
    vm.unixtimestamp = []

    function totUsers(item) {
      vm.chk_changes.push(Object.keys(item).length - 1);
    }

    function projectList(list, detail) {
      vm.closeList = true;
      vm.projectlists = detail;

      vm.checklistDetail = Object.keys(list).map(function (it) {
        return list[it]
      })

    };

    function notificationList() {
      vm.closeList = false;
    }
    function notificationDate(item) {
      if (item !== 'undefined' || item !== undefined) {
        vm.unixtimestamp.push((new Date(item.replace('-', '/'))).getTime());

      }
    }

    getUserNotification();

    //Subscription expired alert
    $scope.subscriptionAlert = function (message) {
      vm.title = 'Alert';
      vm.message = message;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/teammembers/dialogs/subscription-alert.html',
        clickOutsideToClose: false
      });
    };

    function closeDialog() {
      $mdDialog.hide();
    }


  }


})();
