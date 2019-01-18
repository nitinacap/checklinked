(function () {

  'use strict';

  angular
    .module('app.archives')
    .controller('ArchivesController', ArchivesController);

  /** @ngInject */
  function ArchivesController($mdSidenav, $http, $scope, $rootScope) {
    var vm = this;
    vm.isLoader = true

    $scope.getArchieves = function() {
      $http.get(BASEURL + "archive-action-get.php")
        .success(function (res) {
          vm.isLoader = false;
          if (res.type == 'success') {
            vm.archives = res.archives;

          } else {
            vm.archives = res.archives;
           // return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found to get archieves');
        })
    }
    $scope.getArchieves();


    vm.deleteArchivesDialog = deleteArchivesDialog;
    vm.restoreArchive = restoreArchive;

    function deleteArchivesDialog(id){
      vm.isLoader = true;
      $http.get(BASEURL + "archive-action-get.php?action=delete&id=" + id)
        .success(function (res) {
          vm.isLoader = false;
          if (res.type == 'success') {
            $scope.getArchieves();  
            vm.archives = resp;

          } else {
            return $rootScope.message(res.message, 'warning');

          }

        }).error(function (err) {
          console.log('Error found to get archieves');
        })
    };

    function restoreArchive(id,type){
      $http.get(BASEURL + "archive-action-get.php?action=restore&type=" + type + "&" + "id=" + id)
      .success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          $scope.getArchieves();  
          return $rootScope.message(res.message, 'success');
        

        } else {
          return $rootScope.message(res.message, 'warning');
        }

      }).error(function (err) {
        console.log('Error found to get archieves');
      })
    }

    //Restore confirmation

    vm.restoreConfirmation = restoreConfirmation;

    function restoreConfirmation(id, type) {
      var confirm = $mdDialog.confirm()
        .title('Are you sure to restore this archive')
        .htmlContent('This action cannot be undone.')
        .ariaLabel('delete')
        .targetEvent(ev)
        .ok('OK')
        .cancel('CANCEL');

      $mdDialog.show(confirm).then(function () {
        restoreArchive(id, type);
      }, function () {
        openOrgInfoDialog(event, $rootScope.user);
      });
    }

    /* Side Navigation Methods */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    vm.submenu = [
      { link: 'folders', title: 'Projects' },
      { link: 'groups', title: 'Workflow' },
      { link: 'checklist', title: 'Checklists' },
      { link: 'templates', title: 'Templates' },
      { link: 'other', title: 'Other' },
      { link: '', title: 'Archives' }
    ];

  }

})();
