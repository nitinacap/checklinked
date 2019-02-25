(function () {
  'use strict';

  angular
    .module('app.notification')
    .controller('NotificationController', NotificationController)

  /** @ngInject */
  function NotificationController($cookies,$http,api) {

    var vm = this;

    // Content sub menu
    vm.submenu = [
      { link: '#', title: 'Alerts' },
      { link: 'invitations', title: 'Action Items' },
      { link: 'chat.message', title: 'Messages' },
      { link: '', title: 'Notifications' }

    ];

    function getUserNotification() {
     return api.notifications.get($cookies.get('token')).success(function (resp) {
        if (resp) {
          vm.notifications = resp.notifications;
          vm.closeList = false;

        }
      }).error(function (resp) {
  
      })
    };
    vm.totUsers = totUsers;
    vm.projectList = projectList;
    vm.notificationList = notificationList;
    vm.notificationDate = notificationDate;
    vm.closeList = true;
    vm.chk_changes = [];
    vm.unixtimestamp = []

    function totUsers(item){
      vm.chk_changes.push(Object.keys(item).length - 1);
    }

    function projectList(list,detail){
      vm.closeList = true;
      vm.projectlists = detail;
   
      vm.checklistDetail = Object.keys(list).map(function(it) { 
        return list[it]
     })
     
    };

    function notificationList(){
      vm.closeList = false;
    }
    function notificationDate(item){
      if(item!=='undefined' || item!==undefined){
       vm.unixtimestamp.push((new Date(item.replace('-','/'))).getTime());

      }
    }
  
    getUserNotification();


  }


})();
