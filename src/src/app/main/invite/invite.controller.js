(function () {
  'use strict';

  angular
    .module('app.invite')
    .controller('InviteController', InviteController);

  /** @ngInject */
  function InviteController($rootScope, $scope, $http, $state, api, $location, $stateParams) {

    var vm = this;
    var idSUI;

    vm.loading = false;
    vm.inviting = false;
    vm.makingSubActive = false;
    vm.withdrawing = [];
    vm.invite = null;
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
            phone: '',
            email: ''
          },
          password: '',
          password2: ''
        },
        login: function () {
          console.log('idSUI', idSUI);

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
          console.log('vm.acceptInvite.reg', vm.acceptInvite.reg);
          console.log('idSUI', idSUI);

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
              return vm.acceptInvite.succeeded(res.user.token);
            }
          })["finally"](function () {
            return vm.acceptInvite.accepting = false;
          });
        },
        succeeded: function (token) {
          console.log('token', token);
          return api.login.doAuth({
            m: 't',
            t: token
          });
        }
      };

      //Needs Fixed
      vm.invite = api.subscriptions.getInvite(idSUI).success(function (res) {
        if (res === void 0 || res === null || res === '') {

        } else if (res.code) {

        } else {
          vm.invite = res.invite;
          vm.acceptInvite.signin.username = res.invite.email;
          return vm.acceptInvite.reg.contact.email = res.invite.email;
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


  }
})();
