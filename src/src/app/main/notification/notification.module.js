(function () {
  'use strict';

  angular
    .module('app.notification', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider
    .state('app.notification', {
      url: '/notification',
      views: {
        'content@app': {
          templateUrl: 'app/main/notification/notification.html',
          controller: 'NotificationController as vm'
        }
      },
      bodyClass: 'forms'
    })


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/notification');

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
