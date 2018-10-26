(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserController', UserController);

  /** @ngInject */
  function UserController($rootScope, $http, $state,  $scope, api, $mdSidenav) {

    var vm = this;
    console.log('Hello');

    vm.updateUser = updateUser;
    if (!$rootScope.token){
       $state.go('app.login');
    }
    vm.update = {
      editable: false,
      sending: false,
      cancel: function () {
        this.editable = false;
        return this.sending = false;
      },
      send: function () {
        this.sending = true;
        return api.account.update(this.info, $rootScope.token).error(function (res) {
          return $rootScope.message('Server not responsing properly.', 'warning');
        }).success(function (res) {
          $rootScope.username(res.user.name.full);
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Error talking to server', 'warning');
          } else if (res.code) {
            $rootScope.user = res.user;
            return $rootScope.message(res.message, 'warning');
          } else {
            $rootScope.user = res.user;
            vm.update.editable = false;
            return $rootScope.message(res.message);
          }
        })["finally"](function () {
          return vm.update.sending = false;
        });
      },
      info: {
        notifications: 0,
        name: {
          first: '',
          last: ''
        },
        email: '',
        password: '',
        phone: ''
      }
    };

    function updateUser(u) {
      vm.update.info = {
        notifications: +u.notifications,
        name: {
          first: u.name.first,
          last: u.name.last
        },
        email: u.email,
        password: u.password,
        phone: u.phone,
        token: $rootScope.token
      };
    };

    // Fetch user object from $rootScope on broadcast event
    $scope.$on('event:userLoaded', function () {
      vm.updateUser($rootScope.user);
    });

    // Fetch user object from $rootScope
    if ($rootScope.user !== undefined) {
      vm.updateUser($rootScope.user);
    }


    vm.toggleSidenav = toggleSidenav;

    //Toggle Left Side Nav
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    $scope.$on('event:startDoomsDayDevice', function (data) {

      console.log('data', data);

    });

    console.log('vm.update', vm.update);

  }
})();
