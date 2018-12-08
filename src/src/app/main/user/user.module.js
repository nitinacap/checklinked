(function () {
  'use strict';

  angular
    .module('app.user', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider,$translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.user', {
      url: '/user/:type',
      views: {
        'content@app': {
          templateUrl: 'app/main/user/user.html',
          controller: 'UserController as vm'
        }
      },
      bodyClass: 'forms'
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/user');

    // Navigation
    /*
    msNavigationServiceProvider.saveItem('account', {
      title: 'Account Settings',
      group: true,
      weight: 2
    });


    msNavigationServiceProvider.saveItem('account.user', {
      title: 'User Profile',
      icon: 'icon-account',
      state: 'app.user',
      weight: 1
    });
    */

  }

})();
