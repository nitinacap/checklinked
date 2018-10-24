(function () {
    'use strict';

    angular
        .module('app.term', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {
        // State
        $stateProvider.state('app.term', {
            url: '/term',
            views: {
                'main@': {
                    templateUrl: 'app/core/layouts/content-only.html',
                    controller: 'MainController as vm'
                },
                'content@app.term': {
                    templateUrl: 'app/main/term/term.html',
                    controller: 'TermController as vm'
                }
            },
            bodyClass: 'term'
        });

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/term');
    }

})();