(function ()
{
    'use strict';

    angular
        .module('app.contacts')
        .controller('DirectMessageDialogController', DirectMessageDialogController);

    /** @ngInject */
    function DirectMessageDialogController($mdDialog, api, contact, which, $document, $mdSidenav, $http, $rootScope, $scope)
    {
        var vm = this;

		vm.contact = contact;
		vm.which = which;

		vm.contact
		console.log('vm.contact.id', vm.contact.id);
		console.log('vm.contact', vm.contact);
		console.log('vm.which', vm.which);
		console.log('vm.contact.contacts[which].name.full', vm.contact.contacts[which].name.full);
		console.log('vm.contact.contacts[which].id', vm.contact.contacts[which].id);

        //Functions
        vm.title = 'Direct Message';
		vm.closeDialog = closeDialog;
		vm.submitPost = submitPost;
		vm.from = $rootScope.user.name.full;
    vm.to = vm.contact.contacts[which].name.full;


	function closeDialog()
    {
    $mdDialog.hide();
    }

    function submitPost() {
		console.log('vm.contact', vm.contact);
		console.log('vm.which', vm.which);
		console.log('vm.contact.contacts[which].name.full', vm.contact.contacts[which].name.full);
		console.log('vm.contact.contacts[which].id', vm.contact.contacts[which].id);
    	console.log('vm.message', vm.message);


      vm.submitting = true;
      console.log('submitting convo entry', vm.contact.id, vm.message, 'message');
      return api.conversations.add(vm.contact.id, vm.message, 'message').error(function(res) {
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


    }
})();
