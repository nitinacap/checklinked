(function () {
  'use strict';

  angular
    .module('app.dashboard', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.dashboard', {
      url: '/dashboard',
      views: {
        'content@app': {
          templateUrl: 'app/main/dashboard/dashboard.html',
          controller: 'DashboardController as vm'
        }
      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/dashboard');

    // Navagation
    msNavigationServiceProvider.saveItem('reports.dashboard', {
      title: 'Dashboard',
      icon: 'icon-poll-box',
      state: 'app.dashboard',
      weight: 2
    });

  }

})();
