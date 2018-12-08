(function () {
  'use strict';

  angular
    .module('app.organization')
    .controller('OrganizationController', OrganizationController)

  /** @ngInject */
  function OrganizationController($rootScope, $mdDialog, $document, $stateParams, $http, $scope, api, $mdSidenav) {
 
    var vm = this;
  
    if ($stateParams.type) {
      vm.type = $stateParams.type

    }

    setTimeout(function () {
      vm.user = $rootScope.user;

      vm.createOrg = createOrg;

      vm.createOrganization = false;
      vm.openOrgInfoDialog = openOrgInfoDialog;

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
        email: '',
        website: '',
        description: ''
      };

      if (((ref = vm.user) != null ? ref.organization : void 0) === void 0 || ((ref1 = vm.user) != null ? ref1.organization : void 0) === null || ((ref2 = vm.user) != null ? ref2.organization.length : void 0) === 0) {
        console.log('blank');
        vm.orgTmp = blank;
      } else {
        if (!vm.user.organizationError){
          vm.orgTmp = vm.user.organization;
        }
        else{
          vm.orgTmp = blank;
        }
        
       
      }

    
      if (vm.orgTmp.idACC > 0) { 
        vm.createOrganization = true; 
        console.log("woworg" + JSON.stringify(vm.orgTmp) + vm.createOrganization);
      }

    }, 1000);
  
    vm.toggleSidenav = toggleSidenav;
    vm.closeDialog = closeDialog;

    vm.update = update;

   

    //console.log('vm.createOrganization', vm.createOrganization);

    vm.selectedSubscription = null;
    vm.updating = false;
    function update() {
      vm.updating = true;
      return $http.post(BASEURL + 'organization-update-post.php', {
        org: vm.orgTmp,
        token:vm.user.token
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).error(function () {
        return $rootScope.message('Error talking to server.', 'warning');
      }).success(function (resp) {
        if (resp.code == void 0 || resp === null || resp === '') {
          return $rootScope.message('Server response is unreadable.', 'warning');
        } else if (resp.code) {
          $mdDialog.hide();
          return $rootScope.message(resp.message);
        } else {
          //$rootScope.user = resp.user;
          //$rootScope.viewAs.user = resp.viewAs;
          $mdDialog.hide();
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
      send = vm.orgTmp;
      return $http.post(BASEURL + 'organization-create-post.php', {
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
          $mdDialog.hide();
          return $rootScope.message('Server response is unreadable.', 'warning');
        } else if (resp.code) {
          $mdDialog.hide();
          return $rootScope.message(resp.message, 'warning');
        } else {
          $rootScope.user = resp.user;
          $mdDialog.hide();
          closeDialog();
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


    function openOrgInfoDialog(ev, info) {

      vm.info = info;
      vm.title = 'Edit Project Name Title';
      vm.newFolder = false;

      if (!vm.folder) {
        vm.folder = {
          'id': '',
          'name': '',
          'description': '',
          'order': '',
          'deleted': false
        };
        vm.title = vm.orgTmp.idACC ? 'Edit Org Info' : 'Add Org Info';
        vm.newFolder = true;
      }

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: vm.orgTmp.idACC ? 'app/main/organization/partials/organization.html' : 'app/main/organization/partials/create-organization.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: false
      });
    }


    setTimeout(function() {
      if ($rootScope.user.organizationError) {
          openOrgInfoDialog(event, $rootScope.user);
           //vm.disableModelClose = true;

      }
   }, 1000);
    
    


    function closeDialog() {
      $mdDialog.hide();
      //$scope.getFolder();


    }

    vm.submenu = [
      { link: 'user', title: 'My Profile' },
      { link: 'contacts', title: 'Contacts' },
      { link: '', title: 'Organization' },
      { link: 'account', title: 'Account' }
    ];



  }





})();
