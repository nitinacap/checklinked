(function ()
{
    'use strict';

    angular
        .module('app.invite', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.invite', {
            url      : '/invite/:id',
            views    : {
                'main@'                       : {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.invite': {
                    templateUrl: 'app/main/invite/invite.html',
                    controller : 'InviteController as vm'
                }
            },
            bodyClass: 'invite'
        })
        // Translation
        $translatePartialLoaderProvider.addPart('app/main/invite');
    }

})();
