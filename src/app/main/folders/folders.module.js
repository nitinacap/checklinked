(function () {
  'use strict';

  angular
    .module('app.folders', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.folders', {
     // url: '/folders',
      url: '/projects',
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

    // msNavigationServiceProvider.saveItem('checklists.folders', {
    //   title: 'Process',
    //   icon: 'check-square',
    //   state: 'app.folders',
    //   weight: 1
    // });

  }

})();
