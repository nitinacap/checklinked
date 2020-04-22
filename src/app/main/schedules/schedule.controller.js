(function () {
  'use strict';

  angular
    .module('app.schedule')
    .controller('scheduleController', scheduleController)

  /** @ngInject */
  function scheduleController($rootScope, $window, api, $scope, $mdDialog, uiCalendarConfig, moment) {
    var vm = this;
    // vm.isLoader = false;
    vm.changeView = changeView;
    vm.changeScale = changeScale;
    vm.addRowDialog = addRowDialog;
    vm.saveRow = saveRow;
    vm.closeDialog = closeDialog;
    vm.ZoomOptions = ZoomOptions;
    vm.AddToScheduleDialog = AddToScheduleDialog;
    vm.GetAllRows = GetAllRows;
    vm.changeViewMode = changeViewMode;
    vm.selectedView = 'Calendar';
    vm.selectedModeOfView = 'Individual';
    vm.Alreadyclicked = false ;
    vm.ondatechange = false;
    // vm.showLoadingImage = true;
    vm.isLoader = true;

    // vm.adding_row = {};
    // vm.adding_row.color = "#000";

    vm.displayDataAddToScheduler = false;
    vm.displayMoreDataAddToScheduler = displayMoreDataAddToScheduler;
    vm.saveScheduler = saveScheduler;
    vm.oepnAddEditSchedulerDialog = oepnAddEditSchedulerDialog;
    vm.deleteScheduler = deleteScheduler;
    vm.deleteConfirm = deleteConfirm;

    vm.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // // 

    function getSchedulerByChek() {
      vm.newScheduler = {};
      vm.newScheduler.type = 'get';
      vm.newScheduler.timezone = vm.timezone;



      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {

        console.log('ddddeee', d)
        debugger;

        if (d.data.type == 'success') {

          vm.item = d.data.data;

          $scope.calendarIndividualevents = [{
            events: vm.item.calendar_individual

          }];

         

          $scope.calendarTeamevents = [{
            events: vm.item.calendar_team

          }];

          // $scope.eventSources = [{
          //   events: [{"title":"Alert Checklist Testing","color":"#ff0000","textColor":"#000000","allDay":false,"start":"2019-08-09T18:30:00.000Z","end":"2019-08-19T18:30:00.000Z", "url": "https://www.google.com"},{"title":"New check","color":null,"textColor":"#000000","allDay":true,"start":"2019-06-03 13:28","end":"2019-06-04 13:28"},{"title":"AAAAAAAAAAAAAAA22222222222229999llll","color":null,"textColor":"#000000","allDay":true,"start":"2019-06-19 13:28","end":"2019-06-20 13:28"},{"title":"Checklist for live notification count22ss","color":"#ffff00","textColor":"#000000","allDay":false,"start":"2019-06-21 12:59","end":"2019-07-25 14:47"},{"title":null,"color":"#ff0080","textColor":"#000000","allDay":false,"start":"2019-06-20 02:01","end":"2019-06-20 13:01"},{"title":null,"color":"#ff0080","textColor":"#000000","allDay":false,"start":"2019-06-20 02:01","end":"2019-06-20 13:01"},{"title":null,"color":"#ff0080","textColor":"#000000","allDay":false,"start":"2019-06-20 02:01","end":"2019-06-20 13:01"},{"title":"dfsfsdfds2222","color":"#ff0000","textColor":"#000000","allDay":false,"start":"2019-06-25 08:08","end":"2019-06-28 08:08"}]

          // }];

          // var june = moment("2014-06-01T12:00:00Z");
          // june.tz(vm.timezone).format('YYYY-MM-DD HH:MM');
                
          
          // // 
          /* config object */
          $scope.uiConfig = {
            calendar: {
              height: "100%",
              editable: false,
              header: {
                left: '',
                center: 'prev title next',
                right: ''
              },
              // dayClick: $scope.alertEventOnClick,
              // eventDrop: $scope.alertOnDrop,
              // eventResize: $scope.alertOnResize
            }
          }


          $scope.ganttIndividualData = vm.item.gantt_individual;
          // $scope.ganttTeamData = vm.item.gantt_individual;
          $scope.ganttTeamData = vm.item.gantt_team;
        

          
        }
        // vm.showLoadingImage = false;
        vm.isLoader = false;
      })
    };

    getSchedulerByChek();


    // for changing view of calendar
    $scope.changeCalendarView = function (view, calendar) {
debugger;

      console.log('changeCalendarView', uiCalendarConfig);
      uiCalendarConfig.calendars[calendar].fullCalendar('changeView', view);
    };

    // for changing view from calendar to gantt chart and vice versa
    function changeView(view) {
      console.log('changeView', view);

      if (view == 'Gantt')  vm.selectedView = 'Gantt';
      else  vm.selectedView = 'Calendar'; 
      
    }

    // for changing mode of the above view 
    function changeViewMode(mode) {
      console.log('changeViewMode', mode);

      console.log('vm.selectedView', vm.selectedView)
      

      if (mode == 'Individual'){

        vm.selectedModeOfView = 'Individual';

        // if(vm.selectedView == 'Gantt'){
        //   $scope.data = vm.item.gantt_team;
        //   console.log('in Individual gantt')
        // }else{
        //   $scope.eventSources = [{
        //     events: vm.item.calendar_individual

        //   }];

        //   console.log('in Individual calendar')
        // }
      }else {

        vm.selectedModeOfView = 'Team';
        
        // if(vm.selectedView == 'Gantt'){
        //   $scope.data = vm.item.gantt_individual;
        //   console.log('in team gantt')
        // }else{
        //   $scope.eventSources = [{
        //     events: vm.item.calendar_team
  
        //   }];
        //   console.log('in team calendar')
        // }
      }

      console.log('vm.selectedModeOfView', vm.selectedModeOfView)
      
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

      vm.adding_row = {};
      vm.adding_row.color = "#ffffff";

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
      vm.isLoader = true;
      var data = {
        type: "saveRow",
        rowName: vm.adding_row.name,
        ParentRowName: vm.adding_row.parent,
        color: vm.adding_row.color
      }

      api.checklists.NewScheduler(data).then(function (d) {
        console.log('dddd', d)
        if (d.data.type == 'success') {
          $rootScope.message('Row successfully saved', 'success');
          getSchedulerByChek();
          GetAllRows();
        }

        vm.isLoader = false;
      })

    }

    function closeDialog() {
      console.log('closeDialog');

      $mdDialog.hide();

    }

    function AddToScheduleDialog() {
      console.log('AddToScheduleDialog');
      // vm.showLoadingImage = true;
      vm.isLoader = true;

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

          // vm.showLoadingImage = false;
          vm.isLoader = false;
        }

      });

      $scope.dateChangeEvent = function(){
        console.log('dateChangeEvent')
        if(vm.single_item) vm.ondatechange = true;
        

      }

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
    $scope.ctrl ={

    }

    function GetAllRows() {
      console.log('GetAllRows');



      api.checklists.NewScheduler({type: "getRow"}).then(function (res) {
        console.log('get rows res', res)
        
        if (res.data.type == 'success') {
          vm.AllRows = res.data.data;
          
        }

      
      })

    }

    GetAllRows();


    vm.submenu = [
      { link: 'summary', title: 'Issues', active : false },
      { link: 'schedule', title: 'Schedule', active : true },
      { link: 'reports', title: 'Reports', active : false },
      { link: 'dashboard', title: 'Dashboard', active : false }
    ];


    setTimeout(function () {
      $('.Analyze').addClass('analyze');
    }, 800);




    $scope.getColumnWidth = function (widthEnabled, scale, zoom) {

      console.log('getColumnWidth', widthEnabled, scale, zoom)
      if (!widthEnabled) {
        return undefined;
      }

      // // 

      if (scale.match(/.*?week.*?/)) {
        return 150 * zoom;
      }

      if (scale.match(/.*?month.*?/)) {
        // // 
        return 150 * zoom;
      }

      if (scale.match(/.*?quarter.*?/)) {
        return 150 * zoom;
      }

      if (scale.match(/.*?year.*?/)) {
        return 150 * zoom;
      }
      // // 

      return 150 * zoom;
    };




    $scope.gantt_options = {
      mode: 'custom',
      scale: 'day',
      sortMode: undefined,
      sideMode: 'TreeTable',
      daily: false,
      maxHeight: false,
      width: true,
      columnWidth: 20,
      headers : {'model.name': 'Process'},
      // column_width:"this.scale == 'day' ? 40 : undefined",
      zoom: 1,
      columns: ['Process'],
      // columns: ['from', 'to'],
      treeTableColumns: ['Process'],
      columnsHeaders: {
        'model.name': 'Process'
        },
      // columnsHeaders: { 'model.name': 'Process ', 'from': 'From', 'to': 'To' },
      // columnsClasses: { 'model.name': 'gantt-column-name', 'from': 'gantt-column-from', 'to': 'gantt-column-to' },
      // columnsFormatters: {
      //   'from': function (from) {
      //     return from !== undefined ? from.format('lll') : undefined;
      //   },
      //   'to': function (to) {
      //     return to !== undefined ? to.format('lll') : undefined;
      //   }
      // },
      // treeHeaderContent: '<i class="fa fa-align-justify"></i> {{getHeader()}}',
      // columnsHeaderContents: {
      //   'Process': '<i class="fa fa-align-justify"></i> {{getHeader()}}',
      //   // 'from': '<i class="fa fa-calendar"></i> {{getHeader()}}',
      //   // 'to': '<i class="fa fa-calendar"></i> {{getHeader()}}'
      // },
      autoExpand: 'none',
      taskOutOfRange: 'truncate',
      fromDate: moment(null),
      toDate: undefined,
      rowContent: '<i class="fa fa-align-justify"></i> {{row.model.name}}',
      taskContent: '<i class="fa fa-tasks"></i> {{task.model.name}}',
      allowSideResizing: true,
      labelsEnabled: true,
      currentDate: 'line',
      labelsheaders : ['Process'],
      // currentDateValue: new Date(2013, 9, 23, 11, 20, 0),
      draw: false,
      readOnly: false,
      groupDisplayMode: 'group',
      filterTask: '',
      filterRow: '',
      // timeFrames: {
      //   'day': {
      //     start: moment('8:00', 'HH:mm'),
      //     end: moment('20:00', 'HH:mm'),
      //     working: true,
      //     default: true
      //   },
      //   'noon': {
      //     start: moment('12:00', 'HH:mm'),
      //     end: moment('13:30', 'HH:mm'),
      //     working: false,
      //     default: true
      //   },
      //   'weekend': {
      //     working: false
      //   },
      //   'holiday': {
      //     working: false,
      //     color: 'red',
      //     classes: ['gantt-timeframe-holiday']
      //   }
      // },
      // dateFrames: {
      //   'weekend': {
      //     evaluator: function (date) {
      //       return date.isoWeekday() === 6 || date.isoWeekday() === 7;
      //     },
      //     targets: ['weekend']
      //   },
      //   '11-november': {
      //     evaluator: function (date) {
      //       return date.month() === 10 && date.date() === 11;
      //     },
      //     targets: ['holiday']
      //   }
      // },
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

      vm.isLoader = true;
debugger;
      
     
      // if(item_type == 'checklist') 
   
      

      vm.newScheduler={};

     
      if(item_type == 'workflow' || item_type == 'checklist')  {
        vm.newScheduler.workflow_name=workflow_name;
        vm.newScheduler.project_name = proj_name;

        vm.newScheduler.title = workflow_name;

        vm.newScheduler.item_type = item_type;

        vm.display_breadcrumb = proj_name + ' -- ' + workflow_name ;

        // vm.newScheduler.url = 'https://checklinked.azurewebsites.net/checklist/'+ id;

        if (item_type == 'checklist') {
          vm.newScheduler.checklist_name=checklist_name;
          vm.newScheduler.title = checklist_name;
          vm.display_breadcrumb = vm.display_breadcrumb + ' -- ' +  checklist_name;
          // vm.newScheduler.url = 'https://checklinked.azurewebsites.net/checklist/detail/'+ id
         
        } 
      }else{
        if(vm.non_Checklist_input){
          vm.newScheduler.url = '';
          vm.newScheduler.title = vm.display_breadcrumb = vm.non_Checklist_input;
          vm.newScheduler.item_type = vm.non_Checklist_input;
        }else{
          
          $rootScope.message('Please give name to Non-Checklist event to continue.', 'error');
          return false;
          
        }
        

      }
      vm.closeDialog();
      
      vm.newScheduler.item_type_id = id;
      vm.newScheduler.type = 'get';

      console.log('vm.newScheduler', vm.newScheduler)

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        console.log('dddd', d)
        if (d.data.type == 'success') {

         
          
          vm.single_item = d.data.data.item;
          console.log(' vm.single_item ',  vm.single_item )
          if (vm.single_item) {
            vm.newScheduler.from_date = new Date(vm.single_item.from_date);
            vm.newScheduler.to_date = new Date(vm.single_item.to_date);
            vm.newScheduler.gantt_row = vm.single_item.gantt_chat;
            vm.newScheduler.color = vm.single_item.color;
            vm.newScheduler.all_day = vm.single_item.all_day == 1 ? true : false;
            vm.newScheduler.repeat = vm.single_item.repeat;
            vm.newScheduler.start_time = new Date(vm.single_item.start_time);
            vm.newScheduler.end_time = new Date(vm.single_item.end_time);
            vm.newScheduler.end = vm.single_item.end;
            vm.newScheduler.id = vm.single_item.id;
            vm.newScheduler.item_type_id = vm.single_item.item_type_id;
debugger

            // 
            if(vm.newScheduler.item_type == 'workflow') vm.newScheduler.url = 'https://checklinked.azurewebsites.net/checklist/'+ vm.single_item.item_type_id;
            else if(vm.newScheduler.item_type == 'checklist')  vm.newScheduler.url = 'https://checklinked.azurewebsites.net/checklist/detail/'+ vm.single_item.item_type_id
           // 
          }else{
            vm.newScheduler.color = '#ffffff';
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

        vm.isLoader = false;
      })

      


     
      console.log('vm.newScheduler', vm.newScheduler)
      console.log('vm.display_breadcrumb', vm.display_breadcrumb)

      console.log('oepnAddEditSchedulerDialog');
     

     


    }

    function saveScheduler(id) {
      vm.newScheduler.item_type
      // 
      vm.Alreadyclicked = true;
      // console.log(saveScheduler)
      // vm.newScheduler.checklist_id = vm.idCHK;
      // vm.newScheduler.checklist_name = vm.checklists[0].name;
      // vm.newScheduler.workflow_name = vm.checklists[0].item_bread.folder_name;
      // vm.newScheduler.project_name = vm.checklists[0].item_bread.project_name;
      vm.newScheduler.id = vm.single_item ? vm.single_item.id : '';
      vm.newScheduler.type = vm.single_item ? 'update' : 'save';

      console.log('vm.newScheduler', vm.newScheduler)

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message(vm.single_item  ? "Schedule updated successfully" : "New checklist schedule created successfully", 'success');
          $mdDialog.hide();

          if(!d.data.data.item.all_day) {
           
           var s_date = moment(d.data.data.item.from_date).format('YYYY-MM-DD');;;
           var s_time = moment(d.data.data.item.start_time).format('HH:MM');;;
           var start = s_date + ' ' + s_time;

            var e_date = moment(d.data.data.item.to_date).format('YYYY-MM-DD');;;
            var e_time = moment(d.data.data.item.end_time).format('HH:MM');;;
            var end = e_date + ' ' + e_time;


          }else{

            start = moment(d.data.data.item.from_date).format('YYYY-MM-DD');
            start = start + ' 00:30';

            var end = moment(d.data.data.item.to_date).format('YYYY-MM-DD');
            end = end + ' 23:30';

          }

       
          // if created new
          if(!vm.single_item) {
            // // 
            console.log('before', $scope.calendarIndividualevents[0].events)
            var newData = {
              url : vm.newScheduler.url,
              title: vm.newScheduler.title,
              start: start,
              end:  end,
              color:  vm.newScheduler.color,
              all_day : vm.newScheduler.all_day,
              id: d.data.data.item.id
              
            }

            if(vm.newScheduler.item_type == 'workflow') newData.url = 'https://checklinked.azurewebsites.net/checklist/'+ vm.newScheduler.item_type_id;
            else   newData.url = 'https://checklinked.azurewebsites.net/checklist/detail/'+ vm.newScheduler.item_type_id;

            // // 
            console.log('newdata',newData)
            if(vm.selectedView=='Calendar'){
              $scope.calendarIndividualevents[0].events.push(newData);
           
              $scope.calendarTeamevents[0].events.push(newData);

              // $scope.calendarIndividualevents[0].events;
           
              // $scope.calendarTeamevents[0].events;
              // // 
            }else{
              getSchedulerByChek();
            }
           
            console.log('aftee', $scope.calendarIndividualevents[0].events)

            // if updated
          }else{
// // 
            if(vm.selectedView=='Calendar' ){
              // // 
              var SourcedataIndividual = $scope.calendarIndividualevents[0].events;
              var SourcedataTeam =  $scope.calendarTeamevents[0].events;

              for(var i = 0; i < SourcedataIndividual.length; i++) {

                if(SourcedataIndividual[i].id == vm.single_item.id) {
                  
                  
                  SourcedataIndividual[i].start = start;
                  SourcedataIndividual[i].end = end;
                  SourcedataIndividual[i].gantt_row = d.data.data.item.gantt_chat;
                  SourcedataIndividual[i].color = d.data.data.item.color;
                  SourcedataIndividual[i].all_day = d.data.data.item.all_day;
                  SourcedataIndividual[i].id = d.data.data.item.id;
                 
                  // if(vm.newScheduler.item_type == 'workflow')  SourcedataIndividual[i].url = 'https://checklinked.azurewebsites.net/checklist/'+ vm.newScheduler.item_type_id;
                  // else    SourcedataIndividual[i].url = 'https://checklinked.azurewebsites.net/checklist/detail/'+ vm.newScheduler.item_type_id;

                    break;

        
                }
              }

              for(var i = 0; i < SourcedataTeam.length; i++) {

                if(SourcedataTeam[i].id == vm.single_item.id) {
                  
                  
                  SourcedataTeam[i].start = start;
                  SourcedataTeam[i].end = end;
                  SourcedataTeam[i].gantt_row = d.data.data.item.gantt_chat;
                  SourcedataTeam[i].color = d.data.data.item.color;
                  SourcedataTeam[i].all_day = d.data.data.item.all_day;
                  SourcedataTeam[i].id = d.data.data.item.id;

                  // if(vm.newScheduler.item_type == 'workflow')  SourcedataTeam[i].url = 'https://checklinked.azurewebsites.net/checklist/'+ vm.newScheduler.item_type_id;
                  // else    SourcedataTeam[i].url = 'https://checklinked.azurewebsites.net/checklist/detail/'+ vm.newScheduler.item_type_id

                    break;

        
                }
              }

              $scope.calendarIndividualevents[0].events;
              $scope.calendarTeamevents[0].events;

              // 
             }else{
               getSchedulerByChek();
             }
      

            
            
          }


        }
         vm.Alreadyclicked = false;

      });

    };

    function deleteScheduler(id) {
      vm.newScheduler = {};
      vm.newScheduler.type = 'delete';
      vm.newScheduler.item_id = id;
      vm.closeDialog();

      console.log("deleteScheduler", id)
    
      // return false;
      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message("Schedule deleted successfully", 'success');
       

          
          console.log('before',$scope.calendarIndividualevents[0].events )
          if(vm.selectedView=='Calendar' ){
            var SourcedataIndividual = $scope.calendarIndividualevents[0].events;
            var SourcedataTeam =  $scope.calendarTeamevents[0].events;

            for(var i = 0; i < SourcedataIndividual.length; i++) {

              if(SourcedataIndividual[i].id == vm.single_item.id) {

               SourcedataIndividual.splice(i, 1);
                 break;

              }
            }
            for(var i = 0; i < SourcedataTeam.length; i++) {

             if(SourcedataTeam[i].id == vm.single_item.id) {

               SourcedataTeam.splice(i, 1);
                break;

             }
           }
           }else{
             getSchedulerByChek();
           }


          //  }
  //  getSchedulerByChek();
        //   for(var i = 0; i < data.length; i++) {
        //     i
        //    var active = data[i];
        //    var IDD =  data[i].id
        //    IDD
        //     id
        //     // 
        //     if(data[i].id == id) {
        //       // 
        //       data.splice(i, 1);
        //         break;
        //     }
        // }

          console.log('after',$scope.calendarIndividualevents[0].events )

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
