(function () {
  'use strict';

  angular
    .module('app.toolbar')
    .controller('ToolbarController', ToolbarController);

  /** @ngInject */
  function ToolbarController($rootScope, $scope, $q, $cookies, $location, $timeout, $http, $mdSidenav, $translate, $mdToast, msNavigationService, toastr) {
    var vm = this;
    vm.currentSettingMenu = currentSettingMenu;
    // Data
    $rootScope.global = {
      search: ''
    };
    vm.IsHidden = true;
    vm.ShowHideToggle = ShowHideToggle;
    function ShowHideToggle() {
      vm.IsHidden = vm.IsHidden ? false : true;

    }
    vm.bodyEl = angular.element('body');
    vm.userStatusOptions = [
      {
        'title': 'Online',
        'icon': 'icon-checkbox-marked-circle',
        'color': '#4CAF50'
      },
      {
        'title': 'Away',
        'icon': 'icon-clock',
        'color': '#FFC107'
      },
      {
        'title': 'Do not Disturb',
        'icon': 'icon-minus-circle',
        'color': '#F44336'
      },
      {
        'title': 'Invisible',
        'icon': 'icon-checkbox-blank-circle-outline',
        'color': '#BDBDBD'
      },
      {
        'title': 'Offline',
        'icon': 'icon-checkbox-blank-circle-outline',
        'color': '#616161'
      }
    ];
    function currentSettingMenu(id){
    return  $rootScope.curreManuItem = id;
    }

    // Methods
    vm.toggleSidenav = toggleSidenav;
    vm.toggleHorizontalMobileMenu = toggleHorizontalMobileMenu;
    vm.toggleMsNavigationFolded = toggleMsNavigationFolded;
    vm.setUserStatus = setUserStatus;

    vm.badgeData = $rootScope.inviteCounts;

    //console.log('badge data friendships', vm.badgeData.friendships);

    // Select the first status as a default
    vm.userStatus = vm.userStatusOptions[0];
    $scope.username = $cookies.get("username");

    $rootScope.username = function (username) {
      return $scope.username = username;
    }

    // function myUsername() {
    //   setTimeout(function () {
    //     $scope.$apply(function () {
    //       $rootScope.username($rootScope.user.name.full)
    //     });
    //   }, 800);
    // }

    // myUsername();


    $scope.$on('updatedUsername', ShowUpdateuserName);
    function ShowUpdateuserName($event, message) {
      $rootScope.username(message)

    }

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


    function setUserStatus(status) {
      vm.userStatus = status;
    }
    vm.support = support;
    function support(){
      window.open('https://desk.zoho.com/portal/checklinkedsystems/home', '_blank');
    }

  }

})();
