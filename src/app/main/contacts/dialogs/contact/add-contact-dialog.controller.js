(function ()
{
    'use strict';

    angular
        .module('app.contacts')
        .controller('AddContactDialogController', AddContactDialogController);

    /** @ngInject */
    function AddContactDialogController($rootScope, $filter, $mdDialog, msUtils, api, Contacts)
    {
        var vm = this;

        // Data
        vm.contacts = Contacts;
        vm.title = 'Add New Contact';
        vm.newContact = false;
        vm.allFields = false;
        vm.searching = false;
        vm.find = '';
        vm.friends = [];
        vm.loading = {friends: true};
   
        if ( !vm.contact )	{

            vm.contact = {
                'id'      : msUtils.guidGenerator(),
                'first'   : '',
                'last'	  : '',
                'avatar'  : '/assets/images/avatars/profile.jpg',
                'full'	  : '',
                'company' : '',
                'email'   : '',
                'phone'   : '',
                'notes'   : ''
         };

            vm.title = 'Add New Contact';
            vm.newContact = true;
        }

        // Methods
        vm.addNewContact = addNewContact;
        vm.closeDialog = closeDialog;
        vm.toggleInArray = msUtils.toggleInArray;
        vm.exists = msUtils.exists;
        vm.queryContacts = queryContacts;
        vm.friendshipStatus = friendshipStatus;
        vm.acceptConnectionInvitation = acceptConnectionInvitation;
        vm.removeConnectionInvitation = removeConnectionInvitation;
        vm.inviteToConnect = inviteToConnect;

    $rootScope.$watch('user', function(value) {
      if (typeof value === 'object') {
        return api.contacts.get().success(function(res) {
          if (res.code) {
            return $rootScope.message(res.message, 'warning');
          } else {
            return vm.friends = vm.friends.concat(res.friendships);
          }
        })["finally"](function() {
          return vm.loading.friends = false;
        });
      }
    });
    
    
	 function queryContacts() {
      if (vm.find.query === '') {
        return $rootScope.message('Please provide Search criteria.', 'warning');
      } else {
        vm.searching = true;
        return api.contacts.find(vm.find.query).success(function(res) {
          if (res.code) {
          	return $rootScope.message(res.message, 'warning');
          } else {
            vm.find.results = res.contacts;	
            return vm.find.searchCount += 1;
          }
        })["finally"](function() {
          return vm.searching = false;
        });
      }
    };

    function friendshipStatus(idCON) {
      var friend, i, key, len, ref;
      ref = vm.friends;
      
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

 	function acceptConnectionInvitation(idCON, index) {
      var friendship;
      friendship = vm.friends[index];
      return api.contacts.invite.accept(idCON).success(function(res) {
        if (!res.code) {
          vm.friends.remove(friendship);
          return vm.friends.unshift(res.friendships[0]);
        }
      });
    };
    
    function inviteToConnect(idCON) {
      return api.contacts.invite.send(idCON).success(function(res) {
        if (!res.code) {
        	//vm.contacts.splice(vm.contacts.indexOf(Contact), 1);
          return vm.friends.unshift(res.friendships[0]);
        }
      });
    };
    
    function removeConnectionInvitation(idCON) {

      return api.contacts.invite.remove(idCON).success(function() {
        var i, invite, invites, len, results;
        invites = $filter('filter')(vm.friends, {
          contacts: {
            accepter: {
              id: idCON
            }
          }
        }, true);
        invites = invites.concat($filter('filter')(vm.friends, {
          contacts: {
            originator: {
              id: idCON
            }
          }
        }, true));
        results = [];
        for (i = 0, len = invites.length; i < len; i++) {
          invite = invites[i];
          results.push(vm.friends.remove(invite));
        }
  
        return results;
      });
    };
       
        function addNewContact()
        {
            vm.contacts.unshift(vm.contact);
            closeDialog();
        }


        function closeDialog()
        {
           	$mdDialog.hide();
        }

    }
})();