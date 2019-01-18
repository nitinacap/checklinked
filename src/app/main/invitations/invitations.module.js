(function () {
  'use strict';

  angular
    .module('app.invitations', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msApiProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.invitations', {
      url: '/action',
      views: {
        'content@app': {
          templateUrl: 'app/main/invitations/invitations.html',
          controller: 'InvitationsController as vm'
        }
      },
      bodyClass: 'forms'
    })
      .state('app.invitations.accept', {
        url: '/invitations/:passID',
        views: {
          'content@app': {
            templateUrl: 'app/main/invitations/invitations.html',
            controller: 'InvitationsController as vm'
          }
        },
        bodyClass: 'forms'
      });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/invitations');

    // Navigation
    // msNavigationServiceProvider.saveItem('checklists.invitations', {
    //   title: 'Invitations',
    //   //icon: 'icon-google-circles-invite',
    //   icon: 'codiepie',
    //   state: 'app.invitations',
    //   badge: {
    //     color: '#F44336'
    //   },
    //   weight: 4
    // });

  }

})();
