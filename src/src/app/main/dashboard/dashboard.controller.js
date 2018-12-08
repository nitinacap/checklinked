(function ()
{

    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController($rootScope, $stateParams, $location, $mdDialog, $mdSidenav, $document, $http, $scope)
    {
     /*   old code for login
     var vm = this;
      vm.url = BASEURL + 'dashboard-login.php';
      window.open(vm.url);
      */

       /* for new changes db */
       var vm = this;
       vm.url = 'http://localhost:8080/checklinked/';
       window.open(vm.url);
        /* end for new changes db */
    }

})();
