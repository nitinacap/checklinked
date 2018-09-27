(function () {
  'use strict';

  angular
    .module('app.queue', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.queue', {
      url: '/queue',
      views: {
        'content@app': {
          templateUrl: 'app/main/queue/queue.html',
          controller: 'QueueController as vm'
        }
      },
      bodyClass: 'forms'
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/queue');

    // Navigation
    msNavigationServiceProvider.saveItem('checklists.queue', {
      title: 'Assign Checklists',
      icon: 'icon-clipboard-arrow-left',
      state: 'app.queue',
      weight: 4
    });

  }

})();
