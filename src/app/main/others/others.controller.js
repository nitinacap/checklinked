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

      var data = {type:'get'};
      return api.datapoint.get(data).then(function (d) {
        if (d.data.code == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } else {
          }
        } else {
          vm.dataPoints = d.data.data;
          for (var i of vm.dataPoints) {
            if (i.type == 1) i.type = "Req";
            if (i.type == 2) i.type = "TextBox";
            if (i.type == 3) i.type = "Yes";
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
      api.datapoint.get({ type: "delete", id: vm.toDeleteDatapoint.id }).then(function (d) {
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
