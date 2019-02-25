(function () {
  'use strict';

  angular
    .module('app.chat', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, $translatePartialLoaderProvider, msNavigationServiceProvider) {

    // State
    $stateProvider.state('app.chat', {
      url: '/chat',
      views: {
        'content@app': {
          templateUrl: 'app/main/chat/chat.html',
          controller: 'ChatController as vm'
        }
      }
    })
    .state('app.chat.message', {
      url: '/message',
      views: {
        'content@app': {
          templateUrl: 'app/main/chat/message.html',
          controller: 'ChatController as vm'
        }
      }
    })
      .state('app.chat.user', {
      url: '/:id',
      views: {
        'content@app': {
          templateUrl: 'app/main/chat/chat.html',
          controller: 'ChatController as vm'
        }
      }
    }).state('app.chat.pass', {
      url: '/chat/:passID',
      views: {
        'content@app': {
          templateUrl: 'app/main/chat/chat.html',
          controller: 'ChatController as vm'
        }
      }
    });

    // Translation
    $translatePartialLoaderProvider.addPart('app/main/chat');

    // Navigation
    // msNavigationServiceProvider.saveItem('conversations.chat', {
    //   title: 'Messages',
    //   icon: 'commenting-o',
    //   state: 'app.chat' ,
    //   weight: 2
    // });

  }

})();
