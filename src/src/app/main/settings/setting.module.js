(function () {
    'use strict';
  
    angular
      .module('app.setting', [])
      .config(config);
  
    /** @ngInject */
    function config($stateProvider, msApiProvider, msNavigationServiceProvider, $translatePartialLoaderProvider) {
  
      // State
      $stateProvider.state('app.setting', {
       // url: '/folders',
        url: '/settings',
        views: {
          'content@app': {
            templateUrl: 'app/main/setting/setting.html',
            controller: 'settingController as vm'
          }
        }
      });
  
      // Translation
      $translatePartialLoaderProvider.addPart('app/main/setting');
  
      // Navigation
  
      // msNavigationServiceProvider.saveItem('checklists.folders', {
      //   title: 'Process',
      //   icon: 'check-square',
      //   state: 'app.folders',
      //   weight: 1
      // });
  
    }
  
  })();
  