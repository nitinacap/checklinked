(function () {
  'use strict';

  angular
    .module('app.mail',
      [


      ]
    )
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msApiProvider, msNavigationServiceProvider) {


    // State
    $stateProvider
      .state('app.mail', {
        abstract: true,
        url: '/mail',
        resolve: {
          Folders: function (msApi) {
            return msApi.resolve('mail.folders@get');
          },
          Labels: function (msApi) {
            return msApi.resolve('mail.labels@get');
          }
        }
      })
      .state('app.mail.threads', {
        url: '/{type:(?:label)}/:filter',
        views: {
          'content@app': {
            templateUrl: 'app/main/mail/mail.html',
            controller: 'MailController as vm'
          }
        },
        params: {
          type: {
            value: null,
            squash: true
          }
        },
        bodyClass: 'mail'
      })
      .state('app.mail.threads.thread', {
        url: '/:threadId',
        bodyClass: 'mail'
      });


    // Api
    msApiProvider.register('mail.folders', ['app/data/mail/folders.json']);
    msApiProvider.register('mail.labels', ['app/data/mail/labels.json']);

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/mail');

    // Navigation
    msNavigationServiceProvider.saveItem('conversations', {
      title: 'Messaging',
      group: true,
      weight: 2
    });

    msNavigationServiceProvider.saveItem('conversations.mail', {
      title: 'Mailbox',
      icon: 'icon-email',
      state: 'app.mail.threads',
      stateParams: {
        filter: 'inbox'
      },
      badge: {
        content: 25,
        color: '#F44336'
      },
      weight: 1
    });


  }
})();
