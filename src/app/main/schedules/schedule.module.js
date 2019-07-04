(function () {
  'use strict';

  angular
    .module('app.schedule', [
      "ui.calendar",
      'gantt', 
      'gantt.tooltips',
      'gantt.table',
      'gantt.tree'
      ])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider
      .state('app.schedule', {
        url: '/schedule',
        views: {
          'content@app': {
            templateUrl: 'app/main/schedules/schedule.html',
            controller: 'scheduleController as vm'
          }
        },
        bodyClass: 'forms'
      })


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/schedules');

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
