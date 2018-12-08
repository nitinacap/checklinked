(function () {
  'use strict';

  angular
    .module('app.contacts')
    .controller('ContactsController', ContactsController);

  /** @ngInject */
  function ContactsController($rootScope, $state, $stateParams, $scope, $mdSidenav, msUtils, $mdDialog, $document, api, $http, $filter) {
    var vm = this;


    vm.contacts = [];
    vm.LinkList = [];

    api.contacts.get().then(function (d) {
      debugger;
      vm.contacts = d.data.friendships;
      var me = $rootScope.user.idCON;
      vm.LinkList = $filter('filter')(vm.contacts, function (invite) {
        return (invite.contacts.originator.id !== me && invite.accepted == '');
      });
      console.log("MUser", $rootScope.user);
      if ($stateParams.passID) {
        vm.filterChange('invitations');
      }
      console.log('vm.contacts', vm.contacts);
    });

    vm.user = $rootScope.user;

    vm.contacts.shift = showWhichInviteContactData(vm.contacts);

    vm.filterIds = null;
    vm.listType = 'all';
    vm.listOrder = 'name';
    vm.listOrderAsc = false;
    vm.selectedContacts = [];
    vm.newGroupName = '';
    vm.showIDs = [];

    vm.filterChange = filterChange;
    vm.openContactDialog = openContactDialog;
    vm.openAddContactDialog = openAddContactDialog;
    vm.deleteContactConfirm = deleteContactConfirm;
    vm.toggleSidenav = toggleSidenav;
    vm.setBlank = setBlank;
    vm.updateFriends = updateFriends;
    vm.friendshipStatus = friendshipStatus;
    vm.invitationStatus = invitationStatus;
    vm.deleteConnection = deleteConnection;
    vm.find = find;
    vm.queryContacts = queryContacts;
    vm.acceptConnectionInvitation = acceptConnectionInvitation;
    vm.inviteToConnect = inviteToConnect;
    vm.removeConnectionInvitation = removeConnectionInvitation;
    vm.showWhichInviteContactData = showWhichInviteContactData;
    vm.openDirectMessageDialog = openDirectMessageDialog;
    vm.openConversationDialog = openConversationDialog;
    vm.closeDialog = closeDialog;

    vm.passID = $stateParams.passID;

    //console.log('vm.passID', vm.passID);

    function filterChange(type) {
      debugger;
      vm.listType = type;

      var me = $rootScope.user.idCON;

      if (type === 'all') {
        vm.filterIds = null;
        console.log('vm.listType.name', vm.listType.name);
      }
      else if (type === 'invitations') {
        var out = [];
        vm.filterIds = [];
        out = $filter('filter')(vm.contacts, function (invite) {
          return (invite.contacts.originator.id !== me && invite.accepted == '');
        });
        out.forEach(function (invite) {
          vm.filterIds.push(invite.id);
        });
      }
      else if (type === 'requests') {
        var out = [];
        vm.filterIds = [];
        out = $filter('filter')(vm.contacts, function (invite) {
          return (invite.contacts.originator.id == me && invite.accepted == '');
        });
        out.forEach(function (invite) {
          vm.filterIds.push(invite.id);
        });
        console.log('filterIds (requests)', vm.filterIds);
      }
      else if (angular.isObject(type)) {
        vm.filterIds = type.contactIds;
      }
      vm.selectedContacts = [];
    }


    function setBlank() {
      vm.contacts = [];
      vm.loading = {
        friends: false,
        invites: false
      };
      return vm.loaded = {
        friends: false,
        invites: false
      };
    };
    vm.setBlank();

    function updateFriends() {
      vm.loading.friends = true;
      return api.contacts.get().success(function (res) {
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm.contacts = res.friendships;
          return vm.loaded.friends = true;
        }
      })["finally"](function () {
        return vm.loading.friends = false;
      });
    };
    $scope.$on('event:friendshipInviteCountUpdated', function () {
      return vm.updateFriends();
    });
    $scope.$on('event:userSelected', function () {
      return vm.setBlank();
    });
    $scope.$on('event:userLoaded', function () {
      console.log('event:userLoaded was triigered');
      if (!vm.loading.friends && !vm.loaded.friends) {
        return vm.updateFriends();
      }
    });
    if (!vm.loading.friends && !vm.loaded.friends) {
      vm.updateFriends();
    }
    function friendshipStatus(idCON) {
      var friend, i, key, len, ref;
      ref = vm.contacts;
      for (key = i = 0, len = ref.length; i < len; key = ++i) {
        friend = ref[key];
        if (friend.accepted === '') {
          if (friend.contacts.accepter.id === idCON) {
            return 'Sent';
          } else if (friend.contacts.originator.id === idCON) {
            return 'Received';
          }
        } else {
          if (friend.contacts.accepter.id === idCON) {
            return 'Friend';
          } else if (friend.contacts.originator.id === idCON) {
            return 'Friend';
          }
        }
      }
      return 'Strangers';
    };
    function invitationStatus(idCON, invite) {
      if (invite == null) {
        invite = null;
      }
      if (invite.accepted !== '') {
        return 'Friend';
      }
      if (invite.contacts.accepter.id === idCON) {
        return 'Received';
      }
      if (invite.contacts.originator.id === idCON) {
        return 'Sent';
      } else {
        return 'Strangers';
      }
    };
    function deleteConnection(idCON) {
      if (confirm('Are you sure you wish to delete this connection?')) {
        return vm.removeConnectionInvitation(idCON);
      }
    };
    function find(ev) {
      vm.findContacts = {
        criteria: {
          queryString: ''
        },
        searchCount: 0,
        searching: false,
        results: []
      };
      vm.openAddContactDialog(ev);
      return null;
    };
    function queryContacts() {
      console.log('queryContacts', vm.findContacts.criteria.queryString);
      if (vm.findContacts.criteria.queryString === '') {
        return $rootScope.message('Please provide Search criteria.', 'warning');
      } else {
        vm.findContacts.searching = true;
        return api.contacts.find(vm.findContacts.criteria.queryString).success(function (res) {
          if (res.code) {
            return $rootScope.message(res.message, 'warning');
          } else {
            vm.findContacts.results = res.contacts;
            return vm.findContacts.searchCount += 1;
          }
        })["finally"](function () {
          return vm.findContacts.searching = false;
        });
      }
    };
    function acceptConnectionInvitation(idCON, index) {
      debugger;
      if (vm.LinkList.length > 0) {
        for (var i = 0; i < vm.LinkList.length; i++) {
          if (vm.LinkList[i].contacts.originator.id == idCON) {
            vm.LinkList.splice(i, 1);
            console.log(vm.LinkList);
            break;
          }
        }
      }


      var friendship;

      friendship = vm.contacts[index];

      console.log('friendship', friendship);

      return api.contacts.invite.accept(idCON).success(function (res) {
        if (!res.code) {

          vm.contacts.remove(friendship);
          $state.go($state.current, {}, { reload: true });
          //console.log('res.friendships[0]', res.friendships[0]);

          return vm.contacts.unshift(res.friendships[0]);
        }
      });
    };
    function inviteToConnect(idCON) {
      return api.contacts.invite.send(idCON).success(function (res) {
        if (!res.code) {
          return vm.contacts.unshift(res.friendships[0]);
        }
      });
    };
    function removeConnectionInvitation(idCON) {
      return api.contacts.invite.remove(idCON).success(function () {
        var i, invite, invites, len, results;
        invites = $filter('filter')(vm.contacts, {
          contacts: {
            accepter: {
              id: idCON
            }
          }
        }, true);
        invites = invites.concat($filter('filter')(vm.contacts, {
          contacts: {
            originator: {
              id: idCON
            }
          }
        }, true));
        console.log('invites from filter', invites);
        results = [];
        for (i = 0, len = invites.length; i < len; i++) {
          invite = invites[i];
          results.push(vm.contacts.splice(vm.contacts.indexOf($filter('filter')(vm.contacts, { id: invite.id }, true)[0]), 1));
          console.log('removed invites[i]', invites, vm.contacts);
        } $state.go($state.current, {}, { reload: true });
        console.log('vm.contact removed', vm.contacts, results);

        return results;
      });
    };
    function showWhichInviteContactData(friend) {

      var ref, ref1, ref2;
      if (((ref = $rootScope.user) != null ? ref.idCON : void 0) === (friend != null ? (ref1 = friend.contacts) != null ? (ref2 = ref1.accepter) != null ? ref2.id : void 0 : void 0 : void 0)) {
        return 'originator';
      }
      return 'accepter';
    };
    debugger;
    function openContactDialog(ev, contact) {

      vm.contact = angular.copy(contact);

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/contacts/dialogs/contact/contact-dialog.html',
        parent: angular.element($document.find('#contacts')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function openAddContactDialog(ev) {
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/contacts/dialogs/contact/add-contact-dialog.html',
        parent: angular.element($document.find('#contacts')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function deleteContactConfirm(ev, contact, idCON) {
      console.log(contact);
      var confirm = $mdDialog.confirm()
        .title('Are you sure want to delete the contact?')
        .htmlContent('<b>' + contact.name.full + '</b>' + ' will be deleted.')
        .ariaLabel('delete contact')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        vm.removeConnectionInvitation(idCON);
      });

    }


    /*
     function openDirectMessageDialog(contact, ev)	{

     var which;

     which = vm.showWhichInviteContactData(contact)

     console.log('contact.contacts[which].name.full', contact.contacts[which].name.full);

     $mdDialog.show({
     scope			   : $scope,
     preserveScope	   : true,
     templateUrl        : 'app/main/contacts/dialogs/contact/direct-message-dialog.html',
     parent             : angular.element($document.find('#content-container')),
     targetEvent        : ev,
     clickOutsideToClose: true,
     locals             : {
     contactId : contact.id,
     contactName : contact.contacts[which].name.full
     }
     });
     }

     */

    function openDirectMessageDialog(contact, ev) {

      vm.contact = contact;

      vm.which = vm.showWhichInviteContactData(contact);

      console.log('vm.which', vm.which); console.log('vm.which', vm.which);

      $mdDialog.show({
        controller: 'DirectMessageDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/contacts/dialogs/contact/direct-message-dialog.html',
        parent: angular.element($document.find('#contacts')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          contact: vm.contact,
          which: vm.which
        }
      });

    }


    function openConversationDialog(ev, producerType, id, name) {

      console.log('id', id);
      console.log('name', name);
      console.log('producerType', producerType);

      $mdDialog.show({
        controller: 'ChecklistConversationDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-conversation-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          convoId: id,
          convoName: name,
          producerType: producerType
        }
      });
    }


    if (vm.passID) {
      vm.filterChange('invitations');

    }


    function closeDialog() {
      $mdDialog.hide();
    }

    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    vm.submenu = [
      { link: 'user', title: 'My Profile' },
      { link: '', title: 'Contacts' },
      { link: 'organization', title: 'Organization' },
      { link: 'account', title: 'Account' }
    ];



  }
})();
