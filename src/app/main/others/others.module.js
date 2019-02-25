(function () {
  'use strict';

  angular
    .module('app.other', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider) {

    $stateProvider.state('app.other', {
      parent: 'app.folders',
      url: 'others',
      views: {
        'content@app': {
          templateUrl: 'app/main/others/others.html',
          controller: 'OthersController as vm'
        }
      }
    })


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/others');


  }

})();
