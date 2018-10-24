(function () {
  'use strict';

  angular
    .module('app.subscriptions')
    .controller('subscriptionsController', subscriptionsController);

  /** @ngInject */
  function subscriptionsController($rootScope, $http, $scope, api, $mdSidenav, $mdDialog, $document, $stateParams, $timeout) {
    var vm = this;

    vm.toggleSidenav = toggleSidenav;
    vm.members = [];
    vm.closeDialog = closeDialog;

    vm.dtOptions = {
      dom: '<"top"f>rt<"bottom"<"left"<"length"l>><"right"<"info"i><"pagination"p>>>',
      info: false,
      pagingType: 'simple',
      autoWidth: false,
      responsive: true
    };

    var idSUI;
    vm.loading = false;
    vm.inviting = false;
    vm.makingSubActive = false;
    vm.withdrawing = [];
    vm.invite = null;
    vm.inviteEmailsUrl = 'partials/account/subscription-inviteForm.html';
    vm.offers = [];
    vm.grabClientToken = null;
    vm.newSubscription = false;
    vm.openSubscriptionDialog = openSubscriptionDialog;

    vm.selectSubscription = selectSubscription;
    vm.clearSelectSubscription = clearSelectSubscription;
    vm.clearcheck =clearcheck


  
    //Toggle Left Side Nav
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }
   
    function closeDialog() {
      $mdDialog.hide();
    }


    function selectSubscription(ev) {
      console.log('subscriptions', $rootScope.subscriptions);
      vm.newSubscription = true;
      $rootScope.subscriptions.selected = null;
      $rootScope.subscriptions.agreeToTerms = false;
      $rootScope.subscriptions.success = false;
      $rootScope.currentPaymentMethod = null;
      console.log('vm.newSubscription', vm.newSubscription);
    }

    function clearSelectSubscription(ev) {
      console.log('subscriptions', $rootScope.subscriptions);
      $rootScope.subscriptions.selected = null;

      console.log('vm.newSubscription', vm.newSubscription);
    }

    function clearcheck(ev) {
      console.log('subscriptions', $rootScope.subscriptions);
      $rootScope.subscriptions.selected = null;

      console.log('vm.newSubscription', vm.newSubscription);
    }



    function openSubscriptionDialog(ev, role) {
      
      vm.role = angular.copy(role);
      
            $mdDialog.show({
              scope: $scope,
              preserveScope: true,
              templateUrl: 'app/main/subscriptions/dialogs/subscriptions-dialog.html',
              parent: angular.element($document.find('#subscriptions')),
              targetEvent: ev,
              clickOutsideToClose: true
            });
          }

    api.subscriptions.getCurrentOffers().success(function (res) {
      var ref;
      if ((ref = res.plans) != null ? ref.length : void 0) {
        return vm.offers = vm.offers.concat(res.plans);
      }
    })["finally"](function () {
      return vm.loading = false;
    });

    function makeSubscriptionActive() {
      vm.makingSubActive = true;
      return api.subscriptions.makeSubscriptionActive($rootScope.subscriptions.selected.id).error(function (res) {
        return $rootScope.message('Error inviting.', 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message('Invalid response.', 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          $rootScope.user = res.user;
          return $rootScope.subscriptions.selected.users = res.contacts;
        }
      })["finally"](function () {
        return vm.makingSubActive = false;
      });
    };

    idSUI = $stateParams.idSUI;
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
          vm.acceptInvite.accepting = true;
          api.subscriptions.acceptInvite(idSUI, 'login', vm.acceptInvite.signin).error(function (res) {
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
          return LoginService.doAuth({
            m: 't',
            t: token
          });
        }
      };
      return vm.invite = api.subscriptions.getInvite(idSUI).success(function (res) {
        if (res === void 0 || res === null || res === '') {

        } else if (res.code) {

        } else {
          vm.invite = res.invite;
          vm.acceptInvite.signin.username = res.invite.email;
          return vm.acceptInvite.reg.contact.email = res.invite.email;
        }
      });
    }
debugger;

    if (((vm.ref = $rootScope.user) != null ? vm.ref.authenticated : void 0) && $rootScope.user.btClientID !== void 0 && $rootScope.user.btClientID !== null && $rootScope.user.btClientID !== '') {
      vm.grabClientToken = $http.get(BASEURL + "braintree_clientID-get.php?cID=" + $rootScope.user.btClientID);
    } else {
      vm.grabClientToken = $http.get(BASEURL + "braintree_clientID-get.php");
    }
    vm.grabClientToken.success(function (res) {

      vm.clientToken = res;
      if (vm.clientToken !== void 0 && vm.clientToken !== null && vm.clientToken !== '') {
        $timeout(function () {
          braintree.setup(vm.clientToken, "dropin", {
            onPaymentMethodReceived: function (res) {
              $rootScope.currentPaymentMethod = res;
              console.log('payment method updated', $rootScope.currentPaymentMethod);
              $rootScope.$apply();
              $rootScope.$broadcast('event:paymentMethodReceived');
            },
            onError: function (type, message) {
              $rootScope.message("Error (" + type + "): " + message, 'warning');
            },
            container: "payment-form"
          });
        });
      }
    });

    console.log('$rootScope.subscriptions', $rootScope.subscriptions);
    console.log('vm.newSubscription', vm.newSubscription);


  }

})();
