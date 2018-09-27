(function () {
  'use strict';

  angular
    .module('app.contacts', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider) {

    $stateProvider.state('app.contacts', {
      url: '/contacts',
      views: {
        'content@app': {
          templateUrl: 'app/main/contacts/contacts.html',
          controller: 'ContactsController as vm'
        }
      }
    }).state('app.contacts.accept', {
      url: '/contacts/:passID',
      views: {
        'content@app': {
          templateUrl: 'app/main/contacts/contacts.html',
          controller: 'ContactsController as vm'
        }
      }
    });



    // Translation
    $translatePartialLoaderProvider.addPart('app/main/contacts');


    // Navigation
    /*
    msNavigationServiceProvider.saveItem('contacts', {
      title: 'Contacts',
      group: true,
      weight: 4
    });

    msNavigationServiceProvider.saveItem('contacts.contacts', {
      title: 'Contacts',
      icon: 'icon-account-box',
      state: 'app.contacts',
      weight: 1
    });
    */

  }

})();
