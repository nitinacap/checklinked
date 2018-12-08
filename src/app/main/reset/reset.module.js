(function ()
{
    'use strict';

    angular
        .module('app.reset', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.reset', {
            url: '/reset/:token',
            views    : {
                'main@'                       : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.reset': {
                    templateUrl: 'app/main/reset/reset.html',
                    controller: 'ResetController as vm'
                }
            },
            bodyClass: 'reset'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/reset');
    }

})();