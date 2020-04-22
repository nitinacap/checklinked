(function () {
  'use strict';

  angular
    .module('app.checklist')
    .controller('ChecklistShowLinkedUsersDialogController', ChecklistShowLinkedUsersDialogController);

  /** @ngInject */
  function ChecklistShowLinkedUsersDialogController($mdDialog, Checklist, event, api, $document, $mdSidenav, $http, $rootScope, $scope, $stateParams, $filter) {
    var vm = this;

    vm.idCHK = $stateParams.id;
    vm.checklist = angular.copy(Checklist);
    vm.title = 'Show Linked Users "' + vm.checklist.name + '"';

    vm.checklist = {
      'parentId': $stateParams.id
    }

    // Methods		
    vm.setChecklistCtrlBlank = setChecklistCtrlBlank;
    vm.setBlank = setBlank;
    vm.setError = setError;
    vm.loadLinkedUsers = loadLinkedUsers;
    vm.closeDialog = closeDialog;

    //vm.closeDialog = closeDialog;
    console.log('$scope on dialog at load', $scope);
    console.log('vm on dialog at load', vm);


    function closeDialog() {
      $mdDialog.hide();
    }



    function setBlank() {
      $scope.loadingLinked = false;
      vm.error = 0;
      vm.message = '';
      $scope.users = [];
      return $scope.usersLoaded = false;
    };

    vm.setBlank();


    function setError(err, msg) {
      vm.error = err;
      return vm.message = msg;
    };


    $scope.toggleShowCheckboxes = function (user) {

      var show;
      console.log('user', user);
      show = {
        idCON: user.idCON,
        name: user.name.first
      };
      console.log('$scope on toggle', $scope);
      if (user.isShowing) {
        user.isShowing = false;
        //$scope.removeUserCheckboxes(show);
      } else {
        user.isShowing = true;
        //$scope.displayUserCheckboxes(show);
        console.log('displayed user', user, show);
        console.log('showingUsers', $scope.showingUsers);
        debugger
      }
      return true;
    };


    function loadLinkedUsers() {
      //console.log('loading users', $scope);
      vm.setBlank();
      $scope.loadingLinked = true;
      return api.checklists.getLinkedUsers(vm.idCHK).then(function (res) {
        if (res === void 0 || res === null || res === '') {
          return vm.setError(-1, 'Server not responding properly.');
        } else if (res.code) {
          return vm.setError(res.code, res.message);
        } else {
          res.checklists.forEach(function (cfc) {
            //console.log('res', res);
            var usr;
            usr = cfc.ownerDetails;
            usr.isShowing = false;
            $scope.users.push(usr);
            if (usr.idCON === $rootScope.viewAs.user.idCON) {
              //console.log('vm.toggleShowCheckboxes(usr)', vm.toggleShowCheckboxes(usr));
              return $scope.toggleShowCheckboxes(usr);
              console.log('error here');
            }

          });
          return $scope.usersLoaded = true;
        }
      }, function (err) {
        return vm.setError(-1, 'Unable to load linked user list.');
      }).then(function () {
        return $scope.loadingLinked = false;
      });

    };

    $scope.$on('event:checklistLoaded', function () {
      if (!$scope.usersLoaded && !$scope.loadingLinked) {
        console.log('loading users by event');
        return vm.loadLinkedUsers();
      }
    });
    if (!$scope.usersLoaded && !$scope.loadingLinked) {
      console.log('loading users by default');
      console.log('$scope.users', $scope.users);
      return vm.loadLinkedUsers();
    }


  }
})();