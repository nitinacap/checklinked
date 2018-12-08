(function ()
{
    'use strict';

    angular
        .module('app.account')
        .controller('AccountController', AccountController);

    /** @ngInject */
  function AccountController($rootScope, $mdDialog, $document, $stateParams, $http, $scope, api, $mdSidenav) {
    	
	var vm = this;
	
	console.log('$stateParams.key', $stateParams.key);
	console.log('$stateParams', $stateParams);
	
	/* confirmAccount START */
	
	
	if ($stateParams.key !== void 0 && $stateParams.key !== null && $stateParams.key  !== '') {
		
	if ($stateParams.key === '') {
      vm.sending = false;
      vm.confirmed = false;
      return vm.message = 'No confirmation key provided.  Please use the full confirmation link in your confirmation email.';
    } else {
      vm.message = 'Accounting...';
      vm.sending = true;
      
      return api.confirm.validate($stateParams.key).error(function(res) {
      $rootScope.message('Unknown error conforming New User Account.', 'warning');
        }).success(function(res) {
        	console.log('res', res);
          if (res.type==='success') {
            $rootScope.message(res.message, 'success');
            return vm.message = res.message;
          } else {
        $rootScope.message(res.message, 'warning');
        return vm.message = res.message;
        
        console.log('res.message', res.message);
				
				
          }
        })["finally"](function() {
           return vm.sending = false;
        });
    }
    
    }
    /* confirmAccount END */
   
   
   
   /* invites	Account START */
  if ($stateParams.idSUI !== void 0 && $stateParams.idSUI !== null && $stateParams.idSUI  !== '') {
  	
 	var idSUI;
    vm.loading = false;
    vm.inviting = false;
    vm.makingSubActive = false;
    vm.withdrawing = [];
    vm.invite = null;
    vm.offers = [];
    
    vm.makeSubscriptionActive = makeSubscriptionActive;
    
    api.subscriptions.getCurrentOffers().success(function(res) {
      var ref;
      if ((ref = res.plans) != null ? ref.length : void 0) {
        return vm.offers = vm.offers.concat(res.plans);
      }
    })["finally"](function() {
      return vm.loading = false;
    });
    
    function makeSubscriptionActive() {
      vm.makingSubActive = true;
      return api.subscriptions.makeSubscriptionActive($rootScope.subscriptions.selected.id).error(function(res) {
        return $rootScope.message('Error inviting.', 'warning');
      }).success(function(res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message('Invalid response.', 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          $rootScope.user = res.user;
          return $rootScope.subscriptions.selected.users = res.contacts;
        }
      })["finally"](function() {
        return vm.makingSubActive = false;
      });
    };
    
    idSUI = $stateParams.idSUI;
    
    if (idSUI !== void 0 && idSUI !== null && idSUI !== '') {
    	console.log('checking idSUI');
    	
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
        login: function() {
          vm.acceptInvite.accepting = true;
          return api.subscriptions.acceptInvite(idSUI, 'login', vm.acceptInvite.signin).error(function(res) {
            console.log('invite accept error', idSUI, res);
            $rootScope.message('Error accepting invitation.', 'warning');
          }).success(function(res) {
            if (res === void 0 || res === null || res === '') {
              console.log('invite accept error', idSUI, res);
            $rootScope.message('Invalid response.', 'warning');
            } else if (res.code) {
              console.log('invite accept error', idSUI, res);
            $rootScope.message(res.message, 'warning');
            } else {
              return vm.acceptInvite.succeeded(res.user.token);
            }
          })["finally"](function() {
            vm.acceptInvite.accepting = false;
          });
        },
        signup: function() {
          vm.acceptInvite.accepting = true;
          return api.subscriptions.acceptInvite(idSUI, 'signup', vm.acceptInvite.reg).error(function(res) {
            console.log('invite accept error', idSUI, res);
            return $rootScope.message('Error accepting invitation.', 'warning');
          }).success(function(res) {
            if (res === void 0 || res === null || res === '') {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message('Invalid response.', 'warning');
            } else if (res.code) {
              console.log('invite accept error', idSUI, res);
              return $rootScope.message(res.message, 'warning');
            } else {
              return vm.acceptInvite.succeeded(res.user.token);
            }
          })["finally"](function() {
            return vm.acceptInvite.accepting = false;
          });
        },
        succeeded: function(token) {
          return api.login.doAuth({
            m: 't',
            t: token
          });
        }
      };
      
      vm.invite = api.subscriptions.getInvite(idSUI).success(function(res) {
        if (res === void 0 || res === null || res === '') {
		console.log('res void');
        } else if (res.code) {
		console.log('res.code', res.code);
        } else {
        	console.log('res', res);
          vm.invite = res.invite;
          vm.acceptInvite.signin.username = res.invite.email;
          vm.acceptInvite.reg.contact.email = res.invite.email;
        }
      });
      
     
    }   
     console.log('vm.invite', vm.invite);
    }
	/* inviteAccount END */

    }
})();