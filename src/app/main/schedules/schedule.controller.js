(function () {
  'use strict';

  angular
    .module('app.schedule')
    .controller('scheduleController', scheduleController)

  /** @ngInject */
  function scheduleController($rootScope, api, $scope) {
    var vm = this;
    vm.isLoader = false;
    //vm.openSchedulePopup = openSchedulePopup;



    function getSchedulerByChek() {
      vm.newScheduler = {};
      vm.newScheduler.type = 'get';
      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          vm.item = d.data.data;

          $scope.eventSources = {
            events: vm.item,

          };
         // start: '2019-03-25 15:30:00',


    /* config object */
    $scope.uiConfig = {
      calendar: {
        height: 520,
        editable: false,
        header: {
          left: 'month basicWeek basicDay agendaWeek agendaDay',
          center: 'title',
          right: 'today prev,next'
        },
        dayClick: $scope.alertEventOnClick,
        eventDrop: $scope.alertOnDrop,
        eventResize: $scope.alertOnResize
      }
    }


        }
      })
    };

    getSchedulerByChek();





    vm.submenu = [
      { link: 'summary', title: 'Issues' },
      { link: '', title: 'Schedule' },
      { link: '#', title: 'Reports' },
      { link: 'dashboard', title: 'Dashboard' }
    ];


    setTimeout(function () {
      $('.Analyze').addClass('analyze');
    }, 800);



  }

})();
