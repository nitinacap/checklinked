(function ()
{
    'use strict';

    angular
        .module('app.groups')
        .controller('LinkExistingDialogController', LinkExistingDialogController);

    /** @ngInject */
    function LinkExistingDialogController($mdDialog, api, group, $document, $filter, $mdSidenav, $rootScope, $scope, $http)
    {

     var vm = this;
	// Data
    vm.group = group;

	console.log('vm.group', vm.group);

    vm.closeDialog = closeDialog;
    vm.determineOrder = determineOrder;
    vm.getOrgChecklists = getOrgChecklists;
    vm.link = link;



	vm.user = $rootScope.user;


	function determineOrder(what, to) {
      var count, order, ref, whats;
      whats = what + 's';
      order = 1;
      if (what === 'folder') {
        order += $rootScope.folders.length;
      } else {
        count = (ref = $filter('filter')($rootScope[whats], {
          id_parent: to
        }, true)) != null ? ref : [];
        order += count.length;
      }
      return order;
    };

	vm.load = {
      idGRP: '',
      order: 1,
      begin: function(idGRP) {
        console.log('beginning self-link to org checklists', idGRP);
        vm.order = vm.determineOrder('checklist', idGRP);
        console.log('about to show modal', this);
      }
    };



    vm.linking = false;
    vm.loading = true;
    vm.checklists = [];
    vm.error = 0;
    vm.message = '';
    function setError(err, msg) {
      vm.error = err;
      return vm.message = msg;
    };

	vm.selected = {
      checklists: [],
      check: function(checklist) {
        return this.checklists.indexOf(checklist.id) !== -1;
      },
      toggle: function(checklist) {
        if (checklist.isSelected) {
          checklist.isSelected = false;
          this.checklists.remove(checklist.id);
        } else {
          checklist.isSelected = true;
          this.checklists.push(checklist.id);
        }
      }
    };

    function getOrgChecklists() {

      return api.checklists.getOrgChecklists().then(function(res) {
        if (res === void 0 || res === null || res === '') {
          return vm.setError(-1, "Server response empty.");
        } else if (res.code) {
          return vm.setError(res.code, res.message);
        } else {
          return vm.checklists = res.checklists;
        }
      }, function(err) {
        console.log('error retrieving checklists', err);
        return vm.setError(-1, "HTTP error.");
      }).then(function() {
        return vm.loading = false;
      });
    };

    vm.getOrgChecklists();

    function link(checklists) {
      vm.linking = true;
			return $http.post(BASEURL + 'checklist_selfLink-post.php', {
        idGRP: vm.group.id,
        order: '1',
        checklists: vm.selected.checklists
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        cache: false
      }).then(function(d) {
        var res;
        if (d === void 0 || d === null || d === '') {
          $rootScope.message("Server not responding properly.", 'warning');
        } else {
          res = d.data;
        }
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message(-1, "Server response empty.", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm.error = 0;
          vm.message = '';
          $rootScope.message('Checklists linked.');
          $rootScope.checklists = $rootScope.checklists.concat(res.checklists);
          $rootScope.organizeData();
          $("#findChecklist").modal('hide');
          vm.getOrgChecklists();
          return vm.selected.checklists = [];
        }
      }, function(err) {
        console.log('error retrieving checklists', err);
        return vm.setError(-1, "HTTP error.");
      }).then(function() {
        return vm.linking = false;
      });
    };



       function closeDialog()
        {
        	console.log('close me');
           	$mdDialog.hide();
        }

    }
})();
