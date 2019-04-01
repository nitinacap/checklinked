(function () {
  'use strict';

  angular
    .module('app.alerts', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.alerts', {
      url: '/alerts',
      views: {
        'content@app': {
          templateUrl: 'app/main/alerts/alerts.html',
          controller: 'alertsController as vm'
        }
      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/alerts');


  }

})();
