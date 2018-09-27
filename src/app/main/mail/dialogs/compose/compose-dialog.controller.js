(function () {
  'use strict';

  angular
    .module('app.mail')
    .controller('ComposeDialogController', ComposeDialogController);

  /** @ngInject */
  function ComposeDialogController($mdDialog, selectedMail, type, $rootScope, api) {
    var vm = this;

    console.log('selectedMail', selectedMail);

    vm.selectedMail = selectedMail;
    vm.convoId = selectedMail.id;
    vm.contact = selectedMail.user;
    vm.item = selectedMail.item;
    vm.type = selectedMail.type;

    // Data
    vm.form = {
      from: $rootScope.user.name.full,
      to: vm.contact.name

    };

    vm.hiddenCC = true;
    vm.hiddenBCC = true;

    // Methods
    vm.closeDialog = closeDialog;
    vm.submitPost = submitPost;

    function submitPost() {

      vm.submitting = true;

      if (vm.type ==='message') {
        console.log('submitting convo entry', vm.selectedMail.idVIEW, vm.form.message, vm.type);
        api.conversations.add(vm.selectedMail.idVIEW, vm.form.message, vm.type).error(function (res) {
          $rootScope.message('Error posting.', 'warning');
        }).success(function (res) {
          if (res.code) {
            $rootScope.message(res.message, 'warning');
          } else {
            $rootScope.message('Message has been posted.', 'success');
            $rootScope.socketio.emit('message', res.posts[0]);
          }
        })["finally"](function () {
          vm.submitting = false;
          vm.message = '';
          vm.closeDialog();
        });
      }


      if (vm.type === 'post') {
        console.log('submitting convo entry', vm.selectedMail.idVIEW, vm.form.message, vm.type, vm.item.type);
        api.conversations.reply(vm.selectedMail.idVIEW, vm.form.message, vm.item.type, vm.type).error(function (res) {
          return $rootScope.message('Error posting.', 'warning');
        }).success(function (res) {
          if (res.code) {
            return $rootScope.message(res.message, 'warning');
          } else {
            $rootScope.message('Conversation has been posted.', 'success');
            $rootScope.socketio.emit('message', res.posts[0]);
          }

        })["finally"](function () {
          vm.submitting = false;
          vm.message = '';
          vm.closeDialog();
        });

      }

    };

 function closeDialog() {
      $mdDialog.hide();
    }
  }
})();
