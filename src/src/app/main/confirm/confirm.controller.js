(function ()
{
    'use strict';

    angular
        .module('app.confirm')
        .controller('ConfirmController', ConfirmController);

    /** @ngInject */
    function ConfirmController($rootScope, $scope, $http, $state, api, $location, $stateParams) {

	var vm = this;

	console.log('params', $stateParams);
    if ($stateParams.id === '') {
      vm.sending = false;
      vm.confirmed = false;
      $rootScope.message("No confirmation key provided.  Please use the full confirmation link in your confirmation email", 'warning');
      return vm.message = 'No confirmation key provided.  Please use the full confirmation link in your confirmation email.';
    } else {
      vm.message = 'Confirming...';
      vm.sending = true;

      return api.confirm.validate($stateParams.id).error(function(res) {
      $rootScope.message('Unknown error conforming New User Account.', 'warning');
        }).success(function(res) {
        	console.log('res', res);
          if (res.code) {

            if(res.code === 0 || res.code == 0)
            {
              $rootScope.message(res.message, 'success');
              return vm.message = res.message;
            } else {
              $rootScope.message("Error creating New User Account: " + res.message, 'warning');
              return vm.message = res.message;
            }

          } else {

        vm.message = res.message;

          }
        })["finally"](function() {
           return vm.sending = false;
        });



    }

    }
})();
