(function () {
  'use strict';

  angular
    .module('app.schedule')
    .controller('scheduleController', scheduleController)

  /** @ngInject */
  function scheduleController($rootScope, $window, api, $scope, $mdDialog, uiCalendarConfig) {
    var vm = this;
    vm.isLoader = false;
    vm.changeView = changeView;
    vm.changeScale = changeScale;
    vm.addRowDialog = addRowDialog;
    vm.saveRow = saveRow;
    vm.closeDialog = closeDialog;
    vm.ZoomOptions = ZoomOptions;
    vm.AddToScheduleDialog = AddToScheduleDialog;
    vm.SaveNewRow = SaveNewRow;
    vm.selectedView = 'Calendar';

    vm.adding_row = {};
    vm.adding_row.color = "#000";

    vm.displayDataAddToScheduler = false;
    vm.displayMoreDataAddToScheduler = displayMoreDataAddToScheduler;
    vm.saveScheduler = saveScheduler;
    vm.oepnAddEditSchedulerDialog = oepnAddEditSchedulerDialog;
    vm.deleteScheduler = deleteScheduler;
    vm.deleteConfirm = deleteConfirm;

    function getSchedulerByChek() {
      vm.newScheduler = {};
      vm.newScheduler.type = 'get';

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {

        console.log('ddddeee', d)

        if (d.data.type == 'success') {

          vm.item = d.data.data;

          $scope.eventSources = [{
            events: vm.item.item

          }];
          // $scope.eventSources = [{
          //   events: [{"title":"Alert Checklist Testing","color":"#ff0000","textColor":"#000000","allDay":false,"start":"2019-06-19 04:01","end":"2019-06-21 21:18", "url": "https://www.google.com"},{"title":"New check","color":null,"textColor":"#000000","allDay":true,"start":"2019-06-03 13:28","end":"2019-06-04 13:28"},{"title":"AAAAAAAAAAAAAAA22222222222229999llll","color":null,"textColor":"#000000","allDay":true,"start":"2019-06-19 13:28","end":"2019-06-20 13:28"},{"title":"Checklist for live notification count22ss","color":"#ffff00","textColor":"#000000","allDay":false,"start":"2019-06-21 12:59","end":"2019-07-25 14:47"},{"title":null,"color":"#ff0080","textColor":"#000000","allDay":false,"start":"2019-06-20 02:01","end":"2019-06-20 13:01"},{"title":null,"color":"#ff0080","textColor":"#000000","allDay":false,"start":"2019-06-20 02:01","end":"2019-06-20 13:01"},{"title":null,"color":"#ff0080","textColor":"#000000","allDay":false,"start":"2019-06-20 02:01","end":"2019-06-20 13:01"},{"title":"dfsfsdfds2222","color":"#ff0000","textColor":"#000000","allDay":false,"start":"2019-06-25 08:08","end":"2019-06-28 08:08"}]

          // }];


          /* config object */
          $scope.uiConfig = {
            calendar: {
              height: 520,
              editable: false,
              header: {
                left: '',
                center: 'prev title next',
                right: ''
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

    // for changing view of calendar
    $scope.changeCalendarView = function (view, calendar) {
      console.log('changeCalendarView', uiCalendarConfig);
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    // for changing view of gantt chart 
    function changeView(view) {
      console.log('changeView', view);

      if (view == 'Gantt') vm.selectedView = 'Gantt';
      else vm.selectedView = 'Calendar';
    }

    function changeScale(activeView, ganttScale, CalendarScale) {

      if (activeView == 'Calendar') {
        if (CalendarScale == 'today') {
          var date = new Date();
          uiCalendarConfig.calendars['myCalendar'].fullCalendar('gotoDate', date);
        } else uiCalendarConfig.calendars['myCalendar'].fullCalendar('changeView', CalendarScale);
      }
      else $scope.gantt_options.scale = ganttScale;

    }

    function addRowDialog() {


      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/schedules/dialogs/schedule-add-row.html',
        clickOutsideToClose: true
      });
    }

    function saveRow() {
      console.log('saveRow', vm.adding_row);

      $mdDialog.hide();

    }

    function closeDialog() {
      console.log('closeDialog');

      $mdDialog.hide();

    }

    function AddToScheduleDialog() {
      console.log('AddToScheduleDialog');

      var req_data = {
        type: 'structure'
      } ;

      vm.non_Checklist_input = '';

      api.checklists.getAddRowStructure().then(function (d) {
        console.log('ssssss', d)
        if (d.type == 'success') {

          console.log(d.data)
          vm.addToSch = d.data;

          $mdDialog.show({
            controller: function DialogController($scope, $mdDialog) {
              $scope.closeDialog = function () {
                $mdDialog.hide();
              }
            },
            scope: $scope,
            preserveScope: true,
            templateUrl: 'app/main/schedules/dialogs/dialog-add-to-schedule.html',
            clickOutsideToClose: true
          });
          // $rootScope.message(vm.item ? "Schedule updated successfully" : "New checklist schedule created successfully", 'success');
          // $mdDialog.hide();
        }

      });

      // vm.addToSch = [
      //   {
      //     project: {
      //       proj_name: 'Project 1',
      //       display: false,
      //       workflow: [
      //         {
      //           wf_name: 'workflow 1',
      //           checklist: [
      //             'check 1',
      //             'check 2',
      //             'check 3',
      //           ]
      //         },
      //         {
      //           wf_name: 'workflow 2',
      //           checklist: [
      //             'check 4',
      //             'check 5',
      //             'check 6',
      //           ]
      //         },

      //       ]
      //     }
      //   },
      //   {
      //     project: {
      //       proj_name: 'Project 2',
      //       display: false,
      //       workflow: [
      //         {
      //           wf_name: 'workflow 3',
      //           checklist: [
      //             'check 11',
      //             'check 21',
      //             'check 31',
      //           ]
      //         },
      //         {
      //           wf_name: 'workflow 4',
      //           checklist: [
      //             'check 41',
      //             'check 51',
      //             'check 61',
      //           ]
      //         }

      //       ]
      //     }
      //   }
      // ];

     

    }

    function SaveNewRow() {
      console.log('SaveNewRow');
    }


    vm.submenu = [
      { link: 'summary', title: 'Issues' },
      { link: '', title: 'Schedule' },
      { link: 'reports', title: 'Reports' },
      { link: 'dashboard', title: 'Dashboard' }
    ];


    setTimeout(function () {
      $('.Analyze').addClass('analyze');
    }, 800);


    $scope.data = [
      {
        id: '1', name: 'Milestones', height: '3em', color: '#45607D', tasks: [
          { name: 'Kickoff', color: '#93C47D', from: '2013-04-28 13:01', to: '2013-04-29T13:00:00Z', url: "https://www.google.com" },
          { name: 'Concept approval', color: '#93C47D', from: '2013-09-18 22:01', to: '2013-098-19 13:01', url: "https://www.yahoo.com" },
          { name: 'Development finished', color: '#93C47D', from: '2013-10-15 06:01', to: '2013-10-17 13:01', url: "https://www.google.com" }
        ]
      },
      {
        id: '2', name: 'Parent', color: '#93C47D', tasks: [
          { name: 'Kickoff', color: '#c6c6c6', from: '2013-04-28 13:01', to: '2013-04-29T13:00:00Z', url: "https://www.google.com" },
          { name: 'Concept approval', color: '#c6c6c6', from: '2013-09-18 13:01', to: '2013-09-18 22:01', url: "https://www.yahoo.com" },
          { name: 'Development finished', color: '#c6c6c6', from: '2013-10-13 18:01', to: '2013-10-15 13:01', url: "https://www.google.com" }
        ]
      },

      {
        id: '3', name: 'Football', parent: "2", tasks: [
          {
            name: 'Day 1', color: '#9FC5F8', from: '2013-05-07 13:01', to: '2013-11-07 13:01', url: "https://www.google.com"
          },
          {
            name: 'Day 2', color: '#9FC5F8', from: '2013-09-08 13:01', to: '2013-05-07 18:01', url: "https://www.google.com"
          },

        ]
      },

      {
        id: '4', name: 'Cricket', parent: "2", tasks: [
          {
            name: 'Day 3', color: '#9FC5F8', from: '2013-09-09 05:01', to: '2013-09-09 13:01', url: "https://www.google.com"
          }
        ]
      },

      {
        id: '5', name: 'Rcky Behl', parent: "3", tasks: [
          {
            name: 'Day 4', color: '#9FC5F8', from: '2013-09-09 11:01', to: '2013-10-09 13:01', url: "https://www.google.com"
          }
        ]
      },
    ];

    // $scope.data = [2013-04-28T13:00:00Z
    //   // Order is optional. If not specified it will be assigned automatically
    //   {
    //     name: 'Milestones', height: '3em', sortable: false, classes: 'gantt-row-milestone', color: '#45607D', tasks: [
    //       // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
    //       { name: 'Kickoff', color: '#93C47D', from: '2013-10-07T09:00:00', to: '2013-10-07T10:00:00', data: 'Can contain any custom data or object' , url:"https://www.google.com"},
    //       { name: 'Concept approval', color: '#93C47D', from: new Date(2013, 9, 18, 18, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0), est: new Date(2013, 9, 16, 7, 0, 0), lct: new Date(2013, 9, 19, 0, 0, 0) , url:"https://www.yahoo.com"},
    //       { name: 'Development finished', color: '#93C47D', from: new Date(2013, 10, 15, 18, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0) },
    //       { name: 'Shop is running', color: '#93C47D', from: new Date(2013, 10, 22, 12, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0) },
    //       { name: 'Go-live', color: '#93C47D', from: new Date(2013, 10, 29, 16, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0) }
    //     ], data: 'Can contain any custom data or object'
    //   },
    //   {
    //     name: 'Status meetings', tasks: [
    //       { name: 'Demo #1', color: '#9FC5F8', from: new Date(2013, 9, 25, 15, 0, 0), to: new Date(2013, 9, 25, 18, 30, 0) },
    //       { name: 'Demo #2', color: '#9FC5F8', from: new Date(2013, 10, 1, 15, 0, 0), to: new Date(2013, 10, 1, 18, 0, 0) },
    //       { name: 'Demo #3', color: '#9FC5F8', from: new Date(2013, 10, 8, 15, 0, 0), to: new Date(2013, 10, 8, 18, 0, 0) },
    //       { name: 'Demo #4', color: '#9FC5F8', from: new Date(2013, 10, 15, 15, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0) },
    //       { name: 'Demo #5', color: '#9FC5F8', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 24, 10, 0, 0) }
    //     ]
    //   },
    //   {
    //     name: 'Kickoff', movable: { allowResizing: false }, tasks: [
    //       {
    //         name: 'Day 1', color: '#9FC5F8', from: new Date(2013, 9, 7, 9, 0, 0), to: new Date(2013, 9, 7, 17, 0, 0),
    //         progress: { percent: 50, color: '#3C8CF8' }, movable: false
    //       },
    //       {
    //         name: 'Day 2', color: '#9FC5F8', from: new Date(2013, 9, 8, 9, 0, 0), to: new Date(2013, 9, 8, 17, 0, 0),
    //         progress: { percent: 100, color: '#3C8CF8' }
    //       },
    //       {
    //         name: 'Day 3', color: '#9FC5F8', from: new Date(2013, 9, 9, 8, 30, 0), to: new Date(2013, 9, 9, 12, 0, 0),
    //         progress: { percent: 100, color: '#3C8CF8' }
    //       }
    //     ]
    //   },
    //   {
    //     name: 'Create concept', tasks: [
    //       {
    //         name: 'Create concepttt', link:"https://www.google.com", content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}}', color: '#F1C232', from: new Date(2013, 9, 10, 8, 0, 0), to: new Date(2013, 9, 16, 18, 0, 0), est: new Date(2013, 9, 8, 8, 0, 0), lct: new Date(2013, 9, 18, 20, 0, 0),
    //         progress: 100
    //       }
    //     ]
    //   },
    //   {
    //     name: 'Finalize concept', tasks: [
    //       {
    //         name: 'Finalize concept', color: '#F1C232', from: new Date(2013, 9, 17, 8, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0),
    //         progress: 100
    //       }
    //     ]
    //   },
    //   { name: 'Development', children: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'], content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}' },
    //   {
    //     name: 'Sprint 1', tooltips: false, tasks: [
    //       { name: 'Product list view', color: '#F1C232', from: new Date(2013, 9, 21, 8, 0, 0), to: new Date(2013, 9, 25, 15, 0, 0) }
    //     ]
    //   },
    //   {
    //     name: 'Sprint 2', tasks: [
    //       { name: 'Order basket', color: '#F1C232', from: new Date(2013, 9, 28, 8, 0, 0), to: new Date(2013, 10, 1, 15, 0, 0) }
    //     ]
    //   },
    //   {
    //     name: 'Sprint 3', tasks: [
    //       { name: 'Checkout', color: '#F1C232', from: new Date(2013, 10, 4, 8, 0, 0), to: new Date(2013, 10, 8, 15, 0, 0) }
    //     ]
    //   },
    //   {
    //     name: 'Sprint 4', tasks: [
    //       { name: 'Login & Signup & Admin Views', color: '#F1C232', from: new Date(2013, 10, 11, 8, 0, 0), to: new Date(2013, 10, 15, 15, 0, 0) }
    //     ]
    //   },
    //   { name: 'Hosting' },
    //   {
    //     name: 'Setup', tasks: [
    //       { name: 'HW', color: '#F1C232', from: new Date(2013, 10, 18, 8, 0, 0), to: new Date(2013, 10, 18, 12, 0, 0) }
    //     ]
    //   },
    //   {
    //     name: 'Config', tasks: [
    //       { name: 'SW / DNS/ Backups', color: '#F1C232', from: new Date(2013, 10, 18, 12, 0, 0), to: new Date(2013, 10, 21, 18, 0, 0) }
    //     ]
    //   },
    //   { name: 'Server', parent: 'Hosting', children: ['Setup', 'Config'] },
    //   {
    //     name: 'Deployment', parent: 'Hosting', tasks: [
    //       { name: 'Depl. & Final testing', color: '#F1C232', from: new Date(2013, 10, 21, 8, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0), 'classes': 'gantt-task-deployment' }
    //     ]
    //   },
    //   {
    //     name: 'Workshop', tasks: [
    //       { name: 'On-side education', color: '#F1C232', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 25, 15, 0, 0) }
    //     ]
    //   },
    //   {
    //     name: 'Content', tasks: [
    //       { name: 'Supervise content creation', color: '#F1C232', from: new Date(2013, 10, 26, 9, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0) }
    //     ]
    //   },
    //   {
    //     name: 'Documentation', tasks: [
    //       { name: 'Technical/User documentation', color: '#F1C232', from: new Date(2013, 10, 26, 8, 0, 0), to: new Date(2013, 10, 28, 18, 0, 0) }
    //     ]
    //   }
    // ];


    $scope.getColumnWidth = function (widthEnabled, scale, zoom) {

      console.log('getColumnWidth', widthEnabled, scale, zoom)
      if (!widthEnabled) {
        return undefined;
      }

      if (scale.match(/.*?week.*?/)) {
        return 150 * zoom;
      }

      if (scale.match(/.*?month.*?/)) {
        return 300 * zoom;
      }

      if (scale.match(/.*?quarter.*?/)) {
        return 500 * zoom;
      }

      if (scale.match(/.*?year.*?/)) {
        return 800 * zoom;
      }

      return 40 * zoom;
    };




    $scope.gantt_options = {
      mode: 'custom',
      scale: 'day',
      sortMode: undefined,
      sideMode: 'TreeTable',
      daily: false,
      maxHeight: false,
      width: false,
      columnWidth: 20,
      // column_width:"this.scale == 'day' ? 40 : undefined",
      zoom: 1,
      columns: ['from', 'to'],
      treeTableColumns: ['from', 'to'],
      columnsHeaders: { 'model.name': 'Name', 'from': 'From', 'to': 'To' },
      columnsClasses: { 'model.name': 'gantt-column-name', 'from': 'gantt-column-from', 'to': 'gantt-column-to' },
      columnsFormatters: {
        'from': function (from) {
          return from !== undefined ? from.format('lll') : undefined;
        },
        'to': function (to) {
          return to !== undefined ? to.format('lll') : undefined;
        }
      },
      treeHeaderContent: '<i class="fa fa-align-justify"></i> {{getHeader()}}',
      columnsHeaderContents: {
        'model.name': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
        'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
        'to': '<i class="fa fa-calendar"></i> {{getHeader()}}'
      },
      autoExpand: 'none',
      taskOutOfRange: 'truncate',
      fromDate: moment(null),
      toDate: undefined,
      rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
      taskContent: '<i class="fa fa-tasks"></i> {{task.model.name}}',
      allowSideResizing: true,
      labelsEnabled: true,
      currentDate: 'line',
      currentDateValue: new Date(2013, 9, 23, 11, 20, 0),
      draw: false,
      readOnly: false,
      groupDisplayMode: 'group',
      filterTask: '',
      filterRow: '',
      timeFrames: {
        'day': {
          start: moment('8:00', 'HH:mm'),
          end: moment('20:00', 'HH:mm'),
          working: true,
          default: true
        },
        'noon': {
          start: moment('12:00', 'HH:mm'),
          end: moment('13:30', 'HH:mm'),
          working: false,
          default: true
        },
        'weekend': {
          working: false
        },
        'holiday': {
          working: false,
          color: 'red',
          classes: ['gantt-timeframe-holiday']
        }
      },
      dateFrames: {
        'weekend': {
          evaluator: function (date) {
            return date.isoWeekday() === 6 || date.isoWeekday() === 7;
          },
          targets: ['weekend']
        },
        '11-november': {
          evaluator: function (date) {
            return date.month() === 10 && date.date() === 11;
          },
          targets: ['holiday']
        }
      },
      timeFramesNonWorkingMode: 'visible',
      columnMagnet: '15 minutes',
      timeFramesMagnet: true,
      canDraw: function (event) {
        var isLeftMouseButton = event.button === 0 || event.button === 1;
        return $scope.options.draw && !$scope.options.readOnly && isLeftMouseButton;
      },
      drawTaskFactory: function () {
        return {
          id: utils.randomUuid(),  // Unique id of the task.
          name: 'Drawn task', // Name shown on top of each task.
          color: '#AA8833' // Color of the task in HEX format (Optional).
        };
      },
      api: function (api) {
        // API Object is used to control methods and events from angular-gantt.
        $scope.api = api;
        console.log("gantt api ")
        api.core.on.ready($scope, function () {
          // Log various events to console
          // api.scroll.on.scroll($scope, logScrollEvent);
          // api.core.on.ready($scope, logReadyEvent);

          // api.data.on.remove($scope, addEventName('data.on.remove', logDataEvent));
          // api.data.on.load($scope, addEventName('data.on.load', logDataEvent));
          // api.data.on.clear($scope, addEventName('data.on.clear', logDataEvent));

          // api.tasks.on.add($scope, addEventName('tasks.on.add', logTaskEvent));
          // api.tasks.on.change($scope, addEventName('tasks.on.change', logTaskEvent));
          // api.tasks.on.rowChange($scope, addEventName('tasks.on.rowChange', logTaskEvent));
          // api.tasks.on.remove($scope, addEventName('tasks.on.remove', logTaskEvent));

          // if (api.tasks.on.moveBegin) {
          //   api.tasks.on.moveBegin($scope, addEventName('tasks.on.moveBegin', logTaskEvent));
          //   //api.tasks.on.move($scope, addEventName('tasks.on.move', logTaskEvent));
          //   api.tasks.on.moveEnd($scope, addEventName('tasks.on.moveEnd', logTaskEvent));

          //   api.tasks.on.resizeBegin($scope, addEventName('tasks.on.resizeBegin', logTaskEvent));
          //   //api.tasks.on.resize($scope, addEventName('tasks.on.resize', logTaskEvent));
          //   api.tasks.on.resizeEnd($scope, addEventName('tasks.on.resizeEnd', logTaskEvent));
          // }

          // api.rows.on.add($scope, addEventName('rows.on.add', logRowEvent));
          // api.rows.on.change($scope, addEventName('rows.on.change', logRowEvent));
          // api.rows.on.move($scope, addEventName('rows.on.move', logRowEvent));
          // api.rows.on.remove($scope, addEventName('rows.on.remove', logRowEvent));

          // api.side.on.resizeBegin($scope, addEventName('labels.on.resizeBegin', logLabelsEvent));
          // //api.side.on.resize($scope, addEventName('labels.on.resize', logLabelsEvent));
          // api.side.on.resizeEnd($scope, addEventName('labels.on.resizeEnd', logLabelsEvent));

          // api.timespans.on.add($scope, addEventName('timespans.on.add', logTimespanEvent));
          // api.columns.on.generate($scope, logColumnsGenerateEvent);

          // api.rows.on.filter($scope, logRowsFilterEvent);
          // api.tasks.on.filter($scope, logTasksFilterEvent);

          // api.data.on.change($scope, function (newData) {
          //   if (dataToRemove === undefined) {
          //     dataToRemove = [
          //       { 'id': newData.data[2].id }, // Remove Kickoff row
          //       {
          //         'id': newData.data[0].id, 'tasks': [
          //           { 'id': newData.data[0].tasks[0].id },
          //           { 'id': newData.data[0].tasks[3].id }
          //         ]
          //       }, // Remove some Milestones
          //       {
          //         'id': newData.data[6].id, 'tasks': [
          //           { 'id': newData.data[6].tasks[0].id }
          //         ]
          //       } // Remove order basket from Sprint 2
          //     ];
          //   }
          // });



          // // When gantt is ready, load data.
          // // `data` attribute could have been used too.
          // $scope.load();

          // Add some DOM events
          // dName, dScope, dElement, dAttrs, dController,
          api.directives.on.new($scope, function (directiveName, directiveScope, element) {

            console.log("gantt api in")
            if (directiveName === 'ganttTask') {
              element.bind('click', function (event) {
                // console.log('click task', event)

                console.log('click url', directiveScope.task.model.url);
                var landingUrl = directiveScope.task.model.url;
                if (landingUrl) $window.location.href = landingUrl;
                // console.log('click element', element)
                // // event.stopPropagation();
                // logTaskEvent('task-click', directiveScope.task);
              });
              // element.bind('mousedown touchstart', function (event) {
              //   event.stopPropagation();
              //   $scope.live.row = directiveScope.task.row.model;
              //   if (directiveScope.task.originalModel !== undefined) {
              //     $scope.live.task = directiveScope.task.originalModel;
              //   } else {
              //     $scope.live.task = directiveScope.task.model;
              //   }
              //   $scope.$digest();
              // });
            }
            // else if (directiveName === 'ganttRow') {
            //   element.bind('click', function (event) {
            //     event.stopPropagation();
            //     console.log('click row')
            //     logRowEvent('row-click', directiveScope.row);
            //   });
            //   element.bind('mousedown touchstart', function (event) {
            //     event.stopPropagation();
            //     $scope.live.row = directiveScope.row.model;
            //     $scope.$digest();
            //   });
            // } else if (directiveName === 'ganttRowLabel') {
            //   element.bind('click', function () {
            //     console.log('click label')
            //     logRowEvent('row-label-click', directiveScope.row);
            //   });
            //   element.bind('mousedown touchstart', function () {
            //     $scope.live.row = directiveScope.row.model;
            //     $scope.$digest();
            //   });
            // }
          });

          // api.tasks.on.rowChange($scope, function (task) {
          //   $scope.live.row = task.row.model;
          // });

          // objectModel = new ObjectModel(api);
        });
      }
    };

    //setting columnwidth dynamically according zoom= $scope.gantt_options.zoom
    $scope.gantt_options.columnWidth = $scope.getColumnWidth(true, $scope.gantt_options.scale, $scope.gantt_options.zoom);

    //function callled on zooming in or out
    function ZoomOptions(value) {
      if (value == "plus") {

        $scope.gantt_options.zoom = $scope.gantt_options.zoom + 0.1;
        $scope.gantt_options.columnWidth = $scope.getColumnWidth(true, $scope.gantt_options.scale, $scope.gantt_options.zoom);

      } else if (value == "minus" && $scope.gantt_options.zoom > 0.15) {

        $scope.gantt_options.zoom = $scope.gantt_options.zoom - 0.1;
        $scope.gantt_options.columnWidth = $scope.getColumnWidth(true, $scope.gantt_options.scale, $scope.gantt_options.zoom);

      }
    }

    //display workflows and checklist with respect to clicked project in add to chedule popup 
    function displayMoreDataAddToScheduler(action, index){
      console.log('displayMoreDataAddToScheduler', action, index);

      if (vm.displayDataAddToScheduler && vm.addToSch[index].display){
   
       vm.addToSch[index].display = false;

      }else {

        vm.displayDataAddToScheduler = true;
        vm.addToSch[index].display = true;
       
      }

    }

    function oepnAddEditSchedulerDialog(id ,item_type, proj_name, workflow_name, checklist_name){

      
     
      if(item_type == 'checklist') 
   
      vm.closeDialog();

      vm.newScheduler={};

     
      if(item_type == 'workflow' || item_type == 'checklist')  {
        vm.newScheduler.workflow_name=workflow_name;
        vm.newScheduler.project_name = proj_name;

        vm.newScheduler.item_type = item_type;

        vm.display_breadcrumb = proj_name + ' -- ' + workflow_name ;

        if (item_type == 'checklist') {
          vm.newScheduler.checklist_name=checklist_name;
          vm.display_breadcrumb = vm.display_breadcrumb + ' -- ' +  checklist_name;
        } 
      }else{
        vm.display_breadcrumb = vm.non_Checklist_input;
        vm.newScheduler.item_type = vm.non_Checklist_input;

      }

      
      vm.newScheduler.item_type_id = id;
      vm.newScheduler.type = 'get';

      console.log('vm.newScheduler', vm.newScheduler)

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        console.log('dddd', d)
        if (d.data.type == 'success') {

         
        
          vm.item = d.data.data.item;
          console.log(' vm.item ',  vm.item )
          if (vm.item) {
            vm.newScheduler.from_date = new Date(vm.item.from_date);
            vm.newScheduler.to_date = new Date(vm.item.to_date);
            vm.newScheduler.gantt_row = vm.item.gantt_chat;
            vm.newScheduler.color = vm.item.color;
            vm.newScheduler.all_day = vm.item.all_day == 1 ? true : false;
            vm.newScheduler.repeat = vm.item.repeat;
            vm.newScheduler.start_time = new Date(vm.item.start_time);
            vm.newScheduler.end_time = new Date(vm.item.end_time);
            vm.newScheduler.end = vm.item.end;
            vm.newScheduler.id = vm.item.id;
          }

          $mdDialog.show({
            controller: function DialogController($scope, $mdDialog) {
              $scope.closeDialog = function () {
                $mdDialog.hide();
              }
            },
            scope: $scope,
            preserveScope: true,
            templateUrl: 'app/main/schedules/dialogs/scheduler-add-edit-dialog.html',
            clickOutsideToClose: true
          });

        }
      })

      


     
      console.log('vm.newScheduler', vm.newScheduler)
      console.log('vm.display_breadcrumb', vm.display_breadcrumb)

      console.log('oepnAddEditSchedulerDialog');
     

     


    }

    function saveScheduler() {
      console.log(saveScheduler)
      // vm.newScheduler.checklist_id = vm.idCHK;
      // vm.newScheduler.checklist_name = vm.checklists[0].name;
      // vm.newScheduler.workflow_name = vm.checklists[0].item_bread.folder_name;
      // vm.newScheduler.project_name = vm.checklists[0].item_bread.project_name;
      vm.newScheduler.id = vm.item ? vm.item.id : '';
      vm.newScheduler.type = vm.item ? 'update' : 'save';

      console.log('vm.newScheduler', vm.newScheduler)

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message(vm.item ? "Schedule updated successfully" : "New checklist schedule created successfully", 'success');
          $mdDialog.hide();
        }

      });

    };

    function deleteScheduler(id) {
      vm.newScheduler = {};
      vm.newScheduler.type = 'delete';
      vm.newScheduler.item_id = id;
      vm.closeDialog();

      console.log("deleteScheduler", id)
      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message("Schedule deleted successfully", 'success');

        }

      });
    }


    function deleteConfirm(what, item, ev) {

      

        if(vm.newScheduler.item_type == 'workflow' )  {
          var schedulerName = vm.newScheduler.worflow_name;
        }else if (vm.newScheduler.item_type == 'checklist') {
          var schedulerName = vm.newScheduler.checklist_name;
        }else{
          var schedulerName = vm.non_Checklist_input;
        }

        item.name = schedulerName + " Scheduler"; 
     

      vm.title = 'Delete Scheduler';
      vm.warning = 'Warning: This can’t be undone';
      vm.description = "Please confirm you want to delete this <span class='link'>" + item.name + "</span><br>All of the contents will be deleted and can’t be recovered"

     

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        targetEvent: what,
        clickOutsideToClose: false
      })
        .then(function (type) {
          vm.deleteScheduler( item.id);
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        })

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


  }

})();
