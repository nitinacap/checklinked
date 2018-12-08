(function () {
  'use strict';

  angular
    .module('app.user', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider,$translatePartialLoaderProvider) {

    // State
    $stateProvider.state('app.user', {
      url: '/user',
      views: {
        'content@app': {
          templateUrl: 'app/main/user/partials/stats.html',
          controller: 'UserController as vm'
        }
      },
      bodyClass: 'forms'
    })
      .state('app.user.info', {
        url: '/info',
        views: {
          'content@app': {
            templateUrl: 'app/main/user/partials/info.html',
            controller: 'UserController as vm'
          }
        }
      })
      .state('app.user.stats', {
        url: '/stats',
        views: {
          'content@app': {
            templateUrl: 'app/main/user/partials/stats.html',
            controller: 'UserController as vm'
          }
        }
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
