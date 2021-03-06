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
    $rootScope.loginCredentials ={};
    vm.title = 'Alert';
    vm.message  = 'Unauthorized Access';

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
    // vm.login = login;
    vm.logout = logout;

    function closeDialog() {
      $mdDialog.hide();
     
    }

    
    $rootScope.login = function() {

      if(vm.email)  $rootScope.loginCredentials.email = vm.email;
      if (vm.form.password)  $rootScope.loginCredentials.password = vm.form.password;



      vm.isLoader = true;
      $http.post(BASEURL + "login-doAuth.php", {
        user: $rootScope.loginCredentials.email,
        pass: $rootScope.loginCredentials.password
      }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).success(function (res) {
          vm.isLoader = false;
          console.log("Welcom"+ res);
          if (res.code == '-1') {
            // $scope.login_error = "Please enter correct username and password";
            $scope.login_error = res.message;
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
            $cookies.put('users', JSON.stringify(res.user)) ;
            // res.user.roles = ["Paid User"]
            $cookies.put('userRoles', res.user.roles);
            
            // // 
            //localStorage.setItem("org_name",res.user.organization.name);
            $rootScope.token = res.user.token;
            $rootScope.userData = res.user;
            // $rootScope.user = res.user;
            // // 
            getUserRoles(res.user.idCON);

            var empArray = [];


            $cookies.put('logged_user_roles', res.user.roles);
            $cookies.put('logged_user_id', res.user.idCON);

            // if Object.assign is not valid
            if (typeof Object.assign != 'function') {
              Object.assign = function(target) {
                'use strict';
                if (target == null) {
                  throw new TypeError('Cannot convert undefined or null to object');
                }
            
                target = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                  var source = arguments[index];
                  if (source != null) {
                    for (var key in source) {
                      if (Object.prototype.hasOwnProperty.call(source, key)) {
                        target[key] = source[key];
                      }
                    }
                  }
                }
                return target;
              };
            }
         
            angular.forEach(res.user.roles_permissions.roles, function (item) {
              Object.assign(empArray, item);

            });
            $cookies.put("userpermission", JSON.stringify(empArray.permissions));

            //var organizationError = res.user.organizationError;
            var organizationError = res.user.organization;
            console.log('organizationError in login controller', res.user);
            console.log(organizationError);
            var destination;
            var OTP = true;
            if (res.user && res.user.two_step == 1) {
              vm.twofactor = true;
              verifyTwoFactorOTP(res.user.login_otp);
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

    function getUserRoles(id) {

      $http.post(BASEURL + 'role-permission.php', {
        item_type: 'roleType',
        id: id,
        type: 'getuserrole'
      }).success(function (res) {
        var roledata = res.roleType.roles;
        // var empArray = [];

        // angular.forEach(roledata, function (item) {
        //   Object.assign(empArray, item);

        // });
        // $cookies.put('userpermission',empArray);
      });
    }

    // Verify OTP for two factor login

    function verifyTwoFactorOTP() {
      vm.otp  = parseInt(vm.otp);
      if (vm.otp == '') {
        vm.otp_message = "OTP is required";
      } else if (vm.otp && vm.otp !== $rootScope.userData.login_otp) {
        vm.otp_message = "Your OTP is not valid";
      } else if (vm.otp == $rootScope.userData.login_otp) {
        $state.go('app.user');
      }

    }


    /** End new code  */

    function logout() {
      $rootScope.token = null;
      $rootScope.user = null;
      // ;
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
