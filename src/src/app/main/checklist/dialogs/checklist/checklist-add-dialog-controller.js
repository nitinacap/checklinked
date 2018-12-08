(function ()
{
    'use strict';

    angular
        .module('app.checklist')
        .controller('ChecklistDialogController', ChecklistDialogController);

    /** @ngInject */
    function ChecklistDialogController($mdDialog, Checklist, Checklists, event, api, $document, $mdSidenav, $http, $rootScope)
    {
        var vm = this;

	vm.svc = function(what) {
      if (what === 'section') {
        return sections;
      }
      if (what === 'heading') {
        return headings;
      }
      if (what === 'item') {
        return items;
      }
      if (what === 'checkbox') {
        return checkbox;
      }
    };
    

    vm.create = function(what, name, to, type, info) {
      var count, order, ref1, svc, whats;
      if (to == null) {
        to = null;
      }
      if (type == null) {
        type = 1;
      }
      if (info == null) {
        info = '';
      }
      whats = what + 's';
      svc = $scope.svc(what);
      vm.newItem.submitting = true;
      order = 1;
      if (what === 'section') {
        order += vm.sections.length;
      } else {
        count = (ref1 = $filter('filter')(vm[whats], {
          id_parent: to
        }, true)) != null ? ref1 : [];
        order += count.length;
      }
      console.log('calling create:add service', name, order, to, type, info);
      return api.svc.add(name, order, to, type, info).success(function(res) {
        var notifyItem, packet;
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm[whats].push(res[what]);
          vm.organizeData();
          packet = {
            catalog: whats,
            type: 'add',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: res[what]
          };
          console.log('emitting data', packet);
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, res[what], {
            type: 'data'
          });
          console.log('about to sent notify event', notifyItem);
          $rootScope.socketio.emit('notify', [notifyItem]);
          return $("#newItem").modal("hide");
        }
      })["finally"](function() {
        return $scope.newItem.submitting = false;
      });
    };
    

 		/**
         * Close dialog
         */
        function closeDialog()
        {
            $mdDialog.hide();
        }

    }
})();