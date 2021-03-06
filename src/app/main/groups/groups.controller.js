(function () {
  'use strict';

  angular
    .module('app.groups')
    .controller('GroupsController', GroupsController);

  /** @ngInject */
  function GroupsController($scope, $rootScope, api, $stateParams, $cookies, $mdDialog, $mdSidenav, $document, $http, $state) {
    var vm = this;
    vm.isLoader = true;
    vm.showLoadingImage = true;

    var userpermission = $cookies.get("userpermission");
    vm.checkIsPermission = userpermission ? userpermission : '';

    vm.Alreadyclicked = false;

    console.log("userpermission=",vm.checkIsPermission);

    $scope.getAllFolders = function () {
      api.folders.get().then(function (d) {
        vm.projects = d.data.folders;
      });
    };
    vm.isBreadcrum = $stateParams.id ? true : false;

    $scope.getAllFolders();

    $scope.getGroups = function () {
     
      vm.folder_id = $stateParams.id;
      api.groups.get($stateParams.id).then(function (d) {
        vm.isLoader = false;
        if (d.data && d.data.code == '-1') {
          if(d.data.message=='unauthorized access'){
            $state.go('app.logout');
          }else{
            // $scope.subscriptionAlert(d.data.message);
            $rootScope.message(d.data.message, 'error')
          }
          vm.showLoadingImage = false;
        } else {

          vm.groups = [];
          vm.groups = d.data.groups;
          vm.showLoadingImage = false;
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

    function openGroupDialog(ev, group, type, what) {

      vm.group = group;

      if(what === 'edit') {
        vm.groupName = group.name;
        vm.projectParamId = group.item_bread.project_id;
        vm.ChooseProject = false;
    
        vm.title = 'Edit Workflow';
      }
      else {
        vm.groupName = '';
        vm.ChooseProject = true;

        if(what === 'duplicate')  vm.DuplicateWorkflowID = vm.projectParamId = ev.item_bread.project_id;
        else if(what === 'new') vm.projectParamId = '';
      
        vm.title = 'Duplicate Workflow';
        
      } 
     
      vm.newGroup = false;
      vm.type = type;

      if (!vm.group) {
        vm.group = {
          'id': '',
          'name': '',
          'description': '',
          'link': '',
          'order': '',
          'deleted': false,
          'attachment': ''
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
    // 

    function addNewGroup(duplicate) {

       

      //Close Dialog Window
      vm.closeDialog();
      vm.showLoadingImage = true;

      if(vm.DuplicateWorkflowID){
        vm.group.Id = vm.DuplicateWorkflowID;
      }

      vm.group.parentId = $stateParams.id ? $stateParams.id : vm.group.Id;

      vm.group.name = vm.groupName;
      vm.group.sending = true;
      vm.group.order = 1;
      vm.group.order += vm.groups ? vm.groups.length : '';
      api.groups.add(vm.group.name, vm.group.order, vm.group.parentId, vm.group.description, vm.group.link, duplicate ? duplicate.id : '', vm.group.attachment).error(function (res) {
        vm.showLoadingImage = false;
        return $rootScope.message("Error Creating Workflow", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          vm.showLoadingImage = false;
          return $rootScope.message("Error Creating Workflow", 'warning');
        } else if (res.code) {
          vm.showLoadingImage = false;
          return $rootScope.message(res.message, 'warning');
        } else {
          
          vm.showLoadingImage = false;
          /* Reset Group Object */
          
          if(res.group){
            vm.group.id = res.group.id ? res.group.id : '';
            vm.group.name = res.group.name;
            vm.group.id_parent = res.group.id_parent;
            vm.group.order = res.group.order;
          }
          


          $rootScope.$broadcast('event:updateModels');

          //Toaster Notification
          $rootScope.message('Workflow Created');

          $scope.getGroups();
          

          //Add New Group to Groups object
          if(res.group){
            if (res.group.length > 0) {
              vm.groups.unshift(vm.groups);

            }
          }

          vm.group.sending = false;
          vm.showLoadingImage = false;
          // vm.showLoadingImage = false;

          //Close Dialog Window
        }
      });

      //Close Left Navigation
      $mdSidenav('group-sidenav').toggle();
    }

    /* Save Group */
    function saveGroup() {
       
      //Close Dialog Window
      vm.closeDialog();

      vm.showLoadingImage = true;

      vm.group.name = vm.groupName;

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
        vm.showLoadingImage = false;
        return $rootScope.message("Error Editing Workflow", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          vm.showLoadingImage = false;
          return $rootScope.message("Error Editing Workflow", 'warning');
        } else if (res.code) {
          vm.showLoadingImage = false;
          return $rootScope.message(res.message, 'warning');
        } else {

          //Toaster Notification
          $rootScope.message('Workflow Edited');

          vm.group.sending = false;

          
          vm.showLoadingImage = false;
        }
      });

      //Close Left Navigation
      $mdSidenav('group-sidenav').close();
    }

    /* Delete Group */
    function deleteGroup(group, event, what) {

      if( what == "schedule") group.name = vm.scheduler_type.group_name + " Scheduler"; 

     

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

          if( what == "schedule") {
            vm.deleteScheduler(group.id);
            return 1;
          }

          console.log('not allowed')
          deleteGroupItem(group);
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        })
    };

    function deleteGroupItem(group) {
       // vm.isLoader = true;
       vm.showLoadingImage = true;

      api.groups.destroy(group.id, $rootScope.user.token).error(function (res) {
        return $rootScope.message("Error Deleting Workflow", 'warning');
      }).success(function (res) {
        // vm.isLoader = false;
        vm.showLoadingImage = false;
        if (res === void 0 || res === null || res === '') {
          $rootScope.message("Error Deleting Workflow", 'warning');
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

    vm.downloadPDF = function(ev,  group_id, group_name){
      var pdfName = group_name + '.pdf';
      // 

      kendo.drawing.drawDOM($("#WorkflowExport")).then(function(group) {
        // 
        kendo.drawing.pdf.saveAs(group, pdfName);
        // 
      });
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
      { link: 'folders.folders', title: 'Projects', active : false },
      { link: 'groups', title: 'Workflows', active : true },
      { link: 'checklist', title: 'Checklists', active : false },
      { link: 'templates', title: 'Templates', active : false },
      { link: 'other', title: 'Other', active : false },
      { link: 'archives', title: 'Archives', active : false}

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
        // ;
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
              $rootScope.alertMessage('Pasted successfully');
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

    // $scope.subscriptionAlert = function (message) {
    //   vm.title = 'Alert';
    //   vm.message = message;
    //   $mdDialog.show({
    //     scope: $scope,
    //     preserveScope: true,
    //     templateUrl: 'app/main/teammembers/dialogs/subscription-alert.html',
    //     clickOutsideToClose: false
    //   });
    // }

    // Schedule starts

    vm.addschedule = addschedule;
    vm.saveScheduler = saveScheduler;
    vm.deleteScheduler = deleteScheduler;

    function getSchedulerByChek(group_id) {


      vm.newScheduler = {};
      vm.newScheduler.type = 'get';
      vm.newScheduler.item_type_id = group_id;
      vm.newScheduler.item_type = 'workflow';

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          console.log('dddd', d)
          
          vm.item = d.data.data.item;
          if (vm.item) {
            vm.newScheduler.from_date = new Date(vm.item.from_date);
            vm.newScheduler.to_date = new Date(vm.item.to_date);
            vm.newScheduler.gantt_row = vm.item.gantt_chat;
            vm.newScheduler.color = vm.item.color;
            vm.newScheduler.all_day = vm.item.all_day == 1 ? true : false;
            vm.newScheduler.repeat = vm.item.repeat;
            vm.newScheduler.start_time = new Date(vm.item.start_time);
            vm.newScheduler.end_time = new Date(vm.item.end_time);
            vm.newScheduler.end = vm.item.end;
            vm.newScheduler.id = vm.item.id;
          }else{
            
            vm.newScheduler.color = '#ffffff';
          }

        }
      })
    };

    

    function addschedule(ev, group) {

      getSchedulerByChek(group.id);

      // vm.type.title = "Scheduler";
      vm.scheduler_type = {};

      vm.scheduler_type.project_name = group.item_bread.project_name;
      vm.scheduler_type.group_name = group.name;
      vm.scheduler_type.group_id = group.id;

      // getSchedulerByChek(group.id);

      console.log('group', group);
      console.log('vm.scheduler_type.group_id', vm.scheduler_type);

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/groups/dialogs/group/group-add-dialog-scheduler.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    function GetAllGanttRows() {
      console.log('GetAllRows');



      api.checklists.NewScheduler({type: "getRow"}).then(function (res) {
        console.log('get rows res', res)
        // 
        if (res.data.type == 'success') {
          vm.AllGanttRows = res.data.data;
          
        }

      
      })

    }

    GetAllGanttRows();

    function saveScheduler() {

      // = group.item_bread.project_name;
      //  = group.name;
      vm.Alreadyclicked = true;

      vm.newScheduler.item_type_id = vm.scheduler_type.group_id;
      vm.newScheduler.item_type = 'workflow';
      // vm.newScheduler.checklist_id = vm.idCHK;
      // vm.newScheduler.checklist_name = vm.checklists[0].name;
      vm.newScheduler.workflow_name = vm.scheduler_type.group_name;
      vm.newScheduler.project_name =  vm.scheduler_type.project_name;
      vm.newScheduler.id = vm.item ? vm.item.id : '';

      console.log('vm.item savesc', vm.item)
      vm.newScheduler.type = vm.item ? 'update' : 'save';

      console.log('vm.newScheduler' , vm.newScheduler)

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message(vm.item ? "Schedule updated successfully" : "New Worrkflow schedule created successfully", 'success');
          $mdDialog.hide();
        }

        vm.Alreadyclicked = false;

      });

    };

    function deleteScheduler(id) {
      vm.newScheduler = {};
      vm.newScheduler.type = 'delete';
      vm.newScheduler.item_id = id;
      vm.closeDialog();
      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message("Schedule deleted successfully", 'success');

        }

      });
      console.log('deleteScheduler',id)
    }

      // Schedule ends

  }

})();
