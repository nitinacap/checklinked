(function ()
{
    'use strict';

    angular
        .module('app.mail')
        .controller('ComposeDialogController', ComposeDialogController);

    /** @ngInject */
    function ComposeDialogController($mdDialog, selectedMail, type, $rootScope, api)
    {
        var vm = this;

		//console.log('rootScope', $rootScope);
		
		console.log('selectedMail', selectedMail);
		
		vm.selectedMail = selectedMail;
		vm.convoId = selectedMail.id;
		vm.contact = selectedMail.user;
		vm.item = selectedMail.item;
		vm.type = selectedMail.type;
		
		
		console.log('vm.contact', vm.contact);
		
        // Data
        vm.form = {
            from: $rootScope.user.name.full
        };

        vm.hiddenCC = true;
        vm.hiddenBCC = true;

        // If replying
        if ( angular.isDefined(selectedMail) )
        {
            vm.form.to = selectedMail.user.name;
            vm.form.subject = 'RE: ' + selectedMail.item.type;
            vm.form.message = '\n\n-------Original Message-----------\n' + selectedMail.item.text;
        }

        // Methods
        vm.closeDialog = closeDialog;
        vm.submitPost = submitPost;

     	function submitPost() {

	//			console.log('vm.contact', vm.contact);
	//			console.log('vm.contact.contacts[which].name.full', vm.contact.contacts[which].name.full);
	//			console.log('vm.contact.contacts[which].id', vm.contact.contacts[which].id);    	
	//	    	console.log('vm.message', vm.message);
	//			console.log('vm.contact.id', vm.contact.id);
	
    	
    	console.log('vm.selectedMail', vm.selectedMail);
    	
    	console.log('vm.form.message', vm.form.message);
    	
    	console.log('vm.type', vm.type);
    	
    	console.log('vm.item.type', vm.item.type);

    		
      vm.submitting = true;
      console.log('submitting convo entry', vm.selectedMail.idVIEW, vm.form.message, vm.type, vm.item.type);
      return api.conversations.reply(vm.selectedMail.idVIEW, vm.form.message, vm.type, vm.item.type).error(function(res) {
        return $rootScope.message('Error posting.', 'warning');
      }).success(function(res) {
        if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {
          $rootScope.socketio.emit('message', res.posts[0]);
          
          vm.closeDialog();
        }
        
      })["finally"](function() {
        vm.submitting = false;
        vm.message = '';
      });
    };


        function closeDialog()
        {
            $mdDialog.hide();
        }
    }
})();
