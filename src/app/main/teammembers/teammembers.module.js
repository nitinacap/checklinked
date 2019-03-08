(function () {
  'use strict';

  angular
    .module('app.teammembers', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.teammembers', {
      url: '/accounts/:?payment_method_nonce',
      views: {
        'content@app': {
          templateUrl: 'app/main/teammembers/teammembers.html',
          controller: 'TeamMembersController as vm'
        }
      },
      bodyClass: 'forms'
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/teammembers');

    // Navigation
    /*
    msNavigationServiceProvider.saveItem('account.teammembers', {
      title: 'Team Members',
      icon: 'icon-account-multiple',
      state: 'app.teammembers',
      weight: 3
    });
    */

  }

})();
