(function () {
  'use strict';

  angular
    .module('app.checklist')
    .controller('ChecklistEditChecklistDialogController', ChecklistEditChecklistDialogController);

  /** @ngInject */
  function ChecklistEditChecklistDialogController($mdDialog, Checklist, Vars, api, $document, $mdSidenav, $rootScope, $scope, $http) {
    var vm = this;


    // Data
    vm.title = 'Edit Checklist';
    vm.checklist = angular.copy(Checklist);
    vm.vars = angular.copy(Vars);
    vm.saveChecklist = saveChecklist;
    vm.closeDialog = closeDialog;
    vm.deleteConfirm = deleteConfirm;
    vm.deleteChecklist = deleteChecklist;

    vm.newChecklist = false;

    if (!vm.checklist) {
      vm.checklist = {
        'id': '',
        'name': '',
        'description': '',
        'order': '',
        'deleted': false
      };
      vm.title = 'New Checklist';
      vm.newChecklist = true;
    }

    // Methods

    function saveChecklist() {

      var editPack;

      editPack = {
        'id': vm.vars.index,
        'rid': vm.vars.rid,
        'index': vm.vars.index,
        'type': 'checklist',
        'text': vm.checklist.name,
        'info': '',
        'submitting': false,
        'error': null,
        'message': vm.vars.message
      };

      console.log('vm.vars.message', vm.vars.message);

      return api.checklists.edit(editPack).error(function (res) {
        vm.edit.error = res.code;
        return vm.edit.message = res.message;
      }).success(function (res) {
        var notifyItem, packet;
        vm.checklist[vm.vars.index] = res.updated;
        packet = {
          catalog: 'checklists',
          type: 'edit',
          user: {
            idCON: $rootScope.user.idCON,
            name: $rootScope.user.name
          },
          record: res.updated
        };
        console.log('emitting data', packet);
        // 
        $rootScope.socketio.emit('data', packet);
        notifyItem = $.extend({}, res.updated, {
          type: 'data'
        });
        //console.log('about to sent notify event', notifyItem);
        $rootScope.socketio.emit('notify', [notifyItem]);
        return vm.organizeData();
      })["finally"](function () {
        return vm.edit.stop(which);
      });

    }


    vm.edit = {
      stop: function (which) {
        var whats;
        whats = which.type + 's';
        $scope[whats][which.index].edit = null;
        return $scope[whats][which.index].editing = false;
      },
      submit: function (which) {
        var whats;
        whats = which.type + 's';
        if ($scope[whats][which.index].edit.text === $scope[whats][which.index].name && $scope[whats][which.index].edit.info === $scope[whats][which.index].info) {
          $scope.edit.stop(which);
          return false;
        }
        return EditService.attemptEdit(which).error(function (res) {
          $scope[whats][which.index].edit.error = res.code;
          return $scope[whats][which.index].edit.message = res.message;
        }).success(function (res) {
          var notifyItem, packet;
          $scope[whats][which.index] = res.updated;
          packet = {
            catalog: whats,
            type: 'edit',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: res.updated
          };
          console.log('emitting data', packet);
          // 
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, res.updated, {
            type: 'data'
          });
          //console.log('about to sent notify event', notifyItem);
          $rootScope.socketio.emit('notify', [notifyItem]);
          return $scope.organizeData();
        })["finally"](function () {
          return $scope.edit.stop(which);
        });
      }
    };

    function deleteConfirm(what, item, ev) {

      console.log('what', what);
      console.log('item', item);

      var confirm = $mdDialog.confirm()
        .title('Please confirm you want to delete ' + item.name)
        .htmlContent('This action cannot be undone.')
        .ariaLabel('delete' + what)
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        vm.deleteItem(what, item, ev);
      });
    }

    function deleteItem(what, item, ev) {

      var svc, whats;
      whats = what + 's';
      svc = vm.svc(what);

      return svc.destroy(item.id).success(function (res) {
        var notifyItem, packet;
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm[whats].remove(item);
          vm.organizeData();
          packet = {
            catalog: whats,
            type: 'delete',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: item
          };
          console.log('emitting data', packet);
          // 
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, item, {
            type: 'data'
          });
          //console.log('about to sent notify event', notifyItem);
          $rootScope.message(item.name + ' succesfully deleted', 'success');
          return $rootScope.socketio.emit('notify', [notifyItem]);
        }
      });

    }


    function closeDialog() {
      $mdDialog.hide();
    }

  }
})();
