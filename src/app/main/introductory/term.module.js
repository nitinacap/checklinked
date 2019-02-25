(function () {
    'use strict';

    angular
        .module('app.term', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, $urlRouterProvider) {
        // State
        $stateProvider
            .state('app.term', {
                url: '',
                views: {
                    'main@': {
                        templateUrl: 'app/core/layouts/content-only.html',
                        controller: 'MainController as vm'
                    },
                    'content@app.term': {
                        templateUrl: 'app/main/introductory/privacy.html'
                    }
                }

            })
            .state('app.term.term', {
                parent: 'app.term',
                url: '/term-and-condition',
                views: {
                    'content@app.term': {
                        templateUrl: 'app/main/introductory/term.html'
                    }
                }
            })
            .state('app.term.privacy', {
                parent: 'app.term',
                url: '/privacy-and-policy',
                views: {
                    'content@app.term': {
                        templateUrl: 'app/main/introductory/privacy.html'
                    }
                }
            });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/introductory');
    }

})();