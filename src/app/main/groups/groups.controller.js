(function () {
  'use strict';

  angular
    .module('app.groups')
    .controller('GroupsController', GroupsController);

  /** @ngInject */
  function GroupsController($scope, $rootScope, api, $stateParams, $cookies, $mdDialog, $mdSidenav, $document, $http) {
    var vm = this;
    vm.isLoader = true;
    debugger;

    var userpermission = $cookies.get("userpermission");
    vm.checkIsPermission = userpermission ? JSON.parse(userpermission) : '';

    console.log("userpermission=",userpermission);

    $scope.getAllFolders = function () {
      api.folders.get().then(function (d) {
        vm.projects = d.data.folders;
      });
    };
    vm.isBreadcrum = $stateParams.id ? true : false;

    $scope.getAllFolders();

    $scope.getGroups = function () {
      vm.groups = [];
      vm.folder_id = $stateParams.id;
      api.groups.get($stateParams.id).then(function (d) {
        vm.isLoader = false;
        if (d.data && d.data.code == '-1') {
          $scope.subscriptionAlert(d.data.message);
        } else {
          vm.groups = d.data.groups;
        }
      });
    }
    $scope.getGroups();

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
    vm.undoDialog = undoDialog;

    /* Dialog Methods */

    function openGroupDialog(ev, group, type) {

      vm.group = group;
      vm.title = 'Edit Workflow';
      vm.newGroup = false;
      vm.type = type;

      if (!vm.group) {
        vm.group = {
          'id': '',
          'name': '',
          'description': '',
          'link': '',
          'order': '',
          'deleted': false
        };
        vm.title = type ? 'Duplicate Workflow' : 'Create New Workflow';
        vm.folderID = ev;
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
          'description': '',
          'link': '',
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

    function publishTemplateDialog(ev, id, name, description) {


      $mdDialog.show({
        controller: 'GroupPublishTemplateDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/groups/dialogs/group/group-publish-template-dialog.html',
        parent: angular.element($document.find('#groups')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          id: id,
          name: name,
          description: description
        }
      });

    }

    function closeDialog() {
      $mdDialog.hide();
    }

    /* Add New Group */
    vm.projectParamId = $stateParams.id ? $stateParams.id : '';

    function addNewGroup(duplicate) {
      vm.group.parentId = $stateParams.id ? $stateParams.id : vm.group.Id;
      vm.group.sending = true;
      vm.group.order = 1;
      vm.group.order += vm.groups ? vm.groups.length : '';
      api.groups.add(vm.group.name, vm.group.order, vm.group.parentId, vm.group.description, vm.group.link, duplicate ? duplicate.id : '').error(function (res) {
        return $rootScope.message("Error Creating Workflow", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Creating Workflow", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          /* Reset Group Object */
          vm.group.id = res.group.id ? res.group.id : '';
          vm.group.name = res.group.name;
          vm.group.id_parent = res.group.id_parent;
          vm.group.order = res.group.order;


          $rootScope.$broadcast('event:updateModels');

          //Toaster Notification
          $rootScope.message('Workflow Created');
          $scope.getGroups();
          vm.closeDialog();

          //Add New Group to Groups object
          if (res.group.length > 0) {
            vm.groups.unshift(vm.groups);

          }

          vm.group.sending = false;

          //Close Dialog Window
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
        'description': vm.group.description,
        'link': vm.group.link,
        'order': vm.group.order,
        'id': vm.group.id,
        'rid': vm.group.rid,
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
      vm.title = 'Delete Workflow Information';
      vm.warning = 'Warning: This can’t be undone';
      vm.description = "Please confirm you want to delete this <span class='link'>" + group.name + "</span><br>All of the contents will be deleted and can’t be recovered"
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        targetEvent: group,
        clickOutsideToClose: false
      })
        .then(function (type) {
          deleteGroupItem(group);
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        })
    };

    function deleteGroupItem(group) {
      vm.isLoader = true;
      api.groups.destroy(group.id, $rootScope.user.token).error(function (res) {
        return $rootScope.message("Error Deleteing Workflow", 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if (res === void 0 || res === null || res === '') {
          $rootScope.message("Error Deleteing Workflow", 'warning');
        } else if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {

          vm.groups.splice(vm.groups.indexOf(group), 1);
          $rootScope.message('Workflow Deleted', 'success');
          vm.group.sending = false;
        }
      });
    };


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
          //console.log('vm.find.results', vm.find.results);
          return vm.find.searchCount++;
        })["finally"](function () {
          return vm.find.searching = false;
        });
      },
      create: function (idCTMPL) {
        // console.log('idCTMPL', idCTMPL);
        // console.log('vm.find.template.parentID', vm.find.template.parentID);
        // console.log('vm.find.template.criteria.type', vm.find.template.criteria.type);
        vm.find.creating = true;
        return api.checklists.createFromTemplate(idCTMPL, vm.find.template.parentID, vm.find.template.criteria.type).error(function (res) {
          return $rootScope.message('Unknown error creating Checklist from selected Template.', 'warning');
        }).success(function (res) {
          if (res.code) {
            return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
          } else {
            if (vm.find.template.criteria.type === 'group') {
              //  console.log('vm.find.template.criteria.type', vm.find.template.criteria.type);
              //   console.log('res on push', res);
              vm.groups.unshift(res.groups[0]);
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

    //Archieve Dialog
    vm.archieveDialog = archieveDialog;
    vm.saveArchieve = saveArchieve;

    function archieveDialog(ev, id) {
      vm.title = 'Create New Archieve';
      if (id) {
        vm.id = parseInt(id);
        console.log("Archive=" + "id=" + vm.id);
      }
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/groups/dialogs/group/archieve-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    // Save Archive

    function saveArchieve(id) {
      vm.spinner = true;
      $http.post(BASEURL + "create-archieve-post.php", { 'name': vm.archieve.name, 'type': 'workflow', 'id': id ? id : '' })
        .success(function (res) {
          vm.spinner = false;
          if (res.type == 'success') {
            vm.archieve.name = '';
            $scope.getGroups();
            vm.closeDialog();
            return $rootScope.message(res.message, 'success');

          } else {
            return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found to make archieve');
        })

    };
    // Content sub menu
    vm.submenu = [
      { link: 'folders.folders', title: 'Projects' },
      { link: '', title: 'Workflows' },
      { link: 'checklist', title: 'Checklists' },
      { link: 'templates', title: 'Templates' },
      { link: 'other', title: 'Other' },
      { link: 'archives', title: 'Archives' }

    ];


    var checklistCut  = localStorage.getItem('cutObj');
    $scope.checklistCut = '';
    if(checklistCut){
      $scope.checklistCut  = JSON.parse(checklistCut);
    }

    console.log('checklistCut2=',  $scope.checklistCut.type);
    vm.isChecklistCut = false;

    if ( $scope.checklistCut.type == 'checklist') {
       vm.isChecklistCut = true;
       function pasteChecklistDialog(){
         
       }
    }


    //cut functionality
    vm.cutDialog = cutDialog;
    vm.pasteDialog = pasteDialog;
    vm.coypDialog = coypDialog;
    $scope.item = [];
    function cutDialog(id_parent, workflow_id, type, item) {
      $scope.cutWorkflow = { type: type, id: workflow_id, parent_origin_id: id_parent };
      localStorage.setItem('cutWorkflow', JSON.stringify($scope.cutWorkflow));
      $rootScope.id_parent = id_parent;
    }

    function coypDialog(id_parent, workflow_id, type, item) {
      $scope.cutWorkflow = { type: type, id: workflow_id, parent_origin_id: id_parent };
      localStorage.setItem('cutWorkflow', JSON.stringify($scope.cutWorkflow));
      $rootScope.id_parent = id_parent;
    }

    function pasteDialog() {
      $scope.cutWorkflow = JSON.parse(localStorage.getItem('cutWorkflow'));


      if ($stateParams.id && $stateParams.id == $rootScope.id_parent) {
        $rootScope.alertMessage('You can not paste in the same workflow');
      }
      else {
        debugger;
        if ($rootScope.id_parent && $rootScope.id_parent != '') {
          var parent_origin_id = $scope.cutWorkflow.parent_origin_id;
          var parent_destination_id = $stateParams.id;
          var move_item_id = $scope.cutWorkflow.id;
          var action_type = 'workflow';
          var item_move_type = $scope.cutWorkflow.type;;
          api.item.paste(parent_origin_id, parent_destination_id, action_type, item_move_type, move_item_id).error(function (res) {
            return $rootScope.message("Error creating on paste item", 'warning');
          }).success(function (res) {
            if (res.type = 'success') {
              localStorage.removeItem('cutWorkflow');
              $rootScope.id_parent = '';
              $rootScope.alertMessage('Paste successfully');
              $scope.getGroups();
            }

          });
        } else {
          $rootScope.alertMessage('Please cut the item first');

        }


      }

    };

    function undoDialog(id) {
      api.item.undo(id).error(function (res) {
        return $rootScope.message("Error creating on undo workflow", 'warning');
      }).success(function (res) {
        if (res.code == '-1') {
          $rootScope.message(res.message, 'warning');
        } else {
          $rootScope.alertMessage('Undo successfully');
          $scope.getGroups();
        }


      });
    };


    $rootScope.alertMessage = function (message) {
      var confirm = $mdDialog.confirm()
        .title(message)
        //.content('This Workflow will be deleted.')
        .ok('Ok')
      $mdDialog.show(confirm);
    }

    // create duplicate project

    vm.Duplicate = Duplicate;
    function Duplicate(group) {
      vm.isLoader = true;
      api.groups.add(group.name + '-copy', 1, group.id_parent, group.description).error(function (res) {
      }).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          vm.groups.push(res.group);
          // $scope.getGroups();
          return $rootScope.message("Workflow has been copied successfully", 'success');
        } else {
          return $rootScope.message("Error found while creating workflow", 'warning');
        }


      });
    };

    //Alert Cancel an close
    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };

    $scope.subscriptionAlert = function (message) {
      vm.title = 'Alert';
      vm.message = message;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/teammembers/dialogs/subscription-alert.html',
        clickOutsideToClose: false
      });
    }

  }

})();
