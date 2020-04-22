(function () {
  'use strict';

  angular
    .module('app.toolbar')
    .controller('ToolbarController', ToolbarController);

  /** @ngInject */
  function ToolbarController($rootScope, $scope, $mdMenu, $cookies, $location, $timeout, $http, $mdSidenav, $translate, $mdToast, msNavigationService, toastr) {
    var vm = this;
    vm.currentSettingMenu = currentSettingMenu;
    // Data
    $rootScope.global = {
      search: ''
    };
    // vm.IsHidden = false;
    // vm.ShowHideToggle = ShowHideToggle;
    // vm.HideToggle = HideToggle;



    // $scope.$watch("$mdMenuClose", function() { console.log("menu closing"); //  });

    // $scope.$watch(function ()
    // {
    //     return "$mdMenuClose";
    // }, function (current, old)
    // {
    //   console.log("menu closing"); //  
    // });

    // function ShowHideToggle() {

    //   vm.IsHidden = vm.IsHidden ? false : true;

    //   vm.IsHidden
    //   // 
    // }

    // function HideToggle() {
    //   // 
    //   vm.IsHidden  = false ;

    // }
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

    function currentSettingMenu(id, name){
 
      $rootScope.curreManuItemName = name;
      //$rootScope.myvalue = true;
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


    vm.teammembers = ['Permissions', 'Subscription', 'Billing'];
    var userpermission = $cookies.get("userpermission");
    vm.checkIsPermission = userpermission ? JSON.parse(userpermission) : '';

    $rootScope.AccountPermission = {};
    var userRoles = $cookies.get("userRoles").toString();
    $rootScope.AccountPermission.isPaidUser = userRoles.includes('Paid User');
    $rootScope.AccountPermission.isFreeUser = userRoles.includes('Free User');
    $rootScope.AccountPermission.isController = userRoles.includes('Controller');
    $rootScope.AccountPermission.isManager = userRoles.includes('Manager');
    $rootScope.AccountPermission.isAccountOwner = userRoles.includes('Account Owner');
    $rootScope.AccountPermission.isAdmin = userRoles.includes('Admin');
    

    // function myUsername() {
    //   setTimeout(function () {
    //     $scope.$apply(function () {
    //       $rootScope.username($rootScope.user.name.full)
    //     });
    //   }, 800);
    // }

    // myUsername();

    // 
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
