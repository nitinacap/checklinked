(function () {
  'use strict';

  angular
    .module('app.templates')
    .controller('TemplatesController', TemplatesController);

  /** @ngInject */
  function TemplatesController($rootScope, $http, api, $mdSidenav, $mdDialog, $scope, $document, $state) {

    //console.log('$rootScope.user', $rootScope.user);

    var vm = this;
    vm.openAddChecklistTemplateDialog = openAddChecklistTemplateDialog;
    vm.openAddFolderTemplateDialog = openAddFolderTemplateDialog;
    vm.fetchGroups = fetchGroups;
    vm.openFolderInput = openFolderInput;
    vm.cancelFolderInput = cancelFolderInput;
    vm.cancelGroupInput = cancelGroupInput;
    vm.cancelChecklistInput = cancelChecklistInput;
    vm.openGroupInput = openGroupInput;
    vm.addNewFolder = addNewFolder;
    vm.addNewGroup = addNewGroup;
    vm.addNewChecklist = addNewChecklist;
    vm.toggleSidenav = toggleSidenav;
    vm.closeDialog = closeDialog;
    vm.templateFiltersDefaults = angular.copy(vm.templateFilters);
    vm.showAllTemplates = true;
    vm.templateOrder = '';
    vm.templateOrderDescending = false;

    //Toggle Left Side Nav
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    };

    function closeDialog() {
      $mdDialog.hide();
    };

    vm.templateFilters = {
      search: '',
      deleted: false
    };

    vm.sortableOptions = {
      handle: '.handle',
      forceFallback: true,
      ghostClass: 'todo-item-placeholder',
      fallbackClass: 'todo-item-ghost',
      fallbackOnBody: true,
      sort: true
    };

    vm.msScrollOptions = {
      suppressScrollX: true
    };

    console.log('vm.templateFilters', vm.templateFilters);
    vm.templateFiltersDefaults = angular.copy(vm.templateFilters);
    vm.showAllFilters = true;

    vm.filterOrder = '';
    vm.filterOrderDescending = false;

    vm.folders = [];
    api.folders.get().then(function (d) {
      console.log('d', d);
      vm.folders = d.data.folders;
    });

    vm.wizard = {
      newFolder: false,
      newGroup: false
    };

    function fetchGroups(id) {

      vm.groups = $rootScope.children('groups', id);
      console.log('vm.groups pre organizeData id / vm.groups', id, vm.groups)
      $rootScope.organizeData();
      console.log('fetching', id, vm.groups);

      if (!vm.groups.length > 0) {
        vm.wizard.switch = true;
      } else {
        vm.wizard.switch = false;
      }
    };

    fetchGroups(id);
    function openFolderInput() {
      vm.folder = '';
      vm.group = '';
      vm.wizard.newFolder = true;
      vm.wizard.newGroup = false;
      vm.wizard.newChecklist = false;
      console.log('vm.wizard', vm.wizard);

    };

    function cancelFolderInput() {
      return vm.wizard.newFolder = false;
      console.log('vm.wizard', vm.wizard);
    };

    function cancelGroupInput() {
      console.log('fff');
      return vm.wizard.newGroup = false;
      return vm.wizard.switch = false;
      console.log('vm.wizard', vm.wizard);
    };

    function cancelChecklistInput() {
      vm.closeDialog();
      console.log('vm.wizard', vm.wizard);
    };

    function openGroupInput() {
      vm.group = '';
      vm.wizard.newFolder = false;
      vm.wizard.newChecklist = false;
      vm.wizard.newGroup = true;
      vm.wizard.switch = true;
      console.log('vm.wizard', vm.wizard);
    };


    function addNewFolder() {
      //console.log('pre insert vm.folders', vm.folders);
      //Set sending variable for buttons
      vm.folder.sending = true;

      //Set order variable for sql insert
      vm.folder.order = 1;
      vm.folder.order += vm.folders.length;

      api.folders.add(vm.folder.name, vm.folder.description, vm.folder.order).error(function (res) {
        return $rootScope.message("Error Creating Project", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Creating Project", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          vm.verticalStepper = {
            newFolderID: res.folder.id
          }



          $rootScope.$broadcast('event:updateModels');
          vm.folders.push(res.folder);
          $rootScope.organizeData();

          vm.fetchGroups(res.folder.id);


          $rootScope.message('Project Added');

          //Hide Buttons
          vm.wizard.newFolder = false;


        }
      });

    };

    function addNewGroup(groupName, folderID) {

      //Set sending variable for buttons
      vm.group.sending = true;

      //Set order variable for sql insert
      vm.group.order = 1;
      vm.group.order += vm.groups.length;
      vm.group.text = groupName;
      vm.group.id_parent = folderID;

      api.groups.add(vm.group.text, vm.group.order, vm.group.id_parent).error(function (res) {
        return $rootScope.message("Error Adding Folder", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Adding Folder", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          console.log('res.groups', res.groups);
          $rootScope.$broadcast('event:updateModels');
          vm.groups.push(res.group);
          $rootScope.organizeData();

          vm.verticalStepper.newGroupID = res.group.id;
          vm.verticalStepper.newFolderID = res.group.id_parent;

          vm.wizard.newGroup = false;
          vm.wizard.switch = false;


          $rootScope.message('Folder Added');
        }
      });
    };

    function addNewChecklist(checklistName, groupID, folderID) {

      //Set sending variable for buttons
      vm.checklist.sending = true;

      //Set order variable for sql insert
      vm.checklist.order = 1;
      vm.checklist.order += vm.checklists.length;

      //name, order, to
      api.checklists.add(checklistName, vm.checklist.order, groupID).error(function (res) {
        return $rootScope.message("Error Adding Checklist", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Adding Checklist", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          //console.log('res checklist', res);
          //console.log('res.checklist.id', res.checklist.id);
          api.sections.add('sections', 1, res.checklist.id).error(function (res) {
            return $rootScope.message("Error Adding Section", 'warning');
          }).success(function (res) {
            //console.log('res failed', res);
            if (res === void 0 || res === null || res === '') {
              return $rootScope.message("Error Adding Section", 'warning');
            } else if (res.code) {
              return $rootScope.message(res.message, 'warning');
            } else {
              //console.log('res success', res);
              vm.sections.push(res.section);
            }
          });
          //console.log('vm.checklists pre', vm.checklists);

          $rootScope.$broadcast('event:updateModels');
          console.log('$stateParams.id', $stateParams.id);
          //console.log('$state', $state);
          console.log('$state.is', $state.is);


          //vm.checklists = $rootScope.checklists;
          if (!$state.is('app.checklist.detail')) {
            console.log('pre unshift vm.checklists', vm.checklists);
            vm.checklists.unshift(res.checklist);
            console.log('post unshift vm.checklists', vm.checklists);
          }

          $rootScope.organizeData();
          $rootScope.message('Checklist Added');

        }
      });

      vm.closeDialog();
    };

    function openAddChecklistTemplateDialog(ev, templateID, templateType) {

      vm.title = 'Download From Checklist Templates';
      vm.wizard.templateID = templateID;
      vm.wizard.templateType = templateType;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/templates/dialogs/templates/checklist-add-from-template-dialog.html',
        parent: angular.element($document.find('#templates')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };

    function openAddFolderTemplateDialog(ev, templateID, templateType) {

      vm.title = 'Download From Folder Templates';
      vm.wizard.templateID = templateID;
      vm.wizard.templateType = templateType;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/templates/dialogs/templates/checklist-add-from-folder-template-dialog.html',
        parent: angular.element($document.find('#templates')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    vm.templates = {
      list: [],
      load: {
        inProgress: false,
        error: '',
        start: function () {
          var process;
          this.inProgress = true;
          this.error = '';
          process = this.processTemplate;
          return $http.get(BASEURL + "templates-get.php?org=1&noXML=1").success(function (res) {
            if (res === void 0 || res === null || res === '') {
              console.log('Error loading templates: ', res);
              return vm.templates.load.error = 'Error loading Templates! (Server not responding properly.)';
            } else if (res.code) {
              return vm.templates.load.error = "Error loading Templates: (" + res.code + ") " + res.message;
            } else if (res.templates !== void 0 && res.templates.length) {
              vm.templates.list = res.templates.map(process);
              console.log('vm.templates.list', vm.templates.list);
            }
          }).error(function (err) {
            console.log('Error loading team members: ', err);
            return vm.templates.load.error = 'Error loading Templates! (Sever not responding.)';
          })["finally"](function () {
            return vm.templates.load.inProgress = false;
          });
        },
        startInternal: function () {
          vm.criteria = {
            name: '*',
            organization: '',
            author: '',
            version: '',
            type: '*'
          };

          return api.checklists.searchForTemplates(vm.criteria).error(function (res) {
            //return $rootScope.message('Unknown error finding Templates.', 'warning');
          }).success(function (res) {
            if (res.code) {
              res.display = "Error finding Templates: (" + res.code + "): " + res.message;
              //$rootScope.message(res.display, 'warning');
            }
            vm.publicTemplates = res.templates;
            console.log('vm.publicTemplates', vm.publicTemplates);
          })["finally"](function () {
          });
        },
        processTemplate: function (raw) {
          var processed;
          processed = $.extend({}, raw, {
            revising: false,
            deleting: false,
            revise: function () {
              return $rootScope.message('This function is under construction.');
            },
            remove: function () {
              var template;
              if (this.deleting) {
                return false;
              }
              console.log('deleting template', template);
              this.deleting = true;
              template = this;

              console.log(template);

              return $http.post(BASEURL + "template_delete-post.php", {

                template: template
              }, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache: false
              }).success(function (res) {
                if (res === void 0 || res === null || res === '') {
                  return $rootScope.message('Error deleting Template. Server not responding properly.', 'warning');
                } else if (res.code) {
                  return $rootScope.message("Error deleting Template: (" + res.code + "): " + res.message, 'warning');
                } else {
                  vm.templates.list.remove(template);
                  console.log('template deleted', template, vm.templates.list);
                  return $rootScope.message('Template Deleted');
                }
              }).error(function (err) {
                return $rootScope.message('Error deleting Template. Server not responding.', 'warning');
              })["finally"](function () {
                return template.deleting = false;
              });
            }
          });
          return processed;
        }
      }
    };

    vm.download = {
      template: null,
      creating: false,
      begin: function (ev, templateID, templateType) {
        if(templateType == 'checklist') {
          console.log('open openAddChecklistTemplateDialog');
          vm.openAddChecklistTemplateDialog(ev, templateID, templateType);
        } else if(templateType == 'group'){
          console.log('open openAddFolderTemplateDialog');
          vm.openAddFolderTemplateDialog(ev, templateID, templateType);
        }

      },
      create: function (idCTMPL, parentID, templateType) {
        console.log('idCTMPL', idCTMPL);
        console.log('parentID', parentID);
        console.log('templateType', templateType);

        vm.download.creating = true;
        return api.checklists.createFromTemplate(idCTMPL, parentID, templateType).error(function (res) {
          return $rootScope.message('Unknown error creating Checklist from selected Template.', 'warning');
        }).success(function (res) {
          if (res.code) {
            return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
          } else {

            $rootScope.$broadcast('event:updateModels');

            $rootScope.message('Template has been downloaded', 'success');
            $rootScope.organizeData();
            vm.closeDialog();
          }
        })["finally"](function () {
          return vm.download.creating = false;
        });
      }
    };

    vm.templates.load.start();
    vm.templates.load.startInternal();
  }

})();
