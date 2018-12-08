(function ()
{
    'use strict';

    angular
        .module('app.account', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider)
    {
        // State
        $stateProvider.state('app.account', {
            url      : '/account',
             views  : {
                   'content@app': {
                    templateUrl: 'app/main/account/account.html',
                    controller : 'AccountController as vm'
                }
            }
        })
        .state('app.account.confirm', {
            url      : '/create/confirm/:key',
            views    : {
                'main@': {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.account.confirm': {
                    templateUrl: 'app/main/account/confirm.html',
                    controller : 'AccountController as vm'
                }
            },
            bodyClass: 'account'
        })
        .state('app.account.invite', {
            url      : '/invite/accept/:idSUI',
            views    : {
                'main@': {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller : 'MainController as vm'
                },
                'content@app.account.invite': {
                    templateUrl: 'app/main/account/invite.html',
                    controller : 'AccountController as vm'
                }
            },
            bodyClass: 'account'
        });
        // Translation
        $translatePartialLoaderProvider.addPart('app/main/account');
    }

})();