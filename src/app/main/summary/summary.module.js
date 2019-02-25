(function () {
  'use strict';

  angular
    .module('app.summary', ['datatables'])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.summary', {
      url: '/issue',
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
      //title: 'Issues',
      group: true,
      weight: 3
    });

    // Navigation
    msNavigationServiceProvider.saveItem('reports.summary', {
      title: 'Analyze',
      icon: 'fa fa-bar-chart',
      state: 'app.summary',
      weight: 3
    });

  }

})();
