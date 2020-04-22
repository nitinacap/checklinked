(function () {

    'use strict';

    angular
        .module('app.dashboard')
        .controller('DashboardController', DashboardController);

    /** @ngInject */
    function DashboardController($scope, api, $rootScope, $mdDialog, $document) {

        var vm = this;
        $scope.AllowDragAndDrop = false;
        // $scope.AllowDragAndDrop = true;     
        vm.showLoadingImage = true;
        vm.dialog = {};
        vm.editDialog = {};
        vm.isLoader = true;

        $scope.openGroupDialog = function (ev, what, chart, index) {

            vm.chartAllData = chart;
            vm.chartIndex = index;

            if (what == 'arrange') {
                if ($scope.AllowDragAndDrop) $scope.AllowDragAndDrop = false;
                else $scope.AllowDragAndDrop = true;

  
            } else if (what === 'edit_chart_name') {
                vm.dialog.title = 'Edit Name';
                vm.dialog.name = 'Name';
                vm.dialog.type = 'edit_chart_name';

                vm.editDialog.name = vm.chartAllData.chart_data.options.title.text;

                var templateUrl = 'app/main/reports/dialogs/reports/report-edit-section-dialog.html';

                openDialog(templateUrl);


            } else if (what === 'delete_tile') {

                vm.dialog.type = 'delete_tile';

                vm.title = 'Delete Tile';
                vm.warning = 'Warning: This can’t be undone';
                vm.description = "Please confirm you want to delete this <span class='link'> Chart - " + vm.chartAllData.chart_data.options.title.text + "</span><br>. All of the contents will be deleted and can’t be recovered."


                vm.deleteChartId = vm.chartAllData.id

                // 

                var templateUrl = 'app/main/organization/dialogs/organizations/alert.html';

                openDialog(templateUrl);

            } else if (what === 'downloadPDF') {
                

                kendo.drawing.drawDOM($("#exportthis")).then(function(group) {
                    kendo.drawing.pdf.saveAs(group, "Converted PDF.pdf");
                  });

            }


        }

        function openDialog(templateUrl) {
            $mdDialog.show({
                scope: $scope,
                preserveScope: true,
                templateUrl: templateUrl,
                parent: angular.element($document.find('#checklist')),
            });
        }

        vm.saveDialog = function () {
            if (vm.dialog.type === 'edit_chart_name') {

                $mdDialog.hide();

                vm.chartAllData.chart_data.options.title.text = vm.editDialog.name;

                var data = {
                    action_type: 'edit_chart_name',
                    chart_data: vm.chartAllData.chart_data,
                    report_id: vm.chartAllData.report_id,
                    chart_id: vm.chartAllData.id,
                }

                console.log('saveDialog edit_chart_name -- ', data)

                api_request(data);
            }
        }

        function api_request(request, chart_data) {

            vm.isLoader = true;

            console.log('api_request', request)

            return api.reports.reports(request).success(function (resp) {
                if (resp) {
                    if (resp.code == '-1') {
                        $rootScope.message(resp.message, 'error')
                    } else {

                        console.log('resp', resp)
                        if (vm.dialog.type === 'edit_chart_name') {
                            $rootScope.message("Tile name updated successfully", 'success')
                        } else if (vm.dialog.type === 'delete_tile') {
                            $rootScope.message("Tile deleted successfully", 'success');

                            vm.totalCharts.splice(vm.chartIndex, 1);
                           
                        } else if (vm.dialog.type === 'chart_arrange' && $scope.AllowDragAndDrop) {
                            $rootScope.message("Charts have arranged successfully", 'success');

                        }




                    }

                }
                vm.isLoader = false;
            });


        }



        function getAllCharts() {

            vm.isLoader = false;

            api.reports.reports({ action_type: 'dashboard' }).success(function (res) {

                if (res.type == 'success') {

                    console.log(" dashboard ", res.data);

                    vm.totalCharts = res.data;


                    vm.showLoadingImage = false;

                }
                else {
                    $rootScope.message(res.message, 'error');
                }

            })
        }

        getAllCharts();


         /// drag and drop section starts


        $scope.logEvent = function (dropEffect){

            if(dropEffect){
                var request = [];
                for (var i in vm.totalCharts){
    
                    if(vm.totalCharts[i].order) {
                        request.push({});
                        request[i].order = i;
                        request[i].chart_id = vm.totalCharts[i].id;
                        request[i].report_id = vm.totalCharts[i].report_id;
                    }
                }
    
                vm.dialog.type = 'chart_arrange';
    
                var data = {
                    action_type: 'chart_arrange',
                    totalCharts: request
        
                }
        
                console.log('saveDialog edit_chart_name -- ', data)
        
                api_request(data);
            }

            

        }
      
         /// drag and drop section  ends
        //  $scope.obj = {
        //     dateStr: "2013-10-02T23:28:37+0000"
        //   };
        //  $scope.timezone=  /\((.*)\)/.exec(new Date($scope.obj.dateStr).toString())[1];
  
        //  console.log("moment", $scope.obj.dateStr, moment($scope.obj.dateStr));
        //  console.log(moment.tz().format('YYYY-MM-DD HH:MM'));
        //  console.log(moment.tz());
        //  moment.tz.guess(); 
        //  moment.tz.Zone

        
        //  // 

        //Alert Cancel an close
        $scope.hide = function () {

            $mdDialog.hide();
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };

        $scope.answer = function (answer) {

            $mdDialog.hide();

            var data = {
                action_type: 'delete_tile',
                report_id: vm.chartAllData.report_id,
                chart_id: vm.chartAllData.id,
                show_in_dashboard: 0
            }

            api_request(data);

        };

        vm.closeDialog = function () {
            $mdDialog.hide();
        }



        vm.submenu = [
            { link: 'summary', title: 'Issues', active : false  },
            { link: 'schedule', title: 'Schedules', active : false  },
            { link: 'reports', title: 'Reports', active : false  },
            { link: 'dashboard', title: 'Dashboard', active : true  }
        ];

        $('.Analyze').addClass('analyze');
        $('.Process').removeClass('opacity1');
        $('.Communicate').removeClass('communicate');





    }

})();
