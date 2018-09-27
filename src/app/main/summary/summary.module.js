(function () {
  'use strict';

  angular
    .module('app.summary', ['datatables'])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.summary', {
      url: '/summary',
      views: {
        'content@app': {
          templateUrl: 'app/main/summary/summary.html',
          controller: 'summaryController as vm'
        }
      },
      bodyClass: 'forms'
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/summary');


    // Navigation
    msNavigationServiceProvider.saveItem('reports', {
      title: 'Reports',
      group: true,
      weight: 3
    });

    // Navigation
    msNavigationServiceProvider.saveItem('reports.summary', {
      title: 'Reports',
      icon: 'icon-credit-card',
      state: 'app.summary',
      weight: 1
    });

  }

})();
