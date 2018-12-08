(function () {
  'use strict';

  angular
    .module('app.user')
    .controller('UserController', UserController);

  /** @ngInject */
  function UserController($rootScope, $stateParams,$location, $mdDialog, $document,  $http, $state, $scope, api, $mdSidenav) {

    var vm = this;
    vm.editDialog = editDialog;
    vm.changePassword = changePassword;
    vm.closeDialog = closeDialog;

    vm.updateUser = updateUser;
    setTimeout(function(){
      if (!$rootScope.user) {
        $state.go('app.login');
      }
    }, 1000);

    if ($stateParams.type) {
      vm.type = $stateParams.type

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


    function closeDialog() {
      $mdDialog.hide();
      //$scope.getFolder();

   }
    function changePassword(){
      vm.updating = true;
      return $http.post(BASEURL + 'organization-update-post.php', {
        user: vm.user
      }, 
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          cache: false
        }).error(function () {
          return $rootScope.message('Error talking to server.', 'warning');
        }).success(function (resp) {
          return $rootScope.message('Password has been successfully', 'success');
         
        })
    }



  }
})();
