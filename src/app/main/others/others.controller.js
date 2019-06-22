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

    vm.sortBy = sortBy;
    vm.propertyName = '';
    vm.reverse = true;


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
          } else {
          }
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
     

      
      vm.datapoint_item.item_type = datapoint.item_type;
      vm.datapoint_item.name = datapoint.name;
      vm.datapoint_item.info = datapoint.explanation;
      vm.datapoint_item.dataType = datapoint.type;
      vm.datapoint_item.id = datapoint.id;
      vm.datapoint_item.item_alert = datapoint.alert ? true : false;
      
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

    

    function saveDataPoint(){
      
      vm.closeDialog();

      if( vm.datapoint_item.label) delete vm.datapoint_item.label;
      if( vm.datapoint_item.title) delete vm.datapoint_item.title;

      if(vm.datapoint_item.item_type == 'Req' || vm.datapoint_item.item_type == 'No') vm.datapoint_item.option= "applies";
      else vm.datapoint_item.option= "complies";

      if(vm.datapoint_item.id){
        delete vm.datapoint_item.label;
        delete vm.datapoint_item.title;

       vm.datapoint_item.key = 'update';

       
        // editing diplaying data
       vm.dataPoints[vm.datapoint_index_edit].alert = vm.datapoint_item.item_alert;
       vm.dataPoints[vm.datapoint_index_edit].item_type = vm.datapoint_item.item_type;
       vm.dataPoints[vm.datapoint_index_edit].explanation = vm.datapoint_item.info;
       vm.dataPoints[vm.datapoint_index_edit].name = vm.datapoint_item.name;

      }else{
        if(vm.datapoint_item.item_type == 'Req' || vm.datapoint_item.item_type == 'Comp') vm.datapoint_item.dataType= "1";
        if(vm.datapoint_item.item_type == 'Yes' || vm.datapoint_item.item_type == 'No') vm.datapoint_item.dataType= "3";
        else vm.datapoint_item.dataType= "2";

        vm.datapoint_item.key = 'save';
      }

     


      console.log('saveDataPoint', vm.datapoint_item);


      api.datapoint.datapoint(vm.datapoint_item).then(function (d) {
        if(d && d.data == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } 
        } 
        else {
         

          $rootScope.message(vm.datapoint_item.key=="update" ? 'Updated successfully' : 'Created successfully', 'success');

        }
      });

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

    function downloadAttachment(ev, location) {
      $window.open(location, '_blank');
    }
    vm.submenu = [
      { link: 'folders', title: 'Projects' },
      { link: 'groups', title: 'Workflow' },
      { link: 'checklist', title: 'Checklists' },
      { link: 'templates', title: 'Templates' },
      { link: '', title: 'Other' },
      { link: 'archives', title: 'Archives' }

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


  }
})();
