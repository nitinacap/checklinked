(function () {

  'use strict';

  angular
    .module('app.alerts')
    .controller('alertsController', alertsController);

  /** @ngInject */
  function alertsController($scope, api, $http, $rootScope, $mdDialog, $document) {
    var vm = this;
    vm.openConversationDialog = openConversationDialog;
    vm.saveArchieve = saveArchieve;
    vm.archieveDialog = archieveDialog;
    vm.closeDialog = closeDialog;
    
  function getAlerts(){
    api.alert.get().then(function (d) {
      if(d.data.code != '-1'){
       vm.records = d.data.data;
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
        userName:userName,
        producerType: type
      }
    });
  };

  function saveArchieve(id) {
    vm.spinner = true;
    $http.post(BASEURL + "create-archieve-post.php", { 'name': vm.archieve.name, 'type': 'alert', 'id': id ? id : '' })
      .success(function (res) {
        vm.spinner = false;
        if (res.type == 'success') {
          vm.archieve.name = '';
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


  function archieveDialog(ev, id) {
    vm.title = 'Create New Alert Archieve';
    if (id) {
      vm.id = parseInt(id);
    }
    $mdDialog.show({
      scope: $scope,
      preserveScope: true,
      templateUrl: 'app/main/alerts/dialogs/archieve-dialog.html',
      targetEvent: ev,
      clickOutsideToClose: true
    });
  };

  getAlerts();

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


   
        function closeDialog() {
          $mdDialog.hide();
         
        }



  }

})();
