(function ()
{
    'use strict';

    angular
        .module('app.contacts')
        .controller('DirectMessageDialogController', DirectMessageDialogController);

    /** @ngInject */
    function DirectMessageDialogController($mdDialog, api, contact, which,int_msg, $document, $mdSidenav, $http, $rootScope, $scope)
    {
        var vm = this;

		vm.contact = contact;
    vm.which = which;
  
    
    vm.int_msg = int_msg;
    
    if(vm.int_msg == 'internal-message'){
        vm.to = vm.contact.name.full;
        vm.con_id = vm.contact.idCON;
    }
    else if(vm.int_msg == 'secondary-message'){
        vm.contact = 	vm.contact.contacts[vm.which];
        vm.to = vm.contact.name.full;
        vm.con_id = vm.contact.id;
    }
    else{
        vm.int_msg == 'direct-message'
        vm.to = vm.contact.contacts[which].name.full;
        vm.con_id = vm.contact.contacts[which].id;
    }
    


		vm.contact
		console.log('vm.contact.id', vm.contact.id);
		console.log('vm.contact', vm.contact);
		console.log('vm.which', vm.which);
		

        //Functions
    vm.title = 'Direct Message';
		vm.closeDialog = closeDialog;
		vm.submitPost = submitPost;
		vm.from = $rootScope.user.name.full;
    vm.to =  vm.to;


	function closeDialog()
    {
    $mdDialog.hide();
    }

    function submitPost() {
		// console.log('vm.contact', vm.contact);
		// console.log('vm.which', vm.which);
		// console.log('vm.contact.contacts[which].name.full', vm.contact.contacts[which].name.full);
		// console.log('vm.contact.contacts[which].id', vm.contact.contacts[which].id);
    // 	console.log('vm.message', vm.message);
    vm.con_id
     vm.message

      vm.submitting = true;
      // console.log('submitting convo entry', vm.contact.id, vm.message, 'message');
      return api.conversations.add(vm.con_id, vm.message, 'message',vm.int_msg).error(function(res) {
        return $rootScope.message('Error posting.', 'warning');
      }).success(function(res) {

        
        if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {
          vm.conversation.posts.unshift(res.posts[0]);
          $rootScope.socketio.emit('message', res.posts[0]);

         // vm.closeDialog();
        }

      })["finally"](function() {
        vm.submitting = false;
        vm.message = '';
      });
    };

    function getDirectMessage(id){
      vm.items = {'user_id':$rootScope.user.idCON , 'item_id':id};
     
      return api.contacts.getdirectmessage(vm.items).success(function (res) {
        if (res.type=='success') {
          vm.conversation = res;
        } else {
          vm.contacts = res.messages;
          return vm.loaded.friends = true;
        }
      });
    }

    
    getDirectMessage(vm.con_id);


    }
})();
