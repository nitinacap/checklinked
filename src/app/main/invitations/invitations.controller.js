(function () {
  'use strict';

  angular
    .module('app.invitations')
    .controller('InvitationsController', InvitationsController);

  /** @ngInject */
  function InvitationsController($rootScope, $http, $scope, api, $mdSidenav, $mdDialog, $document, $filter, $stateParams, $state) {

    var vm = this;

    $scope.$on('event:userLoaded', function (e, data) {
      console.log('received event:userLoaded', data);

    });

    vm.inviteContact = inviteContact;
    vm.setBlank = setBlank;
    vm.openFolderInput = openFolderInput;
    vm.cancelFolderInput = cancelFolderInput;
    vm.cancelChecklistInput = cancelChecklistInput;
    vm.openGroupInput = openGroupInput;
    vm.openAcceptChecklistInvitations = openAcceptChecklistInvitations;
    vm.openAcceptGroupInvitations = openAcceptGroupInvitations;
    vm.cancelGroupInput = cancelGroupInput;
    vm.fetchGroups = fetchGroups;
    vm.sendForm = sendForm;
    vm.determineOrder = determineOrder;
    vm.closeDialog = closeDialog;
    vm.addNewGroup = addNewGroup;
    vm.addNewFolder = addNewFolder;

    vm.passID = $stateParams.passID;
    vm.isLoader = true;
    console.log('vm.passID', vm.passID);

    vm.folders = [];
    vm.groups = [];

    vm.wizard = {
      newFolder: false,
      newGroup: false
    };

    console.log('console', $rootScope.inviteCounts.checklists);
    console.log('console', $rootScope.inviteCounts.friendships);

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

    function sendForm(ev) {

      if (vm.verticalStepper.step2) {
        vm.inviteControl.assign(vm.verticalStepper.step2.groupID);
        $rootScope.message('Invitation Accepted', 'success');
      } else {
        vm.inviteControl.assign(vm.verticalStepper.step1.folderID);
        $rootScope.message('Invitation Accepted', 'success');
      }
      vm.formWizard = {};
      $mdDialog.hide();
    }

    api.folders.get().then(function (d) {
      
      if (d.data.code == '-1') {
        $scope.subscriptionAlert(d.data.message);
      }
      vm.folders = d.data.folders;
      console.log('vm.folders', vm.folders);
    });

    function openFolderInput() {
      vm.wizard.newFolder = true;
      vm.wizard.newGroup = false;
      vm.wizard.newChecklist = false;
    }

    function cancelFolderInput() {
      return vm.wizard.newFolder = false;
    }

    function cancelChecklistInput() {
      vm.closeDialog();
    }

    function openGroupInput() {
      vm.wizard.newFolder = false;
      vm.wizard.newChecklist = false;
      vm.wizard.newGroup = true;
    }

    function cancelGroupInput() {
      return vm.wizard.newGroup = false;
    }


    function fetchGroups(id) {
      vm.groups = $rootScope.children('groups', id);
      $rootScope.organizeData();
    };

    console.log('vm.folders', vm.folders);

    function inviteContact(group) {
      $('#group_' + group.id).modal('show');
      return null;
    };

    function setBlank() {
      vm.invites = {
        loaded: false,
        received: [],
        sent: []
      };
      vm.tree = [];
      return $rootScope.loading.invites = false;
    };

    vm.setBlank();

    vm.inviteControl = {
      assigning: null,
      error: null,
      remove: function (type, invite) {
        var idx;
        console.log('removing invite', type, invite);
        idx = vm.invites[type].indexOf(invite);
        if (idx === -1) {
          return console.log('Could not index invite for removal');
        } else {
          console.log('invite indexed for removal', idx);
          vm.invites[type].splice(idx, 1);
          return console.log('invite removed', vm.invites[type]);
        }
      },
      load: function () {
        console.log('loading folder invites');
        $rootScope.loading.invites = true;
        return api.checklists.invite.get().error(function (res) {
          return vm.inviteControl.error = 'Unknown error talking to server.';
        }).success(function (res) {
          vm.isLoader = false;
          if (res.code) {
            console.log('res.code', res);
            return vm.inviteControl.error = res.message;
          } else {
            console.log('res.code', res);
            return vm.invites = res.invites;
          }
        })["finally"](function () {
          vm.invites.loaded = true;
          return $rootScope.loading.invites = false;
        });
      },
      destroy: function (type, invite) {
        console.log('type/invite', type, invite);

        invite.destroying = true;

        return api.checklists.invite.destroy(invite).error(function (res) {
          console.log('destroy type/invite', type, invite);
          console.log('waz up blackfuck', res);
          invite.destroying = false;
          invite.errors.destroying = res;
        }).success(function (res) {
          if (res.code) {
            console.log('waz up faggot');
            console.log('res', res);
            return invite.destroying = false;
          } else {
            vm.inviteControl.remove(type, invite);
            return $rootScope.message('Invitation has been deleted', 'success');
            return $rootScope.socketio.emit('invite_answered', invite);
          }
        });
      },
      accept: function (ev, invite) {

        vm.verticalStepper = {
          step1: {},
          step2: {}
        };

        console.log('vm.folders', vm.folders);
        console.log('invite', invite);

        $mdDialog.show({
          controller: function DialogController($scope, $mdDialog) {
            $scope.closeDialog = function () {
              $mdDialog.hide();
            }
          },
          scope: $scope,
          preserveScope: true,
          templateUrl: 'app/main/invitations/dialogs/invitation-accept-dialog.html',
          parent: angular.element($document.find('#invitations')),
          targetEvent: ev,
          clickOutsideToClose: true
        });
        vm.inviteControl.assigning = invite;
      },
      acceptChecklist: function (invite, ev) {
        console.log('invite checklist', invite);
        vm.openAcceptChecklistInvitations(invite, ev);
        vm.inviteControl.assigning = invite;
        return null;
      },
      acceptGroup: function (invite, ev) {
        console.log('invite group', invite);
        vm.openAcceptGroupInvitations(invite, ev);
        vm.inviteControl.assigning = invite;
        return null;
      },
      assign: function (idPARENT) {
        var id, invite, order, name;
        invite = vm.inviteControl.assigning;
        invite.accepting = true;
        invite.errors = $.extend({}, invite.errors, {
          accepting: null
        });
        order = vm.determineOrder(invite.type, idPARENT);
        name = name != null ? name : invite.type === 'group' ? invite.name : invite.checklist.name;
        id = invite.type === 'group' ? invite.id : invite.checklist.id;

        console.log('invite', invite);
        console.log('idPARENT', idPARENT);
        console.log('name', name);
        console.log('order', order);
        return api.checklists.invite.accept(invite, idPARENT, name, order).error(function (res) {
          return invite.errors.accepting = res;
        }).success(function (res) {
          var group, ref;
          if (res.code) {
            return invite.errors.accepting = res.message;
          } else {
            vm.invites.received.remove(invite);
            if (invite.type === 'group') {
              $rootScope.groups.push(res.groups[0]);
              $rootScope.checklists = $rootScope.checklists.concat(res.checklists);
            } else {
              $rootScope.checklists.push(res.checklists[0]);
            }
            $rootScope.organizeData();
            if (invite.type === 'checklist') {
              $rootScope.notify({
                idCHK: invite.checklist.id,
                idFDI: res.checklists[0].idFDI_latest,
                type: 'joined',
                user: invite.users.inviter
              });
            }
            if (invite.type === 'group') {
              group = (ref = $filter('filter')($rootScope.groups, {
                id: res.groups[0].id
              }, true)) != null ? ref[0] : void 0;
              console.log('group found?', group, $rootScope.groups);
              if (typeof group === 'object') {
                return group.checklists.forEach(function (checklist) {
                  return $rootScope.notify({
                    idCHK: checklist.idCHK,
                    idFDI: checklist.idFDI_latest,
                    type: 'joined'
                  });
                });
              }
            }
          }
        })["finally"](function () {
          return invite.accepting = false;
        });
      }
    };

    function openAcceptChecklistInvitations(invite, ev) {
      vm.title = invite.checklist.name;
      vm.name = invite.checklist.name;
      vm.checklistID = invite.checklist.id;

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/invitations/dialogs/invitation-accept-checklist-dialog.html',
        parent: angular.element($document.find('#invitations')),
        targetEvent: ev,
        clickOutsideToClose: true,
      });
    };

    function openAcceptGroupInvitations(invite, ev) {
      vm.title = invite.name;
      vm.name = invite.name;
      vm.checklistID = invite.id;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/invitations/dialogs/invitation-accept-group-dialog.html',
        parent: angular.element($document.find('#invitations')),
        targetEvent: ev,
        clickOutsideToClose: true,
      });
    };

    $scope.$on('event:userSelected', function () {
      return vm.setBlank();
    });
    $scope.$on('event:userLoaded', function () {
      if (!vm.invites.loaded && !$rootScope.loading.invites) {
        return vm.inviteControl.load();
      }
    });
    $scope.$on('event:checklistInviteCountChanged', function () {
      if ($rootScope.userAuthenticated() && !$rootScope.loading.invites) {
        return vm.inviteControl.load();
      }
    });
    if (!vm.invites.loaded && !$rootScope.loading.invites) {
      vm.inviteControl.load();
    }


    function addNewFolder() {
      vm.folder.sending = true;
      vm.folder.order = 1;
      vm.folder.attachment = '';
      vm.folder.link = '';
      vm.folder.order += vm.folders ? vm.folders.length : '';

      api.folders.add(vm.folder.name, vm.folder.description, vm.folder.link, vm.folder.attachment, vm.folder.order, '', '').error(function (res) {
        return $rootScope.message("Error Creating Workflow", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Creating Workflow", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          vm.verticalStepper = {
            newFolderID: res.folder.id
          }
          cancelGroupInput();
          $rootScope.$broadcast('event:updateModels');
          vm.folders.push(res.folder);
          $rootScope.organizeData();
          fetchGroups(res.folder.id);
          $rootScope.message('New project created successfully');

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
        return $rootScope.message("Error Adding Workflow", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Adding Workflow", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          console.log('res.groups', res.groups);
          $rootScope.$broadcast('event:updateModels');
          if (res.group && res.group.length > 0) {
            vm.groups.push(res.group);
          }

          $rootScope.organizeData();
          ftchFolder(folderID)
          vm.verticalStepper.newGroupID = res.group.id;
          vm.verticalStepper.newFolderID = res.group.id_parent;

          vm.wizard.newGroup = false;
          vm.wizard.switch = false;


          $rootScope.message('New workflow created successfully');
        }
      });
    };

    function fetchGroups(id) {
      ftchFolder(id ? id : vm.verticalStepper.step1.folderID)
      vm.groups = $rootScope.children('groups', id ? id : vm.verticalStepper.step1.folderID);
      $rootScope.organizeData();

      // if (!vm.groups.length > 0) {
      //   vm.wizard.switch = true;
      // } else {
      //   vm.wizard.switch = false;
      // }
    };
    function ftchFolder(id) {
      api.groups.get(id).then(function (d) {

        vm.groups = d.data.groups;
        $rootScope.nextStep()
      });
    }


    function closeDialog() {
      $mdDialog.hide();
    }


    //Subscription expired alert
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

    // Content sub menu
    vm.submenu = [
      { link: 'alerts', title: 'Alerts' },
      { link: '', title: 'Action Items' },
      { link: 'chat.message', title: 'Messages' },
      { link: 'notification', title: 'Notifications' }

    ];


  }

})();
