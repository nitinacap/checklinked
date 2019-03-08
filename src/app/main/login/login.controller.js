(function () {
  'use strict';

  angular
    .module('app.login')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($rootScope, $scope, $cookieStore, $stateParams, $http, $state, $cookies) {
    var vm = this;
    vm.isLoader = false;
    vm.twofactor = false;
    vm.verifyTwoFactorOTP = verifyTwoFactorOTP;
    if ($stateParams.token) {
      var token = $stateParams.token;
      activateAccount(token);
    }

    function activateAccount(token) {
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
    /*    =========
    
        ======*/
    // Methods
    vm.login = login;
    vm.logout = logout;


    function login() {
      vm.isLoader = true;
      $http.post(BASEURL + "login-doAuth.php", {
        user: vm.email,
        pass: vm.form.password
      }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).success(function (res) {
          vm.isLoader = false;
          if (res.code == '-1') {
           // $scope.login_error = "Please enter correct username and password";
           $scope.login_error =res.message;
            setTimeout(function () {
              $scope.$apply(function () {
                $scope.login_error = '';
              })
            }, 1800)

          }
          else if (res.code == 0) {

            $cookies.put("username", res.user.name.full);
            $cookies.put("useridCON", res.user.idCON);
            $cookies.put("token", res.user.token);
            $cookies.put('users', res.user);
            $rootScope.token = res.user.token;
            $rootScope.userData = res.user;
            //var organizationError = res.user.organizationError;
            var organizationError = res.user.organization;
            console.log('organizationError in login controller',res.user);
            console.log(organizationError);
            var destination;
            var OTP = false;
            if(OTP){
              vm.twofactor = true;
              verifyTwoFactorOTP();
            }
            else if (res.user.organizationError) {
              destination = 'app.organization';
            } else {
              destination = 'app.user';
            }
            $state.go(destination);
          }

        }).error(function (err) {
          $scope.login_error = "Please enter correct username and password";
        })

    }

// Verify OTP for two factor login

    
function verifyTwoFactorOTP() {
  alert(vm.otp)
  $http.post(BASEURL +'setting.php', {
    type: 'OTP',
    item:vm.otp,
    token: $cookies.get("token")

  }, {headers: {'Content-Type': 'application/x-www-form-urlencoded' },
    cache: false
  }).success(function (res) {
    vm.isLoader = false;
    if(res.code==1){
       $scope.errtoken =  res.message
    }
    else if(res.code==0){
    $scope.successtoken = "Two factoe login has been updated successfully";
    if (res.user.organizationError) {
      destination = 'app.organization';
    } else {
      destination = 'app.user';
    }
    $state.go(destination);
    }
  }).error(function (res) {
    $scope.errtoken = res.message;

  })
}


    /** End new code  */

    function logout() {
      debugger;
      $rootScope.token = null;
      $rootScope.user = null;
      debugger;
      $http.get(BASEURL + 'logout.php')
        .then(
          function (res) {
          },
          function (err) {
          }
        );
    }


  }


})();
