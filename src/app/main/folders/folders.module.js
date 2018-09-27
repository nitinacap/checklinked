(function () {
  'use strict';

  angular
    .module('app.folders', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.folders', {
      url: '/folders',
      views: {
        'content@app': {
          templateUrl: 'app/main/folders/folders.html',
          controller: 'FoldersController as vm'
        }
      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/folders');

    // Navigation
    msNavigationServiceProvider.saveItem('checklists.folders', {
      title: 'My Projects',
      icon: 'icon-folder-multiple',
      state: 'app.folders',
      weight: 2
    });

  }

})();
