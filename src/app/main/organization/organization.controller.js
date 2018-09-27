(function () {
  'use strict';

  angular
    .module('app.organization')
    .controller('OrganizationController', OrganizationController);

  /** @ngInject */
  function OrganizationController($rootScope, $http, $scope, api, $mdSidenav) {

    var vm = this;

    vm.user = $rootScope.user;

    console.log('vm.user', vm.user);

    vm.toggleSidenav = toggleSidenav;

    vm.update = update;

    vm.createOrg = createOrg;

    vm.createOrganization = false;


    var blank, ref, ref1, ref2;

    blank = {
      name: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        state: '',
        zip: '',
        country: 'USA'
      },
      phone: '',
      email: ''
    };


    console.log('$rootScope.user', $rootScope.user);
    debugger;
    if (((ref = $rootScope.user) != null ? ref.organization : void 0) === void 0 || ((ref1 = $rootScope.user) != null ? ref1.organization : void 0) === null || ((ref2 = $rootScope.user) != null ? ref2.organization.length : void 0) === 0) {
      console.log('blank');
      vm.orgTmp = blank;
    } else {
      vm.orgTmp = $rootScope.user.organization;
      console.log('notblank');
    }

    console.log('vm.orgTmp', vm.orgTmp);

    if(vm.orgTmp.idACC > 0){ vm.createOrganization = true;}

    //console.log('vm.createOrganization', vm.createOrganization);

    vm.selectedSubscription = null;
    vm.updating = false;

    function update() {
      console.log('vm.orgTmp', vm.orgTmp);
      vm.updating = true;
      return $http.post('https://checklinked.com/ajax/organization-update-post.php', {
        org: vm.orgTmp
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        cache: false
      }).error(function () {
        return $rootScope.message('Error talking to server.', 'warning');
      }).success(function (resp) {
        if (resp === void 0 || resp === null || resp === '') {
          return $rootScope.message('Server response is unreadable.', 'warning');
        } else if (resp.code) {
          return $rootScope.message(resp.message);
        } else {
          $rootScope.user = resp.user;
          $rootScope.viewAs.user = resp.viewAs;
          return $rootScope.message('Organization Information updated successfully.');
        }
      })["finally"](function () {
        return vm.updating = false;
      });
    };

    vm.creating = false;

    function createOrg() {
      var send;
      vm.creating = true;
      console.log('org id', vm.orgTmp);
      send = vm.orgTmp;
      return $http.post('https://checklinked.com/ajax/organization-create-post.php', {
        org: send
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        cache: false
      }).error(function () {
        return $rootScope.message('Error talking to server.', 'warning');
      }).success(function (resp) {
        if (resp === void 0 || resp === null || resp === '') {
          return $rootScope.message('Server response is unreadable.', 'warning');
        } else if (resp.code) {
          return $rootScope.message(resp.message, 'warning');
        } else {
          $rootScope.user = resp.user;
          return $rootScope.message('Organization details have been updated.', 'success');
        }
      })["finally"](function () {
        return vm.creating = false;
      });
    };


    //Toggle Left Side Nav
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

  }

})();
