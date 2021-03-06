(function () {
  'use strict';

  angular
    .module('app.templates', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.templates', {
      parent: 'app.folders',
      url: 'templates',
      views: {
        'content@app': {
          templateUrl: 'app/main/templates/templates.html',
          controller: 'TemplatesController as vm'
        }
      },
      bodyClass: 'forms'
    });


    // Translate
    $translatePartialLoaderProvider.addPart('app/main/templates');

    // Navigation
    // msNavigationServiceProvider.saveItem('checklists.templates', {
    //   title: 'Templates',
    //   icon: 'users',
    //   state: 'app.templates',
    //   weight: 3
    // });


  }

})();
