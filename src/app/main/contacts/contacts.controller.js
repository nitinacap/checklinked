(function () {
  'use strict';

  angular
    .module('app.contacts')
    .controller('ContactsController', ContactsController);

  /** @ngInject */
  function ContactsController($rootScope, $state, $cookies, $stateParams, $scope, $mdSidenav, msUtils, $mdDialog, $document, api, $http, $filter) {
    var vm = this;
    vm.user_id = $cookies.get('useridCON');


    vm.contacts = [];
    vm.LinkList = [];
    vm.isLoader = true;


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
    vm.Confirmation = Confirmation;
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



    // function to change the tab from the top menu vertical options starts
    $scope.$watch(function() {
      return $rootScope.curreManuItem;
    }, function() {
      if($rootScope.curreManuItemName === 'contacts'){
        vm.currentItem = parseInt($rootScope.curreManuItem);

        if(vm.currentItem === 1) $scope.myvalue = true;
         
      }
    }, true);

    // function to change the tab from the top menu vertical options ends

    function filterChange(type) {
      // ;
      vm.listType = type;

      var me = $rootScope.user.idCON;

      if (type === 'all') {
        vm.filterIds = null;
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
        vm.isLoader = false;
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm.contacts = res.friendships;
          vm.secondary = res.secondary;
          vm.internal = res.internal;
        
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
    function deleteConnection(idCON, type) {
      if (confirm('Are you sure you wish to delete this connection?')) {
        return vm.removeConnectionInvitation(idCON, type);
      }
    };
    
    function find(ev) {
      vm.findContacts = {
        criteria: {
          name: '',
          organization:'',
          city:'',
          state:''
        },
        searchCount: 0,
        searching: false,
        results: []
      };
      vm.openAddContactDialog(ev);
      return null;
    };

    vm.findContactsMessage = true;
    function queryContacts() {
      if (vm.findContacts.criteria.name === '') {
        return $rootScope.message('Please provide Search criteria.', 'warning');
      } else {
        vm.findContacts.searching = true;

        return api.contacts.find(vm.findContacts.criteria).success(function (res) {
          if (res.code) {
            vm.isLoader = false;
            return $rootScope.message(res.message, 'warning');
          } else {
            vm.findContactsMessage = res.contacts.length > 0 ? true : false;
            vm.findContacts.results = res.contacts;
            vm.findContacts.results2 = res.contacts;
            return vm.findContacts.searchCount += 1;
          }
        })["finally"](function () {
          return vm.findContacts.searching = false;
        });
      }
    };
    function acceptConnectionInvitation(idCON, index) {
      // ;
      if (vm.LinkList.length > 0) {
        for (var i = 0; i < vm.LinkList.length; i++) {
          if (vm.LinkList[i].contacts.originator.id == idCON) {
            vm.LinkList.splice(i, 1);
            break;
          }
        }
      }


      var friendship;
      friendship = vm.contacts[index];
      return api.contacts.invite.accept(idCON).success(function (res) {
        if (!res.code) {

          vm.contacts.remove(friendship);
          $state.go($state.current, {}, { reload: true });

          return vm.contacts.unshift(res.friendships[0]);
        }
      });
    };
    vm.spinner = false;
    function inviteToConnect(idCON) {
      vm.spinner = true;
      return api.contacts.invite.send(idCON, vm.message).success(function (res) {
        vm.spinner = false;
        if (!res.code) {
          updateFriends();
          $mdDialog.hide();
          vm.isMessage = true;
          return vm.contacts.unshift(res.friendships[0]);
        }
      });
    };
  
    function removeConnectionInvitation(idCON, type) {
      return api.contacts.invite.remove(idCON, type).success(function () {
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
        results = [];
        for (i = 0, len = invites.length; i < len; i++) {
          invite = invites[i];
          results.push(vm.contacts.splice(vm.contacts.indexOf($filter('filter')(vm.contacts, { id: invite.id }, true)[0]), 1));
        } 
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
    
    function openContactDialog(ev, contact) {
      // ;
      if(contact.organization_detail.name == undefined || contact == undefined)
      return;
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

    function Confirmation(ev, contact, idCON, type) {
      vm.title = 'Delete Contact';
      vm.warning = 'Warning';
      vm.description = "Please confirm you want to delete this contact.<br>This will prevent direct messages between you."
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      })
        .then(function (answer) {
          vm.removeConnectionInvitation(idCON, type);
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });


    }


    

    function openDirectMessageDialog(contact, ev,direct_msg) {

      vm.contact = contact;
      vm.titlea = "DATA HERE";

      vm.int_msg = direct_msg == 'direct-message' || direct_msg == 'secondary-message' || direct_msg == 'internal-message'  ? direct_msg : ''

      vm.which = vm.showWhichInviteContactData(contact);
      $mdDialog.show({
        controller: 'DirectMessageDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/contacts/dialogs/contact/direct-message-dialog.html',
        parent: angular.element($document.find('#contacts')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          contact: vm.contact,
          which: vm.which,
          int_msg: vm.int_msg
        }
      });

    }


    function openConversationDialog(ev, producerType, id, name) {
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
      vm.spinner = false;
      vm.isMessage = true;
      vm.message = '';
      $mdDialog.hide();
      vm.findContactsMessage = true;
    }

    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    vm.submenu = [
      { link: 'user', title: 'My Profile', active : false  },
      { link: 'contacts', title: 'Contacts', active : true  },
      { link: 'organization', title: 'Organization', active : false  },
      { link: 'teammembers', title: 'Account', active : false  }
    ];
    vm.sendToggle = sendToggle;
    vm.isMessage = true;

    function sendToggle(res, type) {
      vm.isMessage = false;
      vm.itemId = res.id;
      var data = [];

      if (type == 'close') {
        vm.spinner = false;
        vm.message = '';
        vm.isMessage = true;
        vm.findContacts.results = vm.findContacts.results2;
      }
      else {

        angular.forEach(vm.findContacts.results, function (item) {
          if (item.rid == res.rid) {
            data.push(item);
          }
        });
        vm.findContacts.results = data;
      }
    };

    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };


    vm.changeTab = function(tabName){

      if(tabName == 'Direct')  $scope.myvalue = true;
      else $scope.myvalue = false;
      
    }

  }
})();
