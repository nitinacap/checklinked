(function () {
  'use strict';

  angular
    .module('app.groups', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {

    // STATE
    $stateProvider.state('app.groups', {
      url: 'workflows',
      "parent": 'app.folders',
      views: {
        'content@app': {
          templateUrl: 'app/main/groups/groups.html',
          controller: 'GroupsController as vm'
        }
      }
    })
      .state('app.groups.detail', {
        url: '/:id',
        views: {
          'content@app': {
            templateUrl: 'app/main/groups/groups.html',
            controller: 'GroupsController as vm'
          }
        }
      });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/groups');

  }

})();
