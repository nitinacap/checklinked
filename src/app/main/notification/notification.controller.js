(function () {
  'use strict';

  angular
    .module('app.notification')
    .controller('NotificationController', NotificationController)

  /** @ngInject */
  function NotificationController($cookies, $mdDialog, api, $scope, $rootScope) {

    var vm = this;
    vm.closeDialog = closeDialog;
    vm.GlobalSearch = GlobalSearch;

    // Tasks will be filtered against these models
    vm.notificationFilters = {
      search: '',
      deleted: false
    };
    $scope.$on('eventName', function (event, data) {
      console.log('BroadCastOn', data);

    })


    vm.newArray = [];
    function GlobalSearch(data) {

      angular.forEach(data, function (value, key) {
        vm.newArray.push(value.list);
      });
      //   debugger;
      //   console.log('newArray', vm.newArray);
      //   var totalArray = vm.newArray;
      //  // let concatArray = [];

      // for (var i = 1; i <= totalArray.length; i++) {
      //   $scope.actions.data.push(data[i]);
      // }
      // console.log("HELLO",  concatArray);
    }
    vm.notificationFiltersDefaults = angular.copy(vm.notificationFilters);


    function getUserNotification() {
      vm.isLoader = true;
      return api.notifications.get($cookies.get('token')).success(function (resp) {
        if (resp) {
          vm.isLoader = false;
          listMenu();
          if (resp.code == '-1') {
            if(d.data.message=='unauthorized access'){
              $state.go('app.logout');
            }else{
              $scope.subscriptionAlert(resp.message);
            }
          } else {

            vm.notifications = resp.notifications;
            GlobalSearch(vm.notifications);
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
    vm.readNotification = readNotification;
    vm.closeList = true;
    vm.chk_changes = [];
    vm.unixtimestamp = []

    function totUsers(item) {
      if (item) {
        vm.chk_changes.push(Object.keys(item).length - 1);

      }
    }

    function projectList(list, detail, key) {
      var key = key ? key : '';
      vm.closeList = true;
      vm.projectlists = detail;
      vm.checklistDetail = Object.keys(list).map(function (it) {
        list[it].key = key;
        return list[it]
      });

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
    api.notifications.count_notifi();

    function readNotification(id, key) {
      var key = key ? key : '';
      return api.notifications.read(id, 'notification-read').success(function (resp) {
        if (resp) {
          vm.isLoader = false;
          if (resp.code == '-1') {
          } else {


            listMenu();

            if (key != '' && resp.type == 'success') {
              vm.notifications[key].count_unread_total = resp.notifications[key].count_unread_total;
              vm.notifications[key].user_changes = resp.notifications[key].user_changes;
              vm.notifications[key].flag_complete = resp.notifications[key].flag_complete;

            }



          }


        }
      })

    };

    // Content sub menu
    function listMenu() {
      debugger;
      var user_id = $cookies.get("useridCON").toString();
      api.notifications.count_notifi().success(function(notification) {  
        var data = notification.item;           
        var message_count = data.message_count;
        var notification_count = data["user_notification" + user_id];
        var alert_count = data["user_alert" + user_id];

      vm.submenu = [
        { link: 'alerts', title: 'Alerts', notification: alert_count },
        { link: 'invitations', title: 'Action Items' },
        { link: 'chat.message', title: 'Messages', notification: message_count },
        { link: '', title: 'Notifications', notification: notification_count }
      ];

    })

    }

    listMenu();
    $('.Communicate').addClass('communicate');
    $('.Analyze').removeClass('analyze');
    $('.Process').removeClass('opacity1');

  }


})();
