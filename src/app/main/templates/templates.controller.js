(function () {
  'use strict';

  angular
    .module('app.templates')
    .controller('TemplatesController', TemplatesController);

  /** @ngInject */
  function TemplatesController($rootScope, $http, api, $mdSidenav, $mdDialog, $scope, $document, $state, $cookies) {

    //console.log('$rootScope.user', $rootScope.user);

    var vm = this;
    vm.isLoader = true;
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
    vm.findPublicTemplate = findPublicTemplate;
    vm.seacrhPublicTemplate = seacrhPublicTemplate;

    //permission

    var userpermission = $cookies.get("userpermission");
    vm.checkIsPermission = userpermission ? JSON.parse(userpermission) : '';

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
    api.folders.get($rootScope.token).then(function (d) {

      if (d.data.code == '-1') {
        if(d.data.message=='unauthorized access'){
          $state.go('app.logout');
        }else{

          // $scope.subscriptionAlert(d.data.message);
          $rootScope.message(d.data.message, 'error')
        
        }
      } else {
        vm.folders = d.data.folders;

      }
    });

    vm.wizard = {
      newFolder: false,
      newGroup: false
    };

    function fetchGroups(id) {
      ftchFolder(id)
      // vm.groups = $rootScope.children('groups', id);
      // $rootScope.organizeData();

      // if (!vm.groups.length > 0) {
      //   vm.wizard.switch = true;
      // } else {
      //   vm.wizard.switch = false;
      // }
    };
    function ftchFolder(id) {
      api.groups.get(id).then(function (d) {
        vm.groups = d.data.groups
        $rootScope.nextStep();
        vm.wizard.switch = true;
      });
    }

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

      api.folders.add(vm.folder.name, vm.folder.description,'','', vm.folder.order).error(function (res) {
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
      vm.group.order += vm.groups ? vm.groups.length : 0;
      vm.group.text = groupName;
      vm.group.id_parent = folderID;

      api.groups.add(vm.group.text, vm.group.order, vm.group.id_parent).error(function (res) {
        return $rootScope.message("Error Adding Folder", 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Adding Folder", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          // console.log('res.groups', res.groups);
          $rootScope.$broadcast('event:updateModels');

          if( !vm.groups) vm.groups = [];
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
      vm.isLoader = true;
      //Set sending variable for buttons
      vm.checklist.sending = true;

      //Set order variable for sql insert
      vm.checklist.order = 1;
      vm.checklist.order += vm.checklists.length;

      //name, order, to
      api.checklists.add(checklistName, vm.checklist.order, groupID, $rootScope.token).error(function (res) {
        return $rootScope.message("Error Adding Checklist", 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Adding Checklist", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          //console.log('res checklist', res);
          //console.log('res.checklist.id', res.checklist.id);
          api.sections.add('sections', 1, res.checklist.id, $rootScope.token).error(function (res) {
            return $rootScope.message("Error Adding Section", 'warning');
          }).success(function (res) {
            vm.isLoader = false;
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
            vm.isLoader = false;
            if (res === void 0 || res === null || res === '') {
              return vm.templates.load.error = 'Error loading Templates! (Server not responding properly.)';
            } else if (res.code) {
              return vm.templates.load.error = "Error loading Templates: (" + res.code + ") " + res.message;
            } else if (res.templates) {
              vm.templates.list = res.templates;

              vm.publicOrganization = Object.keys(res.templates.public);

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

          return api.checklists.searchForTemplates(vm.criteria, $rootScope.token).error(function (res) {
            //return $rootScope.message('Unknown error finding Templates.', 'warning');
          }).success(function (res) {
            vm.isLoader = false;
            if (res.code) {
              res.display = "Error finding Templates: (" + res.code + "): " + res.message;
              //$rootScope.message(res.display, 'warning');
            }
            vm.publicTemplates = res.templates;
            //  console.log('vm.publicTemplates', vm.publicTemplates);
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

    vm.getLabels = function(){
      // return api.getLabels(BASEURL + 'login-authCheck.php', {
      //   cache: false
      // }).then(
      //   function (d) { //success


      //     var res;
      //    // console.log('success on user pull', d);
      //     if (d === void 0 || d == null || d == '') {
      //       //console.log('server did not send response');
      //     } else {
      //       res = d.data;

      //       if (typeof res == 'string') {
      //         res = JSON.parse(d.data, 1);
      //       }
      //     }
      //     if (res === void 0 || res == null || res == '') {
      //       //console.log('not logged in (no res)');
      //       $rootScope.user = void 0;
      //       return check(path);
      //     } else {
      //       //console.log('res has content', typeof res, res);

      //       $rootScope.user = res.user;

      //       if ($rootScope.user !== void 0 && $rootScope.user != null && res.viewAs !== void 0 && res.viewAs != null) {
      //         //console.log('WTF', viewAs);
      //         $rootScope.viewAs.set(res.viewAs);
      //       }
      //       //console.log('about to check path again after user load successful');
      //       return check(path);
      //     }

      //   },
      //   function (err) { //error
      //     //console.log('error on user pull', err);
      //     var ref;
      //     if (!((ref = $rootScope.user) != null ? ref.authenticated : void 0)) {
      //       ///console.log('user not authenticated already after error on user pull, checking path now');
      //       return check(path);
      //     }
      //   }
      // );


      return api.templates.getLabels().error(function (res) {
        return $rootScope.message('Unknown error getting labels.', 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if (res.code) {
        //  return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
        } else {
          $rootScope.user.dashboard.labels = res.labels;
          // $rootScope.$broadcast('event:updateModels');
          // $rootScope.message('Template has been downloaded', 'success');
          // $rootScope.organizeData();
          // vm.closeDialog();
          // vm.loginAuthCheck();
        }
      })["finally"](function () {
        //return vm.download.creating = false;
      });
    }

    //vm.getLabels();

    vm.download = {
      template: null,
      creating: false,
      begin: function (ev, templateID, templateType, attachments) {
        if(vm.verticalStepper){
          if(vm.verticalStepper.step1){
            vm.verticalStepper.step1.folderID = '';
          }
        }
        
        if (templateType == 'checklist') {
          console.log('open openAddChecklistTemplateDialog');
          vm.openAddChecklistTemplateDialog(ev, templateID, templateType, attachments);
        } else if (templateType == 'group') {
          console.log('open openAddFolderTemplateDialog');
          vm.openAddFolderTemplateDialog(ev, templateID, templateType, attachments);
        }

        vm.TemplateAttachments = attachments ? 'yes' : 'no';
        

      },
      create: function (idCTMPL, parentID, templateType) {

        console.log('idCTMPL', idCTMPL);
        console.log('parentID', parentID);
        console.log('templateType', templateType);
        
        vm.download.creating = true;
        return api.checklists.createFromTemplate(idCTMPL, parentID, templateType, vm.TemplateAttachments).error(function (res) {
          return $rootScope.message('Unknown error creating Checklist from selected Template.', 'warning');
        }).success(function (res) {
          vm.isLoader = false;
          if (res.code) {
            return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
          } else {

            $rootScope.$broadcast('event:updateModels');
            $rootScope.message('Template has been downloaded', 'success');
            $rootScope.organizeData();
            vm.closeDialog();
            vm.getLabels();
          }
        })["finally"](function () {
          return vm.download.creating = false;
        });
      }
    };

    vm.templates.load.start();
    vm.templates.load.startInternal();
    //Archieve Dialog
    vm.archieveDialog = archieveDialog;
    vm.saveArchieve = saveArchieve;

    function archieveDialog(ev, id, type) {
      vm.title = 'Create New Archieve';
      vm.type = type ? type : '';

      if (id) {
        vm.id = parseInt(id);
      }
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/templates/dialogs/templates/archieve-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };


    // Save Archive

    function saveArchieve(id, type) {
      vm.spinner = true;
      $http.post(BASEURL + "create-archieve-post.php", { 'name': vm.archieve.name, 'type': type, 'id': id ? id : '' })
        .success(function (res) {
          vm.spinner = false;
          if (res.type == 'success') {
            vm.archieve.name = '';
            vm.templates.load.start();
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
      { link: 'folders', title: 'Projects', active : false },
      { link: 'groups', title: 'Workflow', active : false },
      { link: 'checklist', title: 'Checklists', active : false },
      { link: 'templates', title: 'Templates', active : true },
      { link: 'other', title: 'Other', active : false },
      { link: 'archives', title: 'Archives', active : false }

    ];


    vm.sortBy = sortBy;
    vm.propertyName = '';
    vm.reverse = true;
    function sortBy(templateOrder) {
      vm.reverse = (vm.templateOrder === templateOrder) ? !vm.reverse : false;
      vm.templateOrder = templateOrder;
    };
    vm.deleteItemConfirm = deleteItemConfirm;

    /* Delete Folder */
    function deleteItemConfirm(template, event) {
      vm.title = 'Delete Template Information';
      vm.warning = 'Warning: This can’t be undone';
      vm.description = "Please confirm you want to delete this <span class='link'>" + template.name + "</span><br>All of the contents will be deleted and can’t be recovered"
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        clickOutsideToClose: false
      })
        .then(function (answer) {
          deleteItem(template);
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });


      function deleteItem(template) {
        $http.post(BASEURL + "template_delete-post.php", { template: template }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).success(function (res) {
          if (res.type == 'success') {
            vm.templates.load.start();
            $rootScope.message('Template has been deleted successfully', 'success');

          } else if (res.type != 'success') {
            return $rootScope.message("Error deleting Template: (" + res.code + "): " + res.message, 'warning');
          } else {
            vm.templates.load.start();
            return $rootScope.message('Template has been deleted');
          }
        });

      }


    }


    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };

    // //Subscription expired alert
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

    function findPublicTemplate() {
      vm.search_templates_result = {};
      vm.search =  {};
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/templates/dialogs/templates/public-template-search.html',
        clickOutsideToClose: false
      });

    }

    function seacrhPublicTemplate(data) {
      vm.searching = true;
      api.templates.search_templates(data).then(function (d) {
        vm.searching = false;
        vm.search_templates_result = d.data.data;
      });
    }

    
//     jQuery("md-menu.moreMenuOnTab").parent('md-tab-item').css("position", "static");
   

// // {/* <script> */}
// $.noConflict();
// jQuery( document ).ready(function( $ ) {
//   // Code that uses jQuery's $ can follow here.
//   $("md-menu.moreMenuOnTab").css("position", "static");
// });

  }

})();
