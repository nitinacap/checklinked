(function ()
{

    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController($scope)
    {
     
       var vm = this;
       vm.openGroupDialog = openGroupDialog;
       


        function openGroupDialog(ev, what){
            console.log('openGroupDialog', what);
        }

        vm.submenu = [
            { link: 'summary', title: 'Issues' },
            { link: 'schedule', title: 'Schedules' },
            { link: 'reports', title: 'Reports' },
            { link: '', title: 'Dashboard' }
        ];

        $('.Analyze').addClass('analyze');
        $('.Process').removeClass('opacity1');
        $('.Communicate').removeClass('communicate');


/// chart section


$scope.ColorBar = ['#75B0DF', '#75B0DF']
$scope.labels = ["21/06/19", "26/06/19"];
$scope.series = ['Series A', 'Series B'];
$scope.graphdata = [ [300, 500, 100]
];


$scope.data = [
    // Order is optional. If not specified it will be assigned automatically
    {name: 'Milestones', height: '3em', sortable: false, classes: 'gantt-row-milestone', color: '#45607D', tasks: [
        // Dates can be specified as string, timestamp or javascript date object. The data attribute can be used to attach a custom object
        {name: 'Kickoff', color: '#93C47D', from: '2013-10-07T09:00:00', to: '2013-10-07T10:00:00', data: 'Can contain any custom data or object'},
        {name: 'Concept approval', color: '#93C47D', from: new Date(2013, 9, 18, 18, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0), est: new Date(2013, 9, 16, 7, 0, 0), lct: new Date(2013, 9, 19, 0, 0, 0)},
        {name: 'Development finished', color: '#93C47D', from: new Date(2013, 10, 15, 18, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0)},
        {name: 'Shop is running', color: '#93C47D', from: new Date(2013, 10, 22, 12, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0)},
        {name: 'Go-live', color: '#93C47D', from: new Date(2013, 10, 29, 16, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0)}
    ], data: 'Can contain any custom data or object'},
    {name: 'Status meetings', tasks: [
        {name: 'Demo #1', color: '#9FC5F8', from: new Date(2013, 9, 25, 15, 0, 0), to: new Date(2013, 9, 25, 18, 30, 0)},
        {name: 'Demo #2', color: '#9FC5F8', from: new Date(2013, 10, 1, 15, 0, 0), to: new Date(2013, 10, 1, 18, 0, 0)},
        {name: 'Demo #3', color: '#9FC5F8', from: new Date(2013, 10, 8, 15, 0, 0), to: new Date(2013, 10, 8, 18, 0, 0)},
        {name: 'Demo #4', color: '#9FC5F8', from: new Date(2013, 10, 15, 15, 0, 0), to: new Date(2013, 10, 15, 18, 0, 0)},
        {name: 'Demo #5', color: '#9FC5F8', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 24, 10, 0, 0)}
    ]},
    {name: 'Kickoff', movable: {allowResizing: false}, tasks: [
        {name: 'Day 1', color: '#9FC5F8', from: new Date(2013, 9, 7, 9, 0, 0), to: new Date(2013, 9, 7, 17, 0, 0),
            progress: {percent: 100, color: '#3C8CF8'}, movable: false},
        {name: 'Day 2', color: '#9FC5F8', from: new Date(2013, 9, 8, 9, 0, 0), to: new Date(2013, 9, 8, 17, 0, 0),
            progress: {percent: 100, color: '#3C8CF8'}},
        {name: 'Day 3', color: '#9FC5F8', from: new Date(2013, 9, 9, 8, 30, 0), to: new Date(2013, 9, 9, 12, 0, 0),
            progress: {percent: 100, color: '#3C8CF8'}}
    ]},
    {name: 'Create concept', tasks: [
        {name: 'Create concept', content: '<i class="fa fa-cog" ng-click="scope.handleTaskIconClick(task.model)"></i> {{task.model.name}}', color: '#F1C232', from: new Date(2013, 9, 10, 8, 0, 0), to: new Date(2013, 9, 16, 18, 0, 0), est: new Date(2013, 9, 8, 8, 0, 0), lct: new Date(2013, 9, 18, 20, 0, 0),
            progress: 100}
    ]},
    {name: 'Finalize concept', tasks: [
        {name: 'Finalize concept', color: '#F1C232', from: new Date(2013, 9, 17, 8, 0, 0), to: new Date(2013, 9, 18, 18, 0, 0),
            progress: 100}
    ]},
    {name: 'Development', children: ['Sprint 1', 'Sprint 2', 'Sprint 3', 'Sprint 4'], content: '<i class="fa fa-file-code-o" ng-click="scope.handleRowIconClick(row.model)"></i> {{row.model.name}}'},
    {name: 'Sprint 1', tooltips: false, tasks: [
        {name: 'Product list view', color: '#F1C232', from: new Date(2013, 9, 21, 8, 0, 0), to: new Date(2013, 9, 25, 15, 0, 0),
            progress: 25}
    ]},
    {name: 'Sprint 2', tasks: [
        {name: 'Order basket', color: '#F1C232', from: new Date(2013, 9, 28, 8, 0, 0), to: new Date(2013, 10, 1, 15, 0, 0)}
    ]},
    {name: 'Sprint 3', tasks: [
        {name: 'Checkout', color: '#F1C232', from: new Date(2013, 10, 4, 8, 0, 0), to: new Date(2013, 10, 8, 15, 0, 0)}
    ]},
    {name: 'Sprint 4', tasks: [
        {name: 'Login & Signup & Admin Views', color: '#F1C232', from: new Date(2013, 10, 11, 8, 0, 0), to: new Date(2013, 10, 15, 15, 0, 0)}
    ]},
    {name: 'Hosting'},
    {name: 'Setup', tasks: [
        {name: 'HW', color: '#F1C232', from: new Date(2013, 10, 18, 8, 0, 0), to: new Date(2013, 10, 18, 12, 0, 0)}
    ]},
    {name: 'Config', tasks: [
        {name: 'SW / DNS/ Backups', color: '#F1C232', from: new Date(2013, 10, 18, 12, 0, 0), to: new Date(2013, 10, 21, 18, 0, 0)}
    ]},
    {name: 'Server', parent: 'Hosting', children: ['Setup', 'Config']},
    {name: 'Deployment', parent: 'Hosting', tasks: [
        {name: 'Depl. & Final testing', color: '#F1C232', from: new Date(2013, 10, 21, 8, 0, 0), to: new Date(2013, 10, 22, 12, 0, 0), 'classes': 'gantt-task-deployment'}
    ]},
    {name: 'Workshop', tasks: [
        {name: 'On-side education', color: '#F1C232', from: new Date(2013, 10, 24, 9, 0, 0), to: new Date(2013, 10, 25, 15, 0, 0)}
    ]},
    {name: 'Content', tasks: [
        {name: 'Supervise content creation', color: '#F1C232', from: new Date(2013, 10, 26, 9, 0, 0), to: new Date(2013, 10, 29, 16, 0, 0)}
    ]},
    {name: 'Documentation', tasks: [
        {name: 'Technical/User documentation', color: '#F1C232', from: new Date(2013, 10, 26, 8, 0, 0), to: new Date(2013, 10, 28, 18, 0, 0)}
    ]}
];


$scope.gantt_options = {
    mode: 'custom',
    scale: 'day',
    sortMode: undefined,
    sideMode: 'TreeTable',
    daily: false,
    maxHeight: false,
    width: false,
    zoom: 1,
    columns: ['model.name', 'from', 'to'],
    treeTableColumns: ['from', 'to'],
    columnsHeaders: {'model.name' : 'Name', 'from': 'From', 'to': 'To'},
    columnsClasses: {'model.name' : 'gantt-column-name', 'from': 'gantt-column-from', 'to': 'gantt-column-to'},
    columnsFormatters: {
        'from': function(from) {
            return from !== undefined ? from.format('lll') : undefined;
        },
        'to': function(to) {
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
    taskContent : '<i class="fa fa-tasks"></i> {{task.model.name}}',
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
            evaluator: function(date) {
                return date.isoWeekday() === 6 || date.isoWeekday() === 7;
            },
            targets: ['weekend']
        },
        '11-november': {
            evaluator: function(date) {
                return date.month() === 10 && date.date() === 11;
            },
            targets: ['holiday']
        }
    },
    timeFramesNonWorkingMode: 'visible',
    columnMagnet: '15 minutes',
    timeFramesMagnet: true,
    canDraw: function(event) {
        var isLeftMouseButton = event.button === 0 || event.button === 1;
        return $scope.options.draw && !$scope.options.readOnly && isLeftMouseButton;
    },
    drawTaskFactory: function() {
        return {
            id: utils.randomUuid(),  // Unique id of the task.
            name: 'Drawn task', // Name shown on top of each task.
            color: '#AA8833' // Color of the task in HEX format (Optional).
        };
    },
    api: function(api) {
        // API Object is used to control methods and events from angular-gantt.
        $scope.api = api;

        api.core.on.ready($scope, function() {
            // Log various events to console
            api.scroll.on.scroll($scope, logScrollEvent);
            api.core.on.ready($scope, logReadyEvent);

            api.data.on.remove($scope, addEventName('data.on.remove', logDataEvent));
            api.data.on.load($scope, addEventName('data.on.load', logDataEvent));
            api.data.on.clear($scope, addEventName('data.on.clear', logDataEvent));

            api.tasks.on.add($scope, addEventName('tasks.on.add', logTaskEvent));
            api.tasks.on.change($scope, addEventName('tasks.on.change', logTaskEvent));
            api.tasks.on.rowChange($scope, addEventName('tasks.on.rowChange', logTaskEvent));
            api.tasks.on.remove($scope, addEventName('tasks.on.remove', logTaskEvent));

            if (api.tasks.on.moveBegin) {
                api.tasks.on.moveBegin($scope, addEventName('tasks.on.moveBegin', logTaskEvent));
                //api.tasks.on.move($scope, addEventName('tasks.on.move', logTaskEvent));
                api.tasks.on.moveEnd($scope, addEventName('tasks.on.moveEnd', logTaskEvent));

                api.tasks.on.resizeBegin($scope, addEventName('tasks.on.resizeBegin', logTaskEvent));
                //api.tasks.on.resize($scope, addEventName('tasks.on.resize', logTaskEvent));
                api.tasks.on.resizeEnd($scope, addEventName('tasks.on.resizeEnd', logTaskEvent));
            }

            api.rows.on.add($scope, addEventName('rows.on.add', logRowEvent));
            api.rows.on.change($scope, addEventName('rows.on.change', logRowEvent));
            api.rows.on.move($scope, addEventName('rows.on.move', logRowEvent));
            api.rows.on.remove($scope, addEventName('rows.on.remove', logRowEvent));

            api.side.on.resizeBegin($scope, addEventName('labels.on.resizeBegin', logLabelsEvent));
            //api.side.on.resize($scope, addEventName('labels.on.resize', logLabelsEvent));
            api.side.on.resizeEnd($scope, addEventName('labels.on.resizeEnd', logLabelsEvent));

            api.timespans.on.add($scope, addEventName('timespans.on.add', logTimespanEvent));
            api.columns.on.generate($scope, logColumnsGenerateEvent);

            api.rows.on.filter($scope, logRowsFilterEvent);
            api.tasks.on.filter($scope, logTasksFilterEvent);

            api.data.on.change($scope, function(newData) {
                if (dataToRemove === undefined) {
                    dataToRemove = [
                        {'id': newData.data[2].id}, // Remove Kickoff row
                        {
                            'id': newData.data[0].id, 'tasks': [
                            {'id': newData.data[0].tasks[0].id},
                            {'id': newData.data[0].tasks[3].id}
                        ]
                        }, // Remove some Milestones
                        {
                            'id': newData.data[6].id, 'tasks': [
                            {'id': newData.data[6].tasks[0].id}
                        ]
                        } // Remove order basket from Sprint 2
                    ];
                }
            });

            // When gantt is ready, load data.
            // `data` attribute could have been used too.
            $scope.load();

            // Add some DOM events
            api.directives.on.new($scope, function(directiveName, directiveScope, element) {
                if (directiveName === 'ganttTask') {
                    element.bind('click', function(event) {
                        event.stopPropagation();
                        logTaskEvent('task-click', directiveScope.task);
                    });
                    element.bind('mousedown touchstart', function(event) {
                        event.stopPropagation();
                        $scope.live.row = directiveScope.task.row.model;
                        if (directiveScope.task.originalModel !== undefined) {
                            $scope.live.task = directiveScope.task.originalModel;
                        } else {
                            $scope.live.task = directiveScope.task.model;
                        }
                        $scope.$digest();
                    });
                } else if (directiveName === 'ganttRow') {
                    element.bind('click', function(event) {
                        event.stopPropagation();
                        logRowEvent('row-click', directiveScope.row);
                    });
                    element.bind('mousedown touchstart', function(event) {
                        event.stopPropagation();
                        $scope.live.row = directiveScope.row.model;
                        $scope.$digest();
                    });
                } else if (directiveName === 'ganttRowLabel') {
                    element.bind('click', function() {
                        logRowEvent('row-label-click', directiveScope.row);
                    });
                    element.bind('mousedown touchstart', function() {
                        $scope.live.row = directiveScope.row.model;
                        $scope.$digest();
                    });
                }
            });

            api.tasks.on.rowChange($scope, function(task) {
                $scope.live.row = task.row.model;
            });

            objectModel = new ObjectModel(api);
        });
    }
};


    }

})();
