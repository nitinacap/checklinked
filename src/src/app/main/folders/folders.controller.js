(function () {

  'use strict';

  angular
    .module('app.folders')
    .controller('FoldersController', FoldersController);

  /** @ngInject */
  function FoldersController($rootScope, api, $stateParams, $location, $mdDialog, $mdSidenav, $document, $http, $scope) {
    var vm = this;
    vm.isLoader = true
    setTimeout(function () {
      if ($stateParams.id !== undefined && $stateParams.id != null) {
        if ($stateParams.id == '') {
          $location.path('/folders');
        } else {
          vm.groups = [];
          api.groups.get($stateParams.id).then(function (d) {
            vm.isLoader = false
            vm.groups = d.data.groups;
          });
        }

      } else {
        vm.folders = [];
        $scope.getFolder = function () {
          api.folders.get().then(function (d) {
            vm.isLoader = false
            vm.folders = d.data.folders;
            //  $rootScope.$on('getFolders', d.data.folders);// res - your data
          });
        }
      }
    }, 400);
    setTimeout(function () {
      $scope.getFolder();
    }, 500);


    //   $rootScope.$on("getAllFolders", function () {  
    //     alert('Ctrl1 MyFunction')  
    //     $scope.getFolder();
    // });


    // Tasks will be filtered against these models
    vm.folderFilters = {
      search: '',
      deleted: false
    };

    /* Controller Scope */
    vm.folderFiltersDefaults = angular.copy(vm.folderFilters);
    vm.showAllFolders = true;
    vm.folderOrder = '';
    vm.folderOrderDescending = false;
    vm.openFolderDialog = openFolderDialog;
    vm.deleteFolder = deleteFolder;
    vm.toggleSidenav = toggleSidenav;
    vm.toggleFilter = toggleFilter;
    vm.resetFilters = resetFilters;
    vm.toggleFilterWithEmpty = toggleFilterWithEmpty;
    vm.addNewFolder = addNewFolder;
    vm.saveFolder = saveFolder;
    vm.closeDialog = closeDialog;
    vm.sendLinkRequest = sendLinkRequest;


    vm.publish = {
      id: null,
      name: null,
      pvt: false,
      submitting: false,
      gatherInfo: function (id, name) {
        vm.publish.id = id;
        vm.publish.name = name;
        $("#publishTemplate").modal('show');
        return true;
      },
      togglePrivate: function () {
        this.pvt = !this.pvt;
        return true;
      },
      publish: function () {
        var ref, ref1;
        if (((ref = $scope.publish.id) != null ? ref.length : void 0) && ((ref1 = $scope.publish.name) != null ? ref1.length : void 0)) {
          $scope.publish.submitting = true;
          return ChecklistService.publish($scope.publish.id, $scope.publish.name, 'group', $scope.publish.pvt).error(function (res) {
            return $rootScope.message('Unknown error publishing Group Template.', 'warning');
          }).success(function (res) {
            if (res.code) {
              return $rootScope.message("Error publishing Group Template. (" + res.code + ": " + res.message + ")", 'warning');
            } else {
              $rootScope.message("Group Template published successfully.");
              return $("#publishTemplate").modal('hide');
            }
          })["finally"](function () {
            $scope.publish.submitting = false;
            $scope.publish.id = null;
            return $scope.publish.name = null;
          });
        } else {
          return $rootScope.message('You must specify the Group Template Name.', 'warning');
        }
      }
    };

    $scope.find = {
      template: null,
      searchCount: 0,
      searching: false,
      creating: false,
      results: [],
      begin: function (parentID, type) {
        $scope.find.template = {
          criteria: {
            name: '',
            organization: '',
            author: '',
            version: '',
            type: type
          },
          parentID: parentID
        };
        $scope.find.searching = false;
        $scope.find.creating = false;
        $scope.find.searchCount = 0;
        $scope.find.results = [];
        $("#findTemplate").modal('show');
        return null;
      },
      search: function () {
        $scope.find.searching = true;
        if ($scope.find.template.criteria.name === '' && $scope.find.template.criteria.organization === '' && $scope.find.template.criteria.author === '' && $scope.find.template.criteria.version === '') {
          $rootScope.message('Please provide Search Criteria', 'warning');
          $scope.find.searching = false;
          return false;
        }
        return ChecklistService.searchForTemplates($scope.find.template.criteria).error(function (res) {
          return $rootScope.message('Unknown error finding Templates.', 'warning');
        }).success(function (res) {
          if (res.code) {
            res.display = "Error finding Templates: (" + res.code + "): " + res.message;
          }
          $scope.find.results.push(res);
          return $scope.find.searchCount++;
        })["finally"](function () {
          return $scope.find.searching = false;
        });
      },
      create: function (idCTMPL) {
        $scope.find.creating = true;
        return ChecklistService.createFromTemplate(idCTMPL, $scope.find.template.parentID, $scope.find.template.criteria.type).error(function (res) {
          return $rootScope.message('Unknown error creating Checklist from selected Template.', 'warning');
        }).success(function (res) {
          if (res.code) {
            return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
          } else {
            if ($scope.find.template.criteria.type === 'group') {
              $rootScope.groups.push(res.groups[0]);
            }
            $rootScope.checklists = $rootScope.checklists.concat(res.checklists);
            return $rootScope.organizeData();
          }
        })["finally"](function () {
          return $scope.find.creating = false;
        });
      }
    };


    /* Dialog Methods */
    function openFolderDialog(ev, folder, type) {
      vm.folder = folder;
      vm.title = 'Edit Project Name';
      vm.newFolder = false;
      vm.type = type;
      vm.datas = ev;
     
      if (!vm.folder) {
        vm.folder = {
          'id': '',
          'name': '',
          'description': '',
          'link': '',
          'attachment': '',
          'order': '',
          'deleted': false
        };
        vm.title = type ? 'Duplicate Project' : 'Create New Project';
        vm.newFolder = true;
      }

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/folders/dialogs/folder/folder-dialog.html',
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function sendLinkRequest(ev, group) {
      $mdDialog.show({
        controller: 'FolderSendLinkRequestDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/folders/dialogs/folder/folder-send-link-request-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          group: group
        }
      });

    }

    function closeDialog() {
      $mdDialog.hide();
      $scope.getFolder();


    }

    /* Add New Folder */
    function addNewFolder(item) {
      debugger;
      vm.folder.sending = true;
      vm.folder.order = 1;
      vm.folder.order += vm.folders ? vm.folders.length : 0;

      api.folders.add(vm.folder.name, vm.folder.description,  vm.folder.link,  vm.folder.attachment, vm.folder.order,item ? item.id: '' ).error(function (res) {
        return $rootScope.message("Error Creating Project", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Creating Project", 'warning');
        } else if (!res.type) {
          vm.closeDialog();
          return $rootScope.message(res.message, 'warning');
        
        } else {

          /* Reset Folder Object */
          vm.closeDialog();
          $rootScope.message('Project has been created successfully');
          vm.folder.id = res.folder.id;
          vm.folder.name = res.folder.name;
          vm.folder.description = res.folder.description;
          vm.folder.order = res.folder.order;
          vm.folder.id_parent = res.folder.id_parent;

          //Toaster Notification

          //Add New Folder to Folders object
          if(res.folder.length > 0){
            vm.folders.unshift(vm.folder);

          }

          vm.folder.sending = false;

          //Close Dialog Window
          vm.closeDialog();
        }
      });
      //Close Left Navigation
      $mdSidenav('folder-sidenav').close();
    }

    /* Save Folder */
    function saveFolder() {

      var editPack;

      editPack = {
        'type': 'folder',
        'text': vm.folder.name,
        'description': vm.folder.description,
        'link': vm.folder.link,
        'attachment': vm.folder.attachment,
        'order': vm.folder.order,
        'id': vm.folder.id,
        'rid': vm.folder.rid,
        'token': $rootScope.user.token
      };

      api.folders.edit(editPack, $rootScope.user.token).error(function (res) {
        return $rootScope.message("Error Editing Project", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Editing Project", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          //Toaster Notification
          $rootScope.message('Project Name ' + vm.folder.name + ' Edited');

          vm.folder.sending = false;


          //Close Dialog Window
          vm.closeDialog();
        }
      });
      //Close Left Navigation
      $mdSidenav('folder-sidenav').close();
    }

    /* Delete Folder */
    function deleteFolder(folder, event) {
      vm.title = 'Delete Folder Information';
      vm.warning = 'Warning: This can’t be undone';
      vm.description = "Please confirm you want to delete this <span class='link'>" + folder.name +"</span><br>All of the contents will be deleted and can’t be recovered"
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        targetEvent: folder,
        clickOutsideToClose:false
      })
      .then(function(answer) {
        deleteFoderItem(folder);
      }, function() {
        $scope.status = 'You cancelled the dialog.';
      });

      // var confirm = $mdDialog.confirm()
      //   .title('Are you sure?')
      //   .content('The Project ' + folder.name + ' will be deleted.')
      //   .ariaLabel('Delete Project')
      //   .ok('Delete')
      //   .cancel('Cancel')
      //   .targetEvent(event);

      // $mdDialog.show(confirm).then(function () {
      //   api.folders.destroy(vm.folder.id, $rootScope.user.token).error(function (res) {
      //     return $rootScope.message("Error Deleteing Project", 'warning');
      //   }).success(function (res) {
      //     if (res === void 0 || res === null || res === '') {
      //       return $rootScope.message("Error Deleteing Project", 'warning');
      //     } else if (res.code) {
      //       return $rootScope.message(res.message, 'warning');
      //     } else {

      //       /* Remove From Folders Object */
      //       vm.folders.splice(vm.folders.indexOf(folder), 1);

      //       $rootScope.message('Project  ' + folder.name + ' has been deleted');

      //       vm.folder.sending = false;
      //     }
      //   });
      // });
    }

    function deleteFoderItem(folder){
      vm.isLoader = true;
      api.folders.destroy(folder.id, $rootScope.user.token).error(function (res) {
            return $rootScope.message("Error Deleteing Project", 'warning');
          }).success(function (res) {
            
            vm.isLoader = false;
            if (res === void 0 || res === null || res === '') {
              return $rootScope.message("Error Deleteing Project", 'warning');
            } else if (res.code) {
              return $rootScope.message(res.message, 'warning');
            } else {
              vm.folders.splice(vm.folders.indexOf(folder), 1);
              $rootScope.message('Project  ' + folder.name + ' has been deleted');
              vm.folder.sending = false;
            }
          });
    }

    /* Side Navigation Methods */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    /* Filter Methods */
    function toggleFilter(filter) {
      vm.folderFilters[filter] = !vm.folderFilters[filter];
    }

    function toggleFilterWithEmpty(filter) {
      if (vm.folderFilters[filter] === '') {
        vm.folderFilters[filter] = true;
      }
      else {
        vm.folderFilters[filter] = '';
      }
    }

    function resetFilters() {
      vm.showAllFolders = true;
      vm.folderFilters = angular.copy(vm.folderFiltersDefaults);
    }
    $scope.IsVisibledesc = false;

    $scope.ShowHideDescription = function () {
      this.IsVisibledesc = this.IsVisibledesc ? false : true;
    }

    // Content sub menu
    vm.submenu = [
      { link: '', title: 'Projects' },
      { link: 'groups', title: 'Workflow' },
      { link: 'checklist', title: 'Checklists' },
      { link: 'templates', title: 'Templates' },
      { link: 'other', title: 'Other' },
      { link: 'archives', title: 'Archives' }

    ];
    vm.saveArchieve = saveArchieve;
    vm.archieveDialog = archieveDialog;


    function saveArchieve(id) {
      vm.spinner = true;
      $http.post(BASEURL + "create-archieve-post.php", { 'name': vm.archieve.name, 'type': 'project', 'id': id ? id : '' })
        .success(function (res) {
          vm.spinner = false;
          if (res.type == 'success') {
            vm.archieve.name = '';
            vm.closeDialog();
            return $rootScope.message(res.message, 'success');

          } else {
            return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found to make archieve');
        })

    };
    // create duplicate project

    vm.Duplicate = Duplicate;
    function Duplicate(folder) {
    //  vm.isLoader = true;

      // vm.title = 'Duplicate Project';
      // $mdDialog.show({
      //   scope: $scope,
      //   preserveScope: true,
      //   templateUrl: 'app/main/folders/dialogs/folder/duplicate.html',
      //   clickOutsideToClose: true
      // });

      // api.folders.add(folder.name + '-copy', folder.description, 1).error(function (res) {
      //   return $rootScope.message("Error Creating Project", 'warning');
      // }).success(function (res) {
      //   vm.isLoader = false;

      //   if (res === void 0 || res === null || res === '') {
      //     return $rootScope.message("Error Creating Project", 'warning');
      //   } else {
      //     $scope.getFolder();

      //   }


      // });
    };



    function archieveDialog(ev, id) {
      vm.title = 'Create New Archieve';
      if (id) {
        vm.id = parseInt(id);
      }
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/folders/dialogs/folder/archieve-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    $scope.hide = function() {
      $mdDialog.hide();
    };

    $scope.cancel = function() {
      $mdDialog.cancel();
    };

    $scope.answer = function(answer) {
      $mdDialog.hide(answer);
    };

  }

})();
