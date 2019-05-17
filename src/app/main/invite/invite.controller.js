(function () {
  'use strict';

  angular
    .module('app.invite')
    .controller('InviteController', InviteController);

  /** @ngInject */
  function InviteController($rootScope, $state, api, $stateParams,$scope, $mdDialog) {

    var vm = this;
    var idSUI;

    vm.loading = false;
    vm.inviting = false;
    vm.makingSubActive = false;
    vm.withdrawing = [];
    vm.invite = null;
    vm.closeDialog = closeDialog;

    vm.acceptInviteCreateAccount = acceptInviteCreateAccount;
    vm.view = {
      legacy: false,
      create: false
    }
    vm.accountCreate = false;

    vm.viewToggle = viewToggle;
    vm.resetToggle = resetToggle;


    idSUI = $stateParams.id;

    if (idSUI !== void 0 && idSUI !== null && idSUI !== '') {

      vm.acceptInvite = {
        accepting: false,
        signin: {
          username: '',
          password: ''
        },
        reg: {
          contact: {
            name: {
              first: '',
              middle: '',
              last: ''
            },
            phone: vm.invites ? vm.invites.json_data.phone : '',
            email: ''
          },
          password: '',
          password2: ''
        },
        login: function () {
          console.log('idSUI', idSUI);
          debugger;

          vm.acceptInvite.accepting = true;
          return api.subscriptions.acceptInvite(idSUI, 'login', vm.acceptInvite.signin).error(function (res) {
            console.log('invite accept error', idSUI, res);
            return $rootScope.message('Error accepting invitation.', 'warning');
          }).success(function (res) {
            if (res === void 0 || res === null || res === '') {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message('Invalid response.', 'warning');
            } else if (res.code) {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message(res.message, 'warning');
            } else {
              return vm.acceptInvite.succeeded(res.user.token);
            }
          })["finally"](function () {
            return vm.acceptInvite.accepting = false;
          });
        },
        signup: function () {
          console.log(' vm.invites',  vm.invites);
          console.log('vm.acceptInvite.reg', vm.acceptInvite.reg);
          console.log('idSUI', idSUI);
          vm.acceptInvite.reg.contact.phone = vm.invites ? vm.invites.json_data.phone : '';
          vm.acceptInvite.reg.existing_data = vm.invites ? vm.invites.json_data : '';
          vm.acceptInvite.reg.organization_id = vm.invites ? vm.invites.organization.organization_id : '';

          vm.acceptInvite.accepting = true;
          return api.subscriptions.acceptInvite(idSUI, 'signup', vm.acceptInvite.reg).error(function (res) {
            console.log('invite accept error', idSUI, res);
            return $rootScope.message('Error accepting invitation.', 'warning');
          }).success(function (res) {
            if (res === void 0 || res === null || res === '') {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message('Invalid response.', 'warning');
            } else if (res.code && !res.original) {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message(res.message, 'warning');
            }
            else if (res.message.original.success='0') {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message(res.message.original.success, 'warning');
            } else {
              $state.go('app.logout');
             // return vm.acceptInvite.succeeded(res.user.token);
            }
          })["finally"](function () {
            return vm.acceptInvite.accepting = false;
          });
        },
         extingSignup: function () {
   
          console.log(vm.acceptInvite);

          vm.acceptInvite.accepting = true;
          return api.subscriptions.acceptInvite(idSUI, 'signup', vm.acceptInvite.reg).error(function (res) {
            console.log('invite accept error', idSUI, res);
            return $rootScope.message('Error accepting invitation.', 'warning');
          }).success(function (res) {
            if (res === void 0 || res === null || res === '') {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message('Invalid response.', 'warning');
            } else if (res.code) {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message(res.message, 'warning');
            } else {
              $state.go('app.logout');
           
            }
          })["finally"](function () {
            return vm.acceptInvite.accepting = false;
          });
        }
      };

      //Needs Fixed
      vm.invite = api.subscriptions.getInvite(idSUI).success(function (res) {
        if (res === void 0 || res === null || res === '') {

        }  else {

          if(res.invite)
          vm.item =  {'organization_id':res.invite ? res.invite.idACC : '', 'invitee_user_id': res.invite.json_data.created_by, 'subscription_id':res.invite.id, 'email': res.invite.email, 'phone':res.invite.json_data.phone, 'first':res.invite.json_data.last_name, 'last':res.invite.json_data.last_name,'role_type':res.invite.json_data.role_type, 'baseURL':'http://checklinked.com', 'notifications': 1, 'type': 'invite'};
          vm.invites = res.invite;
          // vm.item.email = res.invite.email;
          // vm.item.first_name = res.invite.json_data.last_name;
          // vm.item.last_name = res.invite.json_data.last_name;
          // vm.item.phone = res.invite.json_data.phone;
          // vm.item.role_type = res.invite.json_data.role_type;
        }
      });
    }

    function viewToggle(open, close) {
      vm.view[open] = !vm.view[open];
      vm.view[close] = false;
    };

    function resetToggle() {
      vm.view = {
        legacy: false,
        create: false
      }
    };

    function  acceptInviteCreateAccount(item){

      return api.create.register(item).success(function(res) {
        if (res.type == 'error') {
          $scope.error_message =  ' <b>(' +item.email +  ')</b>' + " " + res.message;
        }	
        else if(res.type=='success'){
          $scope.showAlert(true);

        }else{
          return $rootScope.message(res.message, 'warning');
        }
        
      })

    };

    function closeDialog() {
      $mdDialog.hide();
      $state.go('app.login');


    }

      $scope.showAlert = function(ev) {
        $mdDialog.show(
          $mdDialog.alert()
            .parent(angular.element(document.querySelector('#popupContainer')))
            .clickOutsideToClose(false)
            .title('Success Message')
            .textContent('Your new account has been created successfuly please login')
            .ariaLabel('Email Verification')
            .ok('Prceed')
            .targetEvent(ev)
           
        );
      };
      


  }
})();
