(function () {
  'use strict';

  angular
    .module('app.subscriptions', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.subscriptions', {
      url: '/subscriptions',
      views: {
        'content@app': {
          templateUrl: 'app/main/subscriptions/subscriptions.html',
          controller: 'subscriptionsController as vm'
        }
      },
      bodyClass: 'forms'
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/subscriptions');

    // Navigation
    /*
    msNavigationServiceProvider.saveItem('account.subscriptions', {
      title: 'Subscriptions',
      icon: 'icon-credit-card',
      state: 'app.subscriptions',
      weight: 4
    });
    */

  }

})();
