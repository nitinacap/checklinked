(function () {
  'use strict';

  angular
    .module('app.alerts', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.alerts', {
      url: '/alerts',
      views: {
        'content@app': {
          templateUrl: 'app/main/folders/folders.html',
          controller: 'alertsController as vm'
        }
      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/alerts');


  }

})();
