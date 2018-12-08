(function ()
{
    'use strict';

    angular
        .module('app.contacts')
        .controller('ContactDialogController', ContactDialogController);

    /** @ngInject */
    function ContactDialogController($rootScope, $mdDialog, Contact, Contacts, User, msUtils, api)
    {
        var vm = this;

        // Data
        vm.title = 'View Contact';
        vm.contact = angular.copy(Contact);
        vm.contacts = Contacts;
        //vm.user = User;
        vm.newContact = false;
        vm.allFields = false;


		console.log('vm.contact', vm.contact.contacts.originator.name.full);


        if (!vm.contact) {
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

            vm.title = 'New Contact';
            vm.newContact = true;
            vm.contact.tags = [];
        }

        // Methods
        vm.addNewContact = addNewContact;
        vm.saveContact = saveContact;
        vm.deleteContactConfirm = deleteContactConfirm;
        vm.closeDialog = closeDialog;
        vm.toggleInArray = msUtils.toggleInArray;
        vm.exists = msUtils.exists;
		vm.showWhichInviteContactData = showWhichInviteContactData;
        //////////
        
        
	function showWhichInviteContactData(friend)
     {
      var ref2, ref3, ref4;
      if (((ref2 = $rootScope.user) != null ? ref2.idCON : void 0) === (friend != null ? (ref3 = friend.contacts) != null ? (ref4 = ref3.accepter) != null ? ref4.id : void 0 : void 0 : void 0)) {
        return 'originator';
      }else{
      return 'accepter';
      } 
    }

        /**
         * Add new contact
         */
        function addNewContact()
        {
            vm.contacts.unshift(vm.contact);

            closeDialog();
        }

        /**
         * Save contact
         */
        function saveContact()
        {
            // Dummy save action
            for ( var i = 0; i < vm.contacts.length; i++ )
            {
                if ( vm.contacts[i].id === vm.contact.id )
                {
                    vm.contacts[i] = angular.copy(vm.contact);
                    break;
                }
            }

            closeDialog();
        }

        /**
         * Delete Contact Confirm Dialog
         */
        
        
        function deleteContactConfirm(ev, contact, idCON)
        {				
				
        	var confirm = $mdDialog.confirm()
                .title('Are you sure want to delete the contact?')
                .htmlContent('<b>' + contact + '</b>' + ' will be deleted.')
                .ariaLabel('delete contact')
                .targetEvent(ev)
                .ok('OK')
                .cancel('CANCEL');

            $mdDialog.show(confirm).then(function ()
            {
					console.log('Delete by idCON:', idCON);
		        	api.contacts.destroy(idCON);
		            vm.contacts.splice(vm.contacts.indexOf(Contact), 1);
            });
        }
        

        /**
         * Close dialog
         */
        function closeDialog()
        {
            $mdDialog.hide();
        }

    }
})();