(function () {
  'use strict';

  angular
    .module('app.toolbar')
    .controller('ToolbarController', ToolbarController);

  /** @ngInject */
  function ToolbarController($rootScope, $scope, $q, $state, $location, $timeout, $http, $mdSidenav, $translate, $mdToast, msNavigationService, toastr) {
    var vm = this;

    // Data
    $rootScope.global = {
      search: ''
    };


    vm.bodyEl = angular.element('body');
    vm.userStatusOptions = [
      {
        'title': 'Online',
        'icon' : 'icon-checkbox-marked-circle',
        'color': '#4CAF50'
      },
      {
        'title': 'Away',
        'icon' : 'icon-clock',
        'color': '#FFC107'
      },
      {
        'title': 'Do not Disturb',
        'icon' : 'icon-minus-circle',
        'color': '#F44336'
      },
      {
        'title': 'Invisible',
        'icon' : 'icon-checkbox-blank-circle-outline',
        'color': '#BDBDBD'
      },
      {
        'title': 'Offline',
        'icon' : 'icon-checkbox-blank-circle-outline',
        'color': '#616161'
      }
    ];

    // Methods
    vm.toggleSidenav = toggleSidenav;
    vm.toggleHorizontalMobileMenu = toggleHorizontalMobileMenu;
    vm.toggleMsNavigationFolded = toggleMsNavigationFolded;
    vm.setUserStatus = setUserStatus;

    vm.badgeData = $rootScope.inviteCounts;

    //console.log('badge data friendships', vm.badgeData.friendships);

    // Select the first status as a default
    vm.userStatus = vm.userStatusOptions[0];

      $rootScope.username = function(username){
       return  $scope.username = username;
      }
    
     
    function myUsername() {
      setTimeout(function () { 
        $scope.$apply(function () {
        console.log('NAME=');
         $rootScope.username($rootScope.user.name.full)
        });
      }, 2000);
    }

    myUsername();


    $rootScope.$broadcast('greeting', $scope.username);

    /**
     * Toggle sidenav
     *
     * @param sidenavId
     */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }


    /**
     * Toggle horizontal mobile menu
     */
    function toggleHorizontalMobileMenu() {
      vm.bodyEl.toggleClass('ms-navigation-horizontal-mobile-menu-active');
    }

    /**
     * Toggle msNavigation folded
     */
    function toggleMsNavigationFolded() {
      msNavigationService.toggleFolded();
    }


    function setUserStatus(status)
    {
      vm.userStatus = status;
    }

  }

})();
