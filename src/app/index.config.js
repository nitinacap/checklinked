(function ()
{
    'use strict';

    angular
	.module('checklinked')
	.config(config, ['provide', 'httpProvider']);

    /** @ngInject */
	function config($httpProvider)
	{

	/*	$provide.factory('httpRequestInterceptor', function ($q, $rootScope) {
			return {
				request: function (config) {
					if ($rootScope.userAuthenticated()) {
						config.headers['X-AntiCSRF-Token'] = $rootScope.user.token;
					}
					return config;
				}
			};
		});
		*/

		$httpProvider.defaults.withCredentials = true;
		$httpProvider.defaults.useXDomain = true;
		$httpProvider.defaults.headers.common = {
		Accept: "application/json, text/plain, */*"
		};
		$httpProvider.defaults.headers.post = {
			"Content-Type": "application/x-www-form-urlencoded"
		};
		//$httpProvider.interceptors.push('httpRequestInterceptor');
	}

})();
