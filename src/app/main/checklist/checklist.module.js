(function () {
  'use strict';

  angular
    .module('app.checklist',
      ['NgModel',
        'as.sortable',
        'textAngular',
      ])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider
    .state('app.checklist', {
      url: '/checklist',
      views: {
        'content@app': {
          templateUrl: 'app/main/checklist/checklist.html',
          controller: 'checklistController as vm'
        }
      }
    })
      .state('app.checklist.group', {
        url: '/:id',
        views: {
          'content@app': {
            templateUrl: 'app/main/checklist/checklist.html',
            controller: 'checklistController as vm'
          }
        }
      })
      .state('app.checklist.detail', {
        url: '/detail/:id',
        views: {
          'content@app': {
            templateUrl: 'app/main/checklist/views/detail/checklist.html',
            controller: 'checklistController as vm'
          }
        }
      })
      .state('app.checklist.conflicts', {
        url: "/conflicts/:id",
        views: {
          'content@app': {
            templateUrl: 'app/main/checklist/views/detail/checklist.html',
            controller: 'checklistController as vm'
          }
        },
        params: {
          checklist: null,
          id: null,
          sections: null,
          headings: null,
          items: null
        }
      })
      .state('app.checklist.notifications', {
        url: '/notifications/:idCHK',
        views: {
          'content@app': {
            templateUrl: 'app/main/checklist/views/detail/checklist.html',
            controller: 'checklistController as vm'
          }
        },
        params: {
          checklist: null,
          id: null,
          idCHK: null,
          sections: null,
          headings: null,
          items: null,
          name: null,
          type: null
        }
      });


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/checklist');

    // Navigation
    msNavigationServiceProvider.saveItem('checklists', {
      group: true,
      weight: 1
    });

    msNavigationServiceProvider.saveItem('checklists.checklist', {
      title: 'Process',
      icon: 'check-square',
      state: 'app.folders'
    });


  }

})();
