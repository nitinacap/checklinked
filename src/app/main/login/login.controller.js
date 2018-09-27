(function () {
  'use strict';

  angular
    .module('app.login')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($rootScope, $scope, $http, $state, api, $httpParamSerializer, $stateParams) {
    var vm = this;

    if ($stateParams.token){
      var token = $stateParams.token;
      activateAccount(token);
    }

    function activateAccount(token){
      $http.get(BASE_URL + 'signup/activate/' + token).success(function (res) {
        $scope.successtoken = "Your account has been confirmed and you can now log in.";
      }).error(function (err) {
        $scope.errtoken = err.message;
      })
    }
    // Methods
    vm.login = login;
    vm.logout = logout;

/** Old code  
function login() {
  $http.post("https://checklinked.com/ajax/login-doAuth.php", {
    user: vm.email,
    pass: vm.form.password
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    cache: false
  }).success(function (res) {
    debugger;
    var organizationError = res.user.organizationError;

    if (organizationError !== null) {
      var destination = 'app.organization';
    } else {
      var destination = 'app.user';
    }

    $state.go(destination);

  }).error(function (err) {
  })

} **/

  /** new code  */
 
    function login() {
      $http.post(BASE_URL + "login", $httpParamSerializer({"email":vm.email,"password":vm.form.password}), {
        withCredentials: false
      }).success(function (res) {
  
        $rootScope.token = res.token;
        $rootScope.user = res.user;
        var organizationError = res.user.organizationError;
        if ($rootScope.user.notification ==1){
          var destination = 'app.user';
          firstLogin(destination);
        }else{
          var destination = 'app.organization';
          $state.go(destination);

        }

      }).error(function (err) {
        $scope.login_error = "Please enter correct username and password";
      })

    }
    function firstLogin(destination){
      $scope.firstLogin=true;
      $state.go(destination);
   

    }

    /** End new code  */

    function logout() {

      debugger;
      $http.get('https://checklinked.com/ajax/logout.php')
        .then(
          function (res) {
          },
          function (err) {
          }
        );
    }
  }
})();
