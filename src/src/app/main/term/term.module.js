(function () {
    'use strict';

    angular
        .module('app.term', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {
        // State
        $stateProvider
            .state('app.term', {
                url: '/term',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-only.html',
                        controller: 'MainController as vm'
                    }
                },
                bodyClass: 'term'
            })
            .state('app.term', {
                url: '/term',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-only.html'
                        //controller: 'MainController as vm'
                    }
                }

            })

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/term');
    }

})();