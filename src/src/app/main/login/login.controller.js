(function () {
  'use strict';

  angular
    .module('app.login')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($rootScope, $scope, $stateParams, $http, $state, $cookies, api, $httpParamSerializer) 
  {
    var vm = this;

    vm.isLoader = false;
  if ($stateParams.token){
      var token = $stateParams.token;
      activateAccount(token);
    }

    function activateAccount(token){

      $http.get(BASEURL +'account-create-confirm.php?token=' + token).success(function (res) {
        if(res.code==1){
           $scope.errtoken =  res.message
        }
        else if(res.code==0){
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


  vm.isLoader =true;
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
    if(res.code==1){
      console.log(res);
      $scope.login_error = "Please enter correct username and password";    

    }
    else if(res.code==0){
        $cookies.put("token", res.user.token);
        $rootScope.token = res.user.token;
        $rootScope.user = res.user;
     //var organizationError = res.user.organizationError;
      var organizationError = res.user.organization;
      console.log('organizationError in login controller');
      console.log(organizationError);
      var destination;

      if (res.user.organizationError){
        destination = 'app.organization';
      }else{
        destination = 'app.user';
      }

    // var destination = 'app.user';
   // if (organizationError !== null) {
  // //    destination = 'app.organization';
   // } else {
   //  destination = 'app.user';
   // }

    $state.go(destination);
    

    }
    
   


  }).error(function (err) {
     $scope.login_error = "Please enter correct username and password";
  })

} 

  /** new code  */
   

    /** End new code  */

    function logout() {
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
