(function () {
  'use strict';

  angular
    .module('app.mail',
      [
        'nl2br-filter'
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
          },
          Outbox: function (msApi) {
            return msApi.resolve('mail.outbox@get');
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

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/mail');

    // Api
    msApiProvider.register('mail.folders', ['app/data/mail/folders.json']);
    msApiProvider.register('mail.labels', ['app/data/mail/labels.json']);
    msApiProvider.register('mail.outbox', ['app/data/mail/outbox.json']);

    // Navigation
    msNavigationServiceProvider.saveItem('conversations', {
      title: 'Messaging',
      group: true,
      weight: 2
    });

    // Navigation
    msNavigationServiceProvider.saveItem('conversations.mail', {
      title: 'Notifications',
      icon: 'icon-email',
      state: 'app.mail.threads',
      badge      : {
        color  : '#09d261'
      },
      stateParams: {
        filter: '1'
      },
      weight: 1
    });
  }
})();
