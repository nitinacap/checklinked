(function ()
{
    'use strict';

    angular
        .module('app.create', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.create', {
            url      : '/create',
            views    : {
                'main@'                       : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.create': {
                    templateUrl: 'app/main/create/create.html',
                    controller : 'CreateController as vm'
                }
            },
            bodyClass: 'create'
        })
        
        
        // Translation
        $translatePartialLoaderProvider.addPart('app/main/create');
    }

})();