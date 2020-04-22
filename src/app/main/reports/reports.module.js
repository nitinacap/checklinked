(function () {
  'use strict';

  angular
    .module('app.reports', ['angularjs-dropdown-multiselect'])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider
    .state('app.reports', {
      url: '/reports',
      views: {
        'content@app': {
          templateUrl: 'app/main/reports/reports.html',
          controller: 'ReportController as vm'
        }
      },
      bodyClass: 'forms'
    })


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/reports');

    // Navigation
    /*
    msNavigationServiceProvider.saveItem('account.organization', {
      title: 'Organization Profile',
      icon: 'icon-store',
      state: 'app.organization',
      weight: 2
    });
    */

  }

})();
