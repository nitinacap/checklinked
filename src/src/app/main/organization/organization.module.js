(function () {
  'use strict';

  angular
    .module('app.organization', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider
    .state('app.organization', {
      url: '/organization/:type',
      views: {
        'content@app': {
          templateUrl: 'app/main/organization/organization.html',
          controller: 'OrganizationController as vm'
        }
      },
      bodyClass: 'forms'
    })


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/organization');

    // Navigation
    /*
    msNavigationServiceProvider.saveItem('account.organization', {
      title: 'Organization Profile',
      icon: 'icon-store',
      state: 'app.organization',
      weight: 2
    });
    */

  }

})();
