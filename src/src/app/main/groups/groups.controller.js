(function () {
  'use strict';

  angular
    .module('app.groups')
    .controller('GroupsController', GroupsController);

  /** @ngInject */
  function GroupsController($scope, $rootScope, api, $stateParams, $location, $mdDialog, $mdSidenav, $document, $http, $state, $filter) {
    var vm = this;
    vm.isLoader = true;
    setTimeout(function () { 
    if ($stateParams.id !== undefined && $stateParams.id != null) {
      if ($stateParams.id == '') {
        $location.path('/folders');
      } else {
        vm.groups = [];
        vm.folder_id = $stateParams.id;
        api.groups.get($stateParams.id,$rootScope.user.token).then(function (d) {
          vm.groups = d.data.groups;
          vm.isLoader = false;
        });
      }
    }
  },400);

    console.log('vm.groups', vm.groups);

    if ($rootScope.loading.folders || $rootScope.loading.groups || $rootScope.loading.checklists) {
      console.log('$rootScope.loading', $rootScope.loading);
      console.log('$rootScope.loading.folders', $rootScope.loading.folders);
      console.log('$rootScope.loading.groups', $rootScope.loading.groups);
      console.log('$rootScope.loading.checklists', $rootScope.loading.checklists);
      console.log('$rootScope.loading', $rootScope.loading);
    }

    // Tasks will be filtered against these models
    vm.groupFilters = {
      search: '',
      deleted: false
    };

    /* Controller Scope */
    vm.groupFiltersDefaults = angular.copy(vm.groupFilters);
    vm.showAllGroups = true;
    vm.groupOrder = '';
    vm.groupOrderDescending = false;
    vm.openGroupDialog = openGroupDialog;
    vm.addGroupDialog = addGroupDialog;
    vm.deleteGroup = deleteGroup;
    vm.toggleSidenav = toggleSidenav;
    vm.toggleFilter = toggleFilter;
    vm.resetFilters = resetFilters;
    vm.toggleFilterWithEmpty = toggleFilterWithEmpty;
    vm.addNewGroup = addNewGroup;
    vm.openAddGroupTemplateDialog = openAddGroupTemplateDialog
    vm.sendLinkRequestDialog = sendLinkRequestDialog;
    vm.saveGroup = saveGroup;
    vm.deleteGroup = deleteGroup;
    vm.closeDialog = closeDialog;
    vm.publishTemplateDialog = publishTemplateDialog;
    vm.linkExistingDialog = linkExistingDialog;

    /* Dialog Methods */

    function openGroupDialog(ev, group) {

      vm.group = group;
      vm.title = 'Edit Workflow';
      vm.newGroup = false;

      if (!vm.group) {
        vm.group = {
          'id': '',
          'name': '',
          'description': '',
          'order': '',
          'deleted': false
        };
        vm.title = 'New Workflow';
        vm.newGroup = true;
      }

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/groups/dialogs/group/group-dialog.html',
        parent: angular.element($document.find('#groups')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }


    function addGroupDialog(ev, group) {

      vm.group = group;
      vm.title = 'Edit Workflow';
      vm.newGroup = false;

      if (!vm.group) {
        vm.group = {
          'id': '',
          'name': '',
          'order': '',
          'deleted': false
        };
        vm.title = 'Create New Workflow';
        vm.newGroup = true;
      }

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/groups/dialogs/group/group-dialog.html',
        parent: angular.element($document.find('#groups')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }


    function openAddGroupTemplateDialog(ev) {

      vm.title = 'Find Workflow Templates';

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/groups/dialogs/group/group-add-from-template-dialog.html',
        parent: angular.element($document.find('#groups')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    }

    function sendLinkRequestDialog(ev, group) {
      $mdDialog.show({
        controller: 'GroupSendLinkRequestDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/groups/dialogs/group/group-send-link-request-dialog.html',
        parent: angular.element($document.find('#groups')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          GROUP: group
        }
      });

    }

    function linkExistingDialog(ev, group) {
      $mdDialog.show({
        controller: 'LinkExistingDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/groups/dialogs/group/link-existing-dialog.html',
        parent: angular.element($document.find('#groups')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          group: group
        }
      });

    }

    function publishTemplateDialog(ev, id, name) {


      $mdDialog.show({
        controller: 'GroupPublishTemplateDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/groups/dialogs/group/group-publish-template-dialog.html',
        parent: angular.element($document.find('#groups')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          id: id,
          name: name
        }
      });

    }

    function closeDialog() {
      $mdDialog.hide();
    }

    /* Add New Group */
    function addNewGroup() {

      vm.group.parentId = $stateParams.id;
      vm.group.sending = true;
      vm.group.order = 1;
      vm.group.order += vm.groups.length;

      api.groups.add(vm.group.name, vm.group.order, vm.group.parentId, $rootScope.user.token).error(function (res) {
        return $rootScope.message("Error Creating Workflow", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Creating Workflow", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          /* Reset Group Object */
          vm.group.id = res.group.id;
          vm.group.name = res.group.name;
          vm.group.id_parent = res.group.id_parent;
          vm.group.order = res.group.order;


          $rootScope.$broadcast('event:updateModels');

          //Toaster Notification
          $rootScope.message('Workflow Created');

          //Add New Group to Groups object
          vm.groups.unshift(vm.group);

          vm.group.sending = false;

          //Close Dialog Window
          vm.closeDialog();
        }
      });

      //Close Left Navigation
      $mdSidenav('group-sidenav').toggle();
    }

    /* Save Group */
    function saveGroup() {

      var editPack;

      editPack = {
        'type': 'group',
        'text': vm.group.name,
        'order': vm.group.order,
        'id': vm.group.id,
        'rid': vm.group.rid,
        'token': $rootScope.user.token
      };

      api.groups.edit(editPack).error(function (res) {
        return $rootScope.message("Error Editing Workflow", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Editing Workflow", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          //Toaster Notification
          $rootScope.message('Workflow Edited');

          vm.group.sending = false;

          //Close Dialog Window
          vm.closeDialog();

        }
      });

      //Close Left Navigation
      $mdSidenav('group-sidenav').close();
    }

    /* Delete Group */
    function deleteGroup(group, event) {
      vm.group = group;

      console.log('vm.group', vm.group);

      var confirm = $mdDialog.confirm()
        .title('Are you sure?')
        .content('This Workflow will be deleted.')
        .ariaLabel('Delete Workflow')
        .ok('Delete')
        .cancel('Cancel')
        .targetEvent(event);

      $mdDialog.show(confirm).then(function () {

        api.groups.destroy(vm.group.id, $rootScope.user.token).error(function (res) {
          return $rootScope.message("Error Deleteing Workflow", 'warning');
        }).success(function (res) {
          if (res === void 0 || res === null || res === '') {
            $rootScope.message("Error Deleteing Workflow", 'warning');
          } else if (res.code) {
            $rootScope.message(res.message, 'warning');
          } else {

            /* Remove From Groups Object */
            vm.groups.splice(vm.groups.indexOf(group), 1);

            $rootScope.message('Workflow Deleted', 'success');

            vm.group.sending = false;
          }
        });
      });
    }


    vm.find = {
      template: null,
      searchCount: 0,
      searching: false,
      creating: false,
      results: [],
      begin: function (ev, parentID, type) {
        vm.find.template = {
          criteria: {
            name: '',
            organization: '',
            author: '',
            version: '',
            type: type
          },
          parentID: parentID
        };

        vm.find.searching = false;
        vm.find.creating = false;
        vm.find.searchCount = 0;
        vm.find.results = [];
        vm.openAddGroupTemplateDialog(ev);
        return null;

      },
      search: function () {
        vm.find.searching = true;
        if (vm.find.template.criteria.name === '' && vm.find.template.criteria.organization === '' && vm.find.template.criteria.author === '' && vm.find.template.criteria.version === '') {
          $rootScope.message('Please provide Search Criteria', 'warning');
          vm.find.searching = false;
          console.log('died in search');
          return false;
        }

        console.log('vm.find', vm.find.template);
        return api.checklists.searchForTemplates(vm.find.template.criteria).error(function (res) {
          return $rootScope.message('Unknown error finding Templates.', 'warning');
        }).success(function (res) {
          if (res.code) {
            res.display = "Error finding Templates: (" + res.code + "): " + res.message;
            $rootScope.message(res.display, 'warning');
          }
          vm.find.results = res;
          console.log('vm.find.results', vm.find.results);
          return vm.find.searchCount++;
        })["finally"](function () {
          return vm.find.searching = false;
        });
      },
      create: function (idCTMPL) {
        console.log('idCTMPL', idCTMPL);
        console.log('vm.find.template.parentID', vm.find.template.parentID);
        console.log('vm.find.template.criteria.type', vm.find.template.criteria.type);
        vm.find.creating = true;
        return api.checklists.createFromTemplate(idCTMPL, vm.find.template.parentID, vm.find.template.criteria.type).error(function (res) {
          return $rootScope.message('Unknown error creating Checklist from selected Template.', 'warning');
        }).success(function (res) {
          if (res.code) {
            return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
          } else {
            if (vm.find.template.criteria.type === 'group') {
              console.log('vm.find.template.criteria.type', vm.find.template.criteria.type);
              console.log('res on push', res);
              vm.groups.unshift(res.groups[0]);
              console.log();
            }
            $rootScope.checklists = $rootScope.checklists.concat(res.checklists);

            vm.closeDialog();
            vm.toggleSidenav('group-sidenav');
            $rootScope.message('Workflow Template Applied', 'success');
            $rootScope.organizeData();
          }
        })["finally"](function () {
          return vm.find.creating = false;
        });
      }
    };


    /* Side Navigation Methods */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    /* Filter Methods */
    function toggleFilter(filter) {
      vm.groupFilters[filter] = !vm.groupFilters[filter];
    }

    function toggleFilterWithEmpty(filter) {
      if (vm.groupFilters[filter] === '') {
        vm.groupFilters[filter] = true;
      }
      else {
        vm.groupFilters[filter] = '';
      }
    }

    function resetFilters() {
      vm.showAllGroups = true;
      vm.groupFilters = angular.copy(vm.groupFiltersDefaults);
    }

    console.log('vm GroupController', vm);

  }

})();
