(function () {

  'use strict';

  angular
    .module('app.alerts')
    .controller('alertsController', alertsController);

  /** @ngInject */
  function alertsController($scope, api, $http, $rootScope, $cookies, $mdDialog, $document) {
    var vm = this;
    vm.isLoader = true;
    vm.openConversationDialog = openConversationDialog;
    vm.saveArchieve = saveArchieve;
    vm.archieveDialog = archieveDialog;
    vm.closeDialog = closeDialog;

    function getAlerts() {
      api.alert.get().then(function (d) {
        listMenu();
        if (d.data.code != '-1') {
          vm.records = d.data.data;
          vm.isLoader = false;

        }
      });

    }


    function openConversationDialog(type, id, name, userName) {

      console.log('id', id);
      console.log('name', name);
      console.log('type', type);

      $mdDialog.show({
        controller: 'ChecklistConversationDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-conversation-dialog.html',
        parent: angular.element($document.find('#summary')),
        //targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          convoId: id,
          convoName: name,
          userName: userName,
          producerType: type
        }
      });
    };

    function saveArchieve(id) {
      vm.spinner = true;
      $http.post(BASEURL + "create-archieve-post.php", { 'type': 'alert', 'id': id ? id : '' })
        .success(function (res) {
          vm.spinner = false;
          if (res.type == 'success') {
            // vm.archieve.name = '';
            getAlerts();
            closeDialog();
            return $rootScope.message(res.message, 'success');

          } else {
            return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found to make archieve');
        })

    };


    function archieveDialog(ev, alert) {
      vm.title = 'Create New Alert Archieve';
      vm.warning = 'Warning';
      vm.description = " Please confirm you want to change archive your <span class='link'> Alert - " + alert.name + " </span>to notification."
       
      if (alert.id) {
        vm.id = parseInt(alert.id);
      }
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        // templateUrl: 'app/main/alerts/dialogs/archieve-dialog.html',
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    getAlerts();

    // Content sub menu

    function listMenu() {
      var user_id = $cookies.get("useridCON").toString();
      api.notifications.count_notifi().success(function (notification) {
        var data = notification.item;
        var message_count = data.message_count;
        var notification_count = data["user_notification" + user_id];
        var invites_count = data.invites_count;
        var alert_count = data["user_alert" + user_id];


        vm.submenu = [
          { link: 'alerts', title: 'Alerts', notification: alert_count, active: true },
          { link: 'invitations', title: 'Action Items', notification: invites_count, active: false },
          { link: 'chat.message', title: 'Messages', notification: message_count, active: false },
          { link: 'notification', title: 'Notifications', notification: notification_count, active: false }
        ];

      });
    }


    listMenu();


    setTimeout(function () {
      $('.Communicate').addClass('communicate');
    }, 800);



    function closeDialog() {
      $mdDialog.hide();

    }

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {

      $mdDialog.hide();


      saveArchieve(vm.id);

    };



  }

})();
