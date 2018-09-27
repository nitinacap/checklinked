(function ()
{
    'use strict';

    angular
        .module('app.confirm', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.confirm', {
            url      : '/confirm/:id',
            views    : {
                'main@'                       : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.confirm': {
                    templateUrl: 'app/main/confirm/confirm.html',
                    controller : 'ConfirmController as vm'
                }
            },
            bodyClass: 'confirm'
        })
        // Translation
        $translatePartialLoaderProvider.addPart('app/main/confirm');
    }

})();
