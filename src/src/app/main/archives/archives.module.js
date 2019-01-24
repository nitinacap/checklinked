(function () {
  'use strict';

  angular
    .module('app.archives', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.archives', {
      url: '/archives',
      views: {
        'content@app': {
          templateUrl: 'app/main/archives/archives.html',
          controller: 'ArchivesController as vm'
        }
      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/archives');

  }

})();
