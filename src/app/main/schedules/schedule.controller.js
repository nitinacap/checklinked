(function () {
  'use strict';

  angular
    .module('app.schedule')
    .controller('scheduleController', scheduleController)

  /** @ngInject */
  function scheduleController($rootScope, api, $scope) {
    var vm = this;
    vm.isLoader = false;
    vm.openSchedulePopup = openSchedulePopup;

    function openSchedulePopup(){
      
    }
    $scope.eventSources = {
      events: [
        {
          title: 'Metting with Rajesh',
          start: '2019-03-24',
          color: 'red',   // an option!
          textColor: 'white' // an option!
        },
        {
          title: 'Metting with Zontec',
          start: '2019-03-25 15:30:00',
          color: 'yellow',   // an option!
        },
        {
          title: 'Rajesh with Zontec',
          start: '2019-03-25 15:30:00',
          color: 'yellow',   // an option!
          textColor: 'white' // an option!
        },
        // etc...
      ],
     
    };

    /* config object */
    $scope.uiConfig = {
      calendar: {
        height: 520,
        editable: true,
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


    vm.submenu = [
        { link: 'issue', title: 'Issues' },
        { link: 'schedule', title: 'Schedule' },
        { link: '#', title: 'Reports' },
        { link: 'dashboard', title: 'Dashboard' }
      ];



    }

  }) ();
