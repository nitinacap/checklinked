(function ()
{
    'use strict';

    angular
        .module('app.create')
        .controller('CreateController', CreateController);

    /** @ngInject */
    function CreateController($rootScope, $location, $http, $state, api, $scope)
    {
		var vm = this;
 // Methods
		vm.sendInfo = sendInfo;
    
		vm.create = {
		  sending: false,
		  success: false
		};
    	
	    vm.create.reg = {
	      email: '',
	      phone: '',
	      notifications: 1,
				baseURL: 'http://localhost:3000',
	      password: '',
	      password2: '',
	      name: {
	        first: '',
	        middle: '',
	        last: ''
	      }
	    };
			$scope.message = '{"validation_error":{"email":["The email has already been taken."]},"error":1}';
			

	    function sendInfo() {
	      vm.create.sending = true;
	      return api.create.register(vm.create.reg).success(function(res) {
	        if (res) {
						if (res.success) {
							vm.create.sending = false;
							vm.create = { success: true };

						}
						if (res.validation_error.email != undefined) {
							$scope.error_message = "This email is alredy register try another";
						}
				
			
				}
			
					
	      })["finally"](function() {
	        return vm.create.sending = false;
	      });
	    };
    

    }
})();