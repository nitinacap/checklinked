(function () {
  'use strict';

  angular
    .module('app.other')
    .controller('OthersController', OthersController);

  /** @ngInject */
  function OthersController($rootScope, $state, $cookies, $stateParams, $scope, $mdSidenav,  $window, $mdDialog, $document, api, $http, $filter) {
    var vm = this;
   // vm.user_id = $cookies.get('useridCON');
   vm.isLoader = true;

   vm.getAttachments  = getAttachments;
   vm.downloadAttachment = downloadAttachment;
   vm.attachmentOrder = '';
   vm.attachmentDescending = false;
   function getAttachments(){
    $http.get(BASEURL + 'user-attachment.php?user_id=' + $cookies.get('useridCON'), {
      cache: false
    }).success(function (res) {
      vm.isLoader = false;
      if(res.type=='success'){
        vm.attachments = res.attachments
      }else{
        return $rootScope.message(res.message, 'warning');
      }
     
    });
   };

   getAttachments();

// $scope.breadcrum = function breadcrum(type){
//   if(type=='checklists'){
//     vm.breadcrum = 'Project - Workflow - checklist';
//   }
//   if(type=='headings'){
//     vm.breadcrum = 'Project - Workflow - checklist - headings';
//   }
//   if(type=='sections'){
//     vm.breadcrum = 'Project - Workflow - checklist - sections';
//   }
//   if(type=='items'){
//     vm.breadcrum = 'Project - Workflow - checklist - sections - line';
//   }
 
// }
    // Content sub menu

    function downloadAttachment(ev, location) {
      //$window.location.href = (location);
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
    vm.sortBy = sortBy;
   vm.propertyName = '';
   vm.reverse = true;
    function sortBy(attachmentOrder) {
      vm.reverse = (vm.attachmentOrder === attachmentOrder) ? !vm.reverse : false;
      vm.attachmentOrder = attachmentOrder;
    };


  }
})();
