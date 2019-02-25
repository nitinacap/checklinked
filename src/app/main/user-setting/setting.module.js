(function () {
  'use strict';

  angular
    .module('app.usersetting', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider
    .state('app.usersetting', {
      url: '/settings',
      views: {
        'content@app': {
          templateUrl: 'app/main/user-setting/setting.html',
          controller: 'UserSettingController as vm'
        }
      },
      bodyClass: 'forms'
    })


    // Translation
    $translatePartialLoaderProvider.addPart('app/main/user-setting');

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
