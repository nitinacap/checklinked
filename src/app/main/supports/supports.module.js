(function () {
    'use strict';

    angular
        .module('app.supports', [])
        .config(config);

    /** @ngInject */
    function config($stateProvider, $translatePartialLoaderProvider) {
        // State
        $stateProvider
            .state('app.supports', {
                url: '/supports',
                views: {
                    'main@': {
                        templateUrl: 'app/main/supports/supports.html',
                        controller: 'MainController as vm'
                    }
                }
            });
       

        // Translation
        $translatePartialLoaderProvider.addPart('app/main/supports');
    }

})();