(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserController', UserController);

  /** @ngInject */
  function UserController($rootScope, $mdDialog, $document, $http, $state, $scope, api, $mdSidenav) {

    var vm = this;
    vm.editDialog = editDialog;
    vm.changePassword = changePassword;
    vm.closeDialog = closeDialog;

    vm.updateUser = updateUser;
    // setTimeout(function () {
    //   if (!$rootScope.user) {
    //     $state.go('app.login');
    //   }
    // }, 1000);
    // console.log("types= " + $stateParams.type);
    // if ($stateParams.type) {
    //   vm.type = $stateParams.type

    // }

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
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Error talking to server', 'warning');
          } else if (res.code) {
           $rootScope.user = res.user;
            return $rootScope.message(res.message, 'warning');
          } else {
            $scope.user = res.user;
            $rootScope.$broadcast('updatedUsername', res.user.name.full);
            $mdDialog.hide();
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
        phone: '',
        token: ''
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
        token: $rootScope.user.token
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

    //Change Password 

    function editDialog(ev, type) {
      console.log(type)
      vm.title = type == 'changepassword' ? 'Change Password' : 'Edit Profile';
      vm.newFolder = false;

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: type == 'changepassword' ? 'app/main/user/partials/changepassword.html' : 'app/main/user/partials/user.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }


    function closeDialog(type) {
      $mdDialog.hide();
      if(type=='profile'){
        vm.updateUser($rootScope.user);
      }

    }
    vm.changeprocess = false;
    function changePassword() {
      vm.changeprocess = true;
      $http.post(BASEURL + 'password-change.php', vm.user,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          cache: false
        }).error(function () {
          vm.changeprocess = false;
          return $rootScope.message('Error talking to server.', 'warning');
        }).success(function (resp) {
          if (resp.type == 'error') {
            vm.changeprocess = false;
            return $rootScope.message(resp.message, 'warning');

          } else {
            vm.changeprocess = false;
            $mdDialog.hide();
            return $rootScope.message(resp.message, 'success');

          }

        })
    }

    vm.submenu = [
      { link: '', title: 'My Profile' },
      { link: 'contacts', title: 'Contacts' },
      { link: 'organization', title: 'Organization' },
      { link: 'account', title: 'Account' }
    ];

  }
})();
