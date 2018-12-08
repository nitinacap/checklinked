(function () {
  'use strict';

  angular
    .module('app.reset')
    .controller('ResetController', ResetController);

  /** @ngInject */
  function ResetController($http, $stateParams, $scope) 
  {
    var vm = this;

    vm.isLoader = false;
    vm.resetPassword = resetPassword;
    vm.changePassword = changePassword;


    if ($stateParams.token) {
       var token = $stateParams.token;
       vm.token = $stateParams.token;
       PasswordTokenVerify(token);
     }


    function PasswordTokenVerify(token) {

      $http.get(BASEURL + 'account-create-confirm.php?token=' + token).success(function (res) {
        if (res.code == 1) {
          $scope.errtoken = res.message
        }
        else if (res.code == 0) {
          $scope.successtoken = "Your account has been confirmed and you can now log in.";
          console.log($scope.successtoken);
        }
      }).error(function (res) {
        $scope.errtoken = res.message;

      })
    }

    function changePassword(token){

      vm.isLoader = true;
      $http.post(BASEURL + "/password-reset.php", {
        password: vm.password,
        password_confirmation: vm.password_confirmation,
      }, 
      { headers: {'Content-Type': 'application/x-www-form-urlencoded' },
          cache: false
        }).success(function (res) {
          vm.isLoader = false;

        }).error(function (err) {
          //$scope.login_error = "Please enter correct username and password";
        }) 
    
    }

    function resetPassword() {


      vm.isLoader = true;
      $http.post(BASEURL + "/password-reset-request.php", {
        email: vm.email,
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).success(function (res) {
          vm.isLoader = false;
     
     }).error(function (err) {
       vm.isLoader = false;
          vm.login_error = "Please enter your registered email id";
        })
  
}

  }


})();
