(function () {
  'use strict';

  angular
    .module('app.contacts', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider) {

    $stateProvider.state('app.contacts', {
      url: '/contacts/:type',
      views: {
        'content@app': {
          templateUrl: 'app/main/contacts/contacts.html',
          controller: 'ContactsController as vm'
        }
      }
    })


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/contacts');


  }

})();
