(function () {
  'use strict';

  angular
    .module('app.other')
    .controller('OthersController', OthersController);

  /** @ngInject */
  function OthersController($rootScope, $state, $cookies, $stateParams, $scope, $mdSidenav, $window, $mdDialog, $document, api, $http) {
    var vm = this;
    // vm.user_id = $cookies.get('useridCON');
    vm.isLoader = true;

    vm.getAttachments = getAttachments;
    vm.downloadAttachment = downloadAttachment;
    vm.attachmentOrder = '';
    vm.attachmentDescending = false;

    vm.getDataPoints = getDataPoints;
    vm.deleteDataPoint = deleteDataPoint;
    vm.confirmDeleteDatapoint = confirmDeleteDatapoint;
    vm.dataPoints = {};
    vm.toDeleteDatapointID = undefined;
    vm.closeDialog = closeDialog;
    vm.DataPointDialog = DataPointDialog;
    vm.saveDataPoint=saveDataPoint;
    vm.uploadNewExcel=uploadNewExcel;

    vm.uploadSpreadsheet = uploadSpreadsheet;
    // vm.UpdateViewForUpdatedDatapoint = UpdateViewForUpdatedDatapoint;

    vm.sortBy = sortBy;
    vm.propertyName = '';
    vm.reverse = true;

    vm.datapoint_item = {};
    // vm.confirm_warning_DP = false;

    function getAttachments() {
      $http.get(BASEURL + 'user-attachment.php?user_id=' + $cookies.get('useridCON'), {
        cache: false
      }).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          vm.attachments = res.attachments
        } else {
          return $rootScope.message(res.message, 'warning');
        }

      });
    };

    getAttachments();

    function getDataPoints() {
      var data = {key:'get'};
       api.datapoint.datapoint(data).then(function (d) {
        if(d && d.data.code == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } 
          $rootScope.message(d.data.message, 'error');
        } 
        else {
          if(d && d.data.data && d.data.data.length > 0){
            vm.dataPoints = d.data.data;

          // for (var i of vm.dataPoints) {
          //   if (i.type == 1) i.type = "Req";
          //   if (i.type == 2) i.type = "TextBox";
          //   if (i.type == 3) i.type = "Yes";
          // }
        }

        }
      });
    };

    getDataPoints();


    function deleteDataPoint(datapoint) {

      vm.datapoint_item.key = 'delete';

      vm.toDeleteDatapoint = datapoint;
      vm.title = 'Delete Datapoint Information';
      vm.warning = 'Warning: This can’t be undone';
      vm.description = "Please confirm you want to delete this <span class='link'>Datapoint</span><br>All of the contents will be deleted and can’t be recovered"
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false
      })
        .then(function () {
          confirmDeleteDatapoint();
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        })

    }

    function confirmDeleteDatapoint() {

      vm.isLoader = true;
      api.datapoint.datapoint({ key: "delete", id: vm.toDeleteDatapoint.id }).then(function (d) {
        vm.isLoader = false;
        if (d.data.code == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } 
          
          $rootScope.message(d.data.message, 'error');
          
        } else {

          vm.dataPoints.splice(vm.dataPoints.indexOf(vm.toDeleteDatapoint), 1);
          closeDialog();

          $rootScope.message('Data Point deleted successfully.', 'success');

        }
      });
    };

    function closeDialog() {

      $mdDialog.hide();
    }

    function DataPointDialog(what, datapoint, index){
      console.log('DataPointDialog', what, index);
      console.log('datapoint', datapoint);

      vm.datapoint_index_edit = index;
      vm.datapoint_item = {};
      

      if(datapoint){
        console.log('datapoint.type', datapoint.type)
        if (datapoint.type == 1) {
          vm.datapoint_item =
            {
              title: 'Checkbox',
              label: 'Checkbox Label'
            }
        } else if (datapoint.type == '2') {
          vm.datapoint_item =
            {
              title: 'Text Box',
              label: 'Name' }
        }
        else if (datapoint.type == '3') {
          vm.datapoint_item =
            {
              title: ' Y/N Checkboxes',
              label: ' Y/N Checkboxes Label'
             }
        }
     

        // vm.datapoint_item = datapoint
      vm.datapoint_item.item_type = datapoint.item_type;
      vm.datapoint_item.name = datapoint.name;
      vm.datapoint_item.info = datapoint.explanation;
      vm.datapoint_item.dataType = datapoint.type;
      vm.datapoint_item.id = datapoint.id;
      vm.datapoint_item.item_alert = datapoint.item_alert ;
      vm.datapoint_item.alert_sms = datapoint.alert_sms ;
      vm.datapoint_item.mobile = datapoint.mobile ;
      
    }else{
      vm.datapoint_item={}
      vm.datapoint_item.dataType = "4";
      vm.datapoint_item.label = "Name";
    }
      

      console.log('datapoint_item',vm.datapoint_item)
      

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/others/dialogs/others/data-point-add-edit-dialog.html',
        parent: angular.element($document.find('#checklist')),  
        clickOutsideToClose: true
      });

    }

    

    function saveDataPoint(val){

      
      
      vm.closeDialog();

      if( vm.datapoint_item.label) delete vm.datapoint_item.label;
      if( vm.datapoint_item.title) delete vm.datapoint_item.title;

      if(vm.datapoint_item.item_type == 'Req' || vm.datapoint_item.item_type == 'No') vm.datapoint_item.option= "applies";
      else vm.datapoint_item.option= "complies";

      if(vm.datapoint_item.id){
        delete vm.datapoint_item.label;
        delete vm.datapoint_item.title;

      //  if(vm.confirm_warning_DP == false) vm.datapoint_item.data_points_check = "yes";

      //  api_hit_datapoint({data_points_check: 'yes'});
      if(val == 'confirmUpdate'){
        vm.datapoint_item.data_points_check = "no";
        // UpdateViewForUpdatedDatapoint();
      }else vm.datapoint_item.data_points_check = "yes";
      

       vm.datapoint_item.key = 'update';

      //  if(vm.confirm_warning_DP == true){
      //     // editing diplaying data

      //  }  
        

      }else{
        if(vm.datapoint_item.item_type == 'Req' || vm.datapoint_item.item_type == 'Comp') vm.datapoint_item.dataType= "1";
        else if(vm.datapoint_item.item_type == 'Yes' || vm.datapoint_item.item_type == 'No') vm.datapoint_item.dataType= "3";
        else if( vm.datapoint_item.item_type == "Textbox") vm.datapoint_item.dataType= "2";
        else  vm.datapoint_item.dataType= "4";

        vm.datapoint_item.key = 'save';

       
      }

    
     
      api_hit_datapoint(vm.datapoint_item);
      console.log('saveDataPoint', vm.datapoint_item);

     


      // api.datapoint.datapoint(vm.datapoint_item).then(function (d) {
      //   if(d && d.data == '-1') {
      //     if (d.data.message == 'unauthorized access') {
      //       $state.go('app.logout');
      //     } 
      //   } 
      //   else {
         
      //     if(vm.confirm_warning_DP == false )  {
      //       vm.confirm_warning_DP = true;
      //     }else $rootScope.message(vm.datapoint_item.key=="update" ? 'Updated successfully' : 'Created successfully', 'success');

      //   }
      // });

      // dataType: 3
      // info: "reference"
      // item_alert: true
      // item_type: "yn"
      // name: "ee"
      // option: "applies"
      // order: 68
      // parentID: "1002"
      // type: "item"
    }

    function confirmEditWarning(){

      

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/others/dialogs/others/confirm-update-datapoint.html',
        parent: angular.element($document.find('#checklist')),
        clickOutsideToClose: true
      });
  
    }

    function api_hit_datapoint(req){

      console.log(req);

      api.datapoint.datapoint(req).then(function (d) {

     

        if(d && d.data.code == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } 

          $rootScope.message(d.data.message, 'error');
        } 
        else {
         

          if(vm.datapoint_item.key == "update"  && vm.datapoint_item.data_points_check == "yes")  {

        
            if(d.data.data.data_points_check == 'yes'){
              confirmEditWarning();
              vm.ChecklistUsingDatapoint = d.data.data.checklists_using;
            } 
            else {
              $rootScope.message('Updated successfully', 'success');
              // UpdateViewForUpdatedDatapoint();
              getDataPoints();
            }
            
          }else {
            $rootScope.message(vm.datapoint_item.key=="update" ? 'Updated successfully' : 'Created successfully', 'success');

            getDataPoints();
          }
        }
      });
    }

    function downloadAttachment(ev, location) {
      $window.open(location, '_blank');
    }
    vm.submenu = [
      { link: 'folders', title: 'Projects', active : false },
      { link: 'groups', title: 'Workflow', active : false },
      { link: 'checklist', title: 'Checklists', active : false },
      { link: 'templates', title: 'Templates', active : false },
      { link: 'other', title: 'Other', active : true },
      { link: 'archives', title: 'Archives', active : false }

    ];

    function sortBy(attachmentOrder) {
      vm.reverse = (vm.attachmentOrder === attachmentOrder) ? !vm.reverse : false;
      vm.attachmentOrder = attachmentOrder;
    };

        //Alert Cancel an close
        $scope.hide = function () {
          $mdDialog.hide();
        };
    
        $scope.cancel = function () {
          $mdDialog.cancel();
        };
    
        $scope.answer = function (answer) {
          $mdDialog.hide(answer);
        };


        // exceles Starts

        vm.excels= {


          all_spreadsheets: [],
          loading : false,
          viewing : false,
          progress: true,
    
          view : function(excel, index) {
    
    
            vm.excels.viewing = excel;
            vm.excels.viewing.id = index;
            vm.excels.success = false;
    
            vm.excels.viewing = false;

            for(var i in vm.all_spreadsheets){
              vm.all_spreadsheets[i].display = false;
            } 

            excel.display = true;
    
            // if(vm.origColspanLength == undefined || vm.origColspanLength < excel.data.heading.length){
            //   vm.origColspanLength = excel.data.heading.length ;
            //   if(vm.colspanLength < 4 )  vm.colspanLength = 2;
            //   else vm.colspanLength = vm.origColspanLength ;
            // }

            excel.data.heading.length

            vm.origColspanLength = excel.data.heading.length + 1;
    
            // 
    
            vm.excel_open_id = excel.id;
            
            vm.sub_excel_data = excel;
            
          },
    
          clear : function(excel) {
            vm.excels.viewing = false;
            excel.display = false;
            vm.origColspanLength = 1;
            }
    
        }

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

              for(var i in vm.all_spreadsheets){
                vm.all_spreadsheets[i].display = false;
              }
       
              vm.excels.progress = false;
            
            }
          });
        };
        getAllSpreadsheets();
    
    
        vm.total_active_users = function ($index) {
    
           vm.sub_excel = vm.all_spreadsheets[$index];
          return vm.sub_excel.data.length;
        }

        function uploadNewExcel(){
          $mdDialog.show({
            controller: function DialogController($scope, $mdDialog) {
              $scope.closeDialog = function () {
                $mdDialog.hide();
              }
            },
            scope: $scope,
            preserveScope: true,
            templateUrl: 'app/main/others/dialogs/others/upload-new-excel-dialog.html',
            parent: angular.element($document.find('#checklist')),  
            clickOutsideToClose: true
          });
        }

        function uploadSpreadsheet() {

          vm.isLoader = true;
          vm.closeDialog();
          
          var files = document.getElementById('spreadshet').files[0];
          var fd = new FormData();
          fd.append('file', files);
          var filedata = { name: vm.name, description: vm.description };
          fd.append('data', JSON.stringify(filedata));
        
    
          $http.post(BASEURL + 'organization-spreadsheet.php', fd,
            {
              headers: { 'Content-Type': undefined },
              cache: false
            }).error(function () {
              vm.isLoader = false;
              return $rootScope.message('Error', 'error');
            }).success(function (resp) {
              console.log('response',resp)
              vm.isLoader = false;
              if (resp.type == 'success') {
                getAllSpreadsheets();
                return $rootScope.message('Successfully upoaded', 'success');

              } else {
                console.log('server error while upoading file', resp);
                return $rootScope.message('server error while upoading file', 'error');
              }
              
             
              
            })
    
    
        }
        // exceles ends


        // function UpdateViewForUpdatedDatapoint(){
        //   console.log('ok');

        //   vm.dataPoints[vm.datapoint_index_edit].alert = vm.datapoint_item.item_alert;
        //   vm.dataPoints[vm.datapoint_index_edit].item_type = vm.datapoint_item.item_type;
        //   vm.dataPoints[vm.datapoint_index_edit].explanation = vm.datapoint_item.info;
        //   vm.dataPoints[vm.datapoint_index_edit].name = vm.datapoint_item.name;

        // }


  }
})();
