(function () {
  'use strict';

  angular
    .module('app.organization')
    .controller('OrganizationController', OrganizationController)

  /** @ngInject */
  function OrganizationController($rootScope, $cookieStore, $mdDialog, $cookies, $document, $stateParams, $state, $http, $scope, api, $mdSidenav) {

    var vm = this;
    if ($stateParams.type) {
      vm.type = $stateParams.type

    }
    vm.currentItem = parseInt($rootScope.curreManuItem);

    setTimeout(function () {
      $scope.$apply(function () {
      vm.user =$rootScope.user;
      });
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
        description: '',
        link: ''
      };

      if (((ref = vm.user) != null ? ref.organization : void 0) === void 0 || ((ref1 = vm.user) != null ? ref1.organization : void 0) === null || ((ref2 = vm.user) != null ? ref2.organization.length : void 0) === 0) {
        vm.orgTmp = blank;
      } else {
        if (!vm.user.organizationError) {
          vm.orgTmp = vm.user.organization;
        }
        else {
          vm.orgTmp = blank;
        }

      }
      if (vm.orgTmp.idACC > 0) {
        vm.createOrganization = true;
      }

    }, 2000);

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
        token: vm.user.token
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
            // $mdDialog.hide();
            return $rootScope.message(resp.message);
          } else {
            //$rootScope.user = resp.user;
            //$rootScope.viewAs.user = resp.viewAs;
            //$mdDialog.hide();
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
        vm.title = (vm.orgTmp && vm.orgTmp.idACC.idACC) ? 'Edit Org Info' : 'Add Org Info';
        vm.newFolder = true;
      }

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: (vm.orgTmp && vm.orgTmp.idACC.idACC) ? 'app/main/organization/partials/organization.html' : 'app/main/organization/partials/create-organization.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: false
      });
    }


    setTimeout(function () {
      if ($rootScope.user && $rootScope.user.organizationError) {
        openOrgInfoDialog(event, $rootScope.user);
        //vm.disableModelClose = true;

      }
    }, 1000);




    function closeDialog() {
      //$scope.getFolder();
      $mdDialog.hide();


    }

    vm.submenu = [
      { link: 'user', title: 'My Profile' },
      { link: 'contacts', title: 'Contacts' },
      { link: '', title: 'Organization' },
      { link: 'teammembers', title: 'Account' }
    ];


    vm.EditOrgConfirm = EditOrgConfirm;
    function EditOrgConfirm(ev) {
      vm.title = 'Organization Changes';
      vm.warning = 'Warning';
      vm.description = " Please confirm you want to change your information.<br>Editing your information will change it through the system."
      $mdDialog.show({
        //controller: DialogController,
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        targetEvent: ev,
        clickOutsideToClose: false
      })
        .then(function (answer) {
          vm.update();
          $scope.changedInfoDialog($rootScope.user);
          $scope.status = 'You said the information was "' + answer + '".';
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });

      // var confirm = $mdDialog.confirm()
      //   .title('Are you sure to update this organization')
      //   //.htmlContent('This action cannot be undone.')
      //   .ariaLabel('delete')
      //   .targetEvent(ev)
      //   .ok('OK')
      //   .cancel('CANCEL');

      // $mdDialog.show(confirm).then(function () {
      //   vm.update();
      //   $scope.changedInfoDialog($rootScope.user);

      // }, function () {
      //   openOrgInfoDialog(event, $rootScope.user);

      // });
    }

    //organization detail after saved and edit
    $scope.changedInfoDialog = function (item) {
      vm.item = item.organization;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/details.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: item,
        clickOutsideToClose: false
      });
    };

    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };


    function Stats() {
      $http.post(BASEURL + 'organization-stats.php', {'token':$cookies.get('token') },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          cache: false
        }).error(function () {
        }).success(function (resp) {
          if (resp.type == 'success') {
            vm.stats = resp.stats;
          } else {
           console.log('server error while getting stats');

          }

        })
    };
    Stats();

  };






})();
