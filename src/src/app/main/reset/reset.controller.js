(function () {
  'use strict';

  angular
    .module('app.reset')
    .controller('ResetController', ResetController);

  /** @ngInject */
  function ResetController($http, $stateParams) {
    var vm = this;

    vm.isLoader = false;
    vm.resetPassword = resetPassword;
    vm.changePassword = changePassword;


    if ($stateParams.token) {
      var token = $stateParams.token;
      vm.token = $stateParams.token;
      console.log('token2=' + vm.token);
      PasswordTokenVerify(token);
    }

    vm.check_valid_token = false;
    function PasswordTokenVerify(token) {

      $http.get(BASEURL + '/password-tokenverify.php?token=' + token).success(function (res) {
        if (res.type == 'error') {
          vm.token_verify = res.message;
        }
        else {
          vm.token_verify = res.message;
          vm.check_valid_token = true;
        }
      }).error(function (res) {

      })
    }

    function changePassword(token) {
      vm.check_valid_token = true;
      vm.isLoader = true;
      $http.post(BASEURL + "/password-reset.php", {
        password: vm.password,
        password_confirmation: vm.password_confirmation,
        token: $stateParams.token
      },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          cache: false
        }).success(function (res) {
          vm.isLoader = false;
          if (res.type == 'error') {
            vm.change_verified = false;
            vm.change_verify = res.message;
          }
          else {
            vm.change_verified = true;
            vm.change_verify = res.message;
            setTimeout(function () {
             window.location = "/url";
            }, 1200);
          }

        }).error(function (err) {
          //$scope.login_error = "Please enter correct username and password";
        })

    }

    vm.error = '';
    vm.success = '';
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
          if (res.type == 'error') {
            vm.success = '';
            vm.error = res.message;
          } else {
            vm.error = '';
            vm.success = res.message;
            vm.email = null;

   
          
          }

        }).error(function (err) {
          console.log('Error found password');
          vm.isLoader = false;
        })

    }

  }


})();
