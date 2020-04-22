(function () {
  'use strict';

  angular
    .module('app.organization')
    .controller('OrganizationController', OrganizationController)

  /** @ngInject */
  function OrganizationController($rootScope, $cookieStore, $mdDialog, $cookies, $document, $stateParams, $state, $http, $scope, api, $mdSidenav) {

    var vm = this;
    // vm.uploadSpreadsheet = uploadSpreadsheet;
    vm.user_Roles = api.isUserRole('Controller');
    if ($stateParams.type) {
      vm.type = $stateParams.type

    }
    // vm.currentItem = parseInt($rootScope.curreManuItem);

    // function to change the tab from the top menu vertical options starts
    $scope.$watch(function() {
      return $rootScope.curreManuItem;
    }, function() {
      if($rootScope.curreManuItemName === 'organization'){
        vm.currentItem = parseInt($rootScope.curreManuItem);
      }
    }, true);

    // function to change the tab from the top menu vertical options ends

    setTimeout(function () {
      $scope.$apply(function () {
        vm.user = $rootScope.user;
      });
      vm.createOrg = createOrg;
      vm.createOrganization = false;
      vm.openOrgInfoDialog = openOrgInfoDialog;
      vm.getAllSpreadsheets = getAllSpreadsheets;
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
          vm.OrganizationName = vm.orgTmp.name;
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
      
     
      vm.UpdatedSuccess = false;
      vm.updating = true;
      return $http.post(BASEURL + 'organization-update-post.php', {
        org: vm.orgTmp,
        token: vm.user.token
      }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }).error(function () {
          
          vm.orgTmp.name = vm.OrganizationName ;
          return $rootScope.message('Error talking to server.', 'warning');
        }).success(function (resp) {
          
          if (resp.code == void 0 || resp === null || resp === '') {
            
            vm.orgTmp.name = vm.OrganizationName ;
            return $rootScope.message('Server response is unreadable.', 'warning');
          } else if (resp.code) {
            // $mdDialog.hide();
            
            vm.orgTmp.name = vm.OrganizationName ;
           return $rootScope.message(resp.message, 'error');
          } else {
            //$rootScope.user = resp.user;
            //$rootScope.viewAs.user = resp.viewAs;
            //$mdDialog.hide();
            
            vm.UpdatedSuccess = true;

            $rootScope.message('Organization Information updated successfully.');
            
              vm.OrganizationName = vm.orgTmp.name;
              $scope.changedInfoDialog($rootScope.user);
              $scope.status = 'You said the information was "' + answer + '".';
         
            
             
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
      
      vm.newFolder = false;

    

      if (!vm.folder) {
        vm.folder = {
          'id': '',
          'name': '',
          'description': '',
          'order': '',
          'deleted': false
        };
        vm.title = (vm.orgTmp && vm.orgTmp.idACC) ? 'Edit Org Info' : 'Add Org Info';
        vm.newFolder = true;
      }

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: (vm.orgTmp && vm.orgTmp.idACC) ? 'app/main/organization/partials/organization.html' : 'app/main/organization/partials/create-organization.html',
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
      { link: 'user', title: 'My Profile', active : false },
      { link: 'contacts', title: 'Contacts', active : false },
      { link: 'organization', title: 'Organization', active : true },
      { link: 'teammembers', title: 'Account', active : false }
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
         
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        });

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
      vm.isLoader = true;
      $http.post(BASEURL + 'organization-stats.php', { 'token': $cookies.get('token') },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          cache: false
        }).error(function (resp) {

          vm.isLoader = false;
          // if(!resp) $rootScope.message('Server Error', 'error')
          // else
          if(resp) $rootScope.message(resp.message, 'error')
        }).success(function (resp) {
          vm.isLoader = false;
          if (resp.type == 'success') {
            vm.stats = resp.stats;
          } else {
            console.log('server error while getting stats');

          }

        })
    };
    Stats();

    // function uploadSpreadsheet() {
    //   var files = document.getElementById('spreadshet').files[0];
    //   var fd = new FormData();
    //   fd.append('file', files);
    //   var filedata = { name: vm.name, description: vm.description };
    //   fd.append('data', JSON.stringify(filedata));

    //   $http.post(BASEURL + 'organization-spreadsheet.php', fd,
    //     {
    //       headers: { 'Content-Type': undefined },
    //       cache: false
    //     }).error(function () {
    //     }).success(function (resp) {
    //       if (resp.type == 'success') {
    //         vm.stats = resp.stats;
    //       } else {
    //         console.log('server error while getting stats');
    //       }

    //     })


    // }


    // all_spreadsheets code starts

   

    
    // vm.excels= {


    //   all_spreadsheets: [],
    //   loading : false,
    //   viewing : false,
    //   progress: true,

    //   view : function(excel, index) {


    //     vm.excels.viewing = excel;
    //     vm.excels.viewing.id = index;
    //     vm.excels.success = false;

    //     vm.excels.viewing = false;

    //     if(vm.origColspanLength == undefined || vm.origColspanLength < excel.data.heading.length){
    //       vm.origColspanLength = excel.data.heading.length ;
    //       if(vm.colspanLength < 4 )  vm.colspanLength = 2;
    //       else vm.colspanLength = vm.origColspanLength - 1;
    //     }


    //     vm.excel_open_id = excel.id;
        
    //     vm.sub_excel_data = excel;
        
    //   },

    //   clear : function(excel) {
    //     vm.excels.viewing = false;

    //     }

    // }

    vm.excel_sub_heading='';
    vm.reverse = true;
    vm.sortBy = sortBy;

    function getAllSpreadsheets() {
      api.organization.get_all_spreadsheets().then(function (d) {
        vm.isLoader = false;
        if (d.data.code == '-1') {
          if(d.data.message=='unauthorized access'){
            $state.go('app.logout');
          }else{
          }
        } else {
          vm.all_spreadsheets = d.data.spreadsheets;

          vm.excels.progress = false;
        
        }
      });
    };
    // getAllSpreadsheets();


    vm.total_active_users = function ($index) {

       vm.sub_excel = vm.all_spreadsheets[$index];
      return vm.sub_excel.data.length;
    }


    function sortBy(excel_sub_heading) {
      console.log(excel_sub_heading);
      vm.reverse = (vm.excel_sub_heading === excel_sub_heading) ? !vm.reverse : false;
      vm.excel_sub_heading = excel_sub_heading;
    };





    // all_spreadsheets code ends

  };


  






})();
