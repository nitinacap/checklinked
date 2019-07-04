(function () {

    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController($scope) {

        var vm = this;
        vm.openGroupDialog = openGroupDialog;



        function openGroupDialog(ev, what) {
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
        $scope.graphdata = [[300, 500, 100]
        ];





    }

})();
