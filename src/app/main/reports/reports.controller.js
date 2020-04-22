(function () {
  'use strict';

  angular
    .module('app.reports')
    .controller('ReportController', ReportController)

  /** @ngInject */
  function ReportController($document, $window, $cookies, $mdDialog, api, $scope, $rootScope, dataTable, $filter) {

    var vm = this;
    vm.closeDialog = closeDialog;
    vm.openDialog = openDialog;
    vm.selectLabel = selectLabel;
    vm.reportDetails = reportDetails;
    vm.closeReportDetails = closeReportDetails;
    vm.ActionReport = ActionReport;
    vm.saveDialog = saveDialog;

    $rootScope.DataTableFields = {};
    $scope.dataTable = dataTable;
    vm.reportsRange = true;

    vm.closeList = false;
    vm.isLoader = true;
    vm.showLoadingImage = true;
    vm.dialog = {};
    vm.editDialog = {};

    $scope.user_id = $cookies.get("useridCON");
    // vm.createDataTableSegment = createDataTableSegment;


    // $mdDialog.show({
    //   scope: $scope,
    //   preserveScope: true,
    //   templateUrl: 'app/main/teammembers/dialogs/subscription-alert.html',
    //   clickOutsideToClose: false
    // });


    function closeDialog() {
      $mdDialog.hide();
    }


    // function readReports(id, key) {
    //   var key = key ? key : '';
    //   return api.notifications.read(id, 'notification-read').success(function (resp) {
    //     if (resp) {
    //       vm.isLoader = false;
    //       if (resp.code == '-1') {
    //       } else {

    vm.convertLetterToNumber = function (letter) {

      return dataTable.convertLetterToNumber(letter)

    }

    //       }


    //     }
    //   })

    // };

    // readReports();

    function openDialog(val, heading, table_str_data) {

        

      // add-edit-reports-dialog.html
      var templateUrl = '';

      if (val == 'AddEdit') {
        vm.dialog.type = 'AddEdit';
        templateUrl = 'app/main/reports/dialogs/reports/add-edit-reports-dialog.html';
        $scope.multiSelectDropdown('new');
      }
      else if (val == 'AddDataPoint') {
        templateUrl = 'app/main/checklist/dialogs/checklist/checklist-set-labels-dialog.html';

        vm.labels.selectable = $rootScope.user.dashboard.labels;
          
      }
      else if (val == 'addTable') {

        if (!vm.newItem.column) return $rootScope.message("Please give number of Columns to continue", 'error');
        if (!vm.newItem.row) return $rootScope.message("Please give number of Rows to continue", 'error');
        if (!vm.newItem.name) return $rootScope.message("Please give Report name to continue", 'error');



        templateUrl = 'app/main/reports/dialogs/reports/data-table-dialog.html';

        var name = vm.newItem.name;
        var columns = vm.newItem.column;
        var rows = vm.newItem.row;

        vm.total_num_column = vm.newItem.column

        vm.newItem = {};
        vm.newItem.range = 'All';


        var date = new Date();
        var timestamp = date.getTime();



        //  vm.table_id = table_id != undefined ? table_id : '';
        vm.editDataTable = [];
        vm.editHeadingTable = [];
        var heading_data = heading != undefined ? heading : '';
        if (heading_data != '' || heading_data != undefined) {
          vm.editHeadingTable = heading_data;
          var etSectionId = heading_data.parent_id;
          var etHeadingId = heading_data.id;
          var new_field = 'edit_' + timestamp;
          vm.new_field = 'edit_' + timestamp;
          vm.editDataTable[new_field] = [];

          vm.editDataTable[new_field]['table_str_data'] = table_str_data != undefined ? table_str_data : '';

        }

        vm.newDataTableItem = {

          name: name,
          column: columns,
          row: rows,
          submitting: false
        };

        /***************** */

        // vm.newItem.name, vm.newItem.column, vm.newItem.row, $event

        vm.dataTableName = name;
        vm.data_table_structure = [];

        $scope.cell_format_for_reports = dataTable.getValue('cell_format_for_reports');
        // [{ "name": "None" }, { "name": "Date" }, { "name": "Label" }, { "name": "Text" }, { "name": "Number" }, { "name": "Currency" }, { "name": "Formula" }]


        vm.model = $scope.cell_format_for_reports[0].name;
        //// //;

        $scope.datapoint_functions = dataTable.getValue('datapoint_functions');



        $scope.decimal = dataTable.getValue('decimal');
        // //;
        // $scope.decimal = [
        //   { "value": 0 }, { "value": 1 }, { "value": 2 }

        // ]

        $rootScope.DataTableFields.number_type = $scope.decimal[0].value;

        $scope.currency = dataTable.getValue('currency');

        // $scope.currency = [ { "name": "$", "sign ": "Dollars" }, { "name": "€", "sign ": "Euros" }, { "name": "£", "sign ": "Pounds" }, { "name": "￥", "sign ": "Yen/Yuan" }];


        $rootScope.DataTableFields.currency_type = $scope.currency[0].name;


        $scope.alignTextVal = dataTable.getValue('alignTextVal');

        // [{ "name": "center" }, { "name": "left" }, { "name": "right" }]

        
        vm.alignTextStatus = $scope.alignTextVal[0].name;

        $scope.TextPostition = dataTable.getValue('TextPostition');
        // [ { "name": "bottom", "pos": "fa-long-arrow-down" }, { "name": "middle", "pos": "fa-arrows-v" }, { "name": "top", "pos": "fa-long-arrow-up" }]

        vm.TextPostitionStatus = $scope.TextPostition[0].name;




        // $scope.decimal = [
        //   { "value": 0 }, { "value": 1 }, { "value": 2 }

        // ]

        $rootScope.DataTableFields.number_type = $scope.decimal[0].value;

        vm.formats = $scope.cell_format_for_reports

        var data_table_row = rows;
        var data_table_col = columns;

        dataTable.toExcelHeader(data_table_col)

        vm.header_names = dataTable.toExcelHeaderArray(data_table_col + 1)

        vm.header_names.shift()

        $scope.rows = [];
        $scope.columns = [];
        for (var i = 0; i < data_table_row; i++) {
          $scope.rows.push(String.fromCharCode(65 + i));
        }


        var col_data = {};

        for (var j = 0; j < data_table_col; j++) {
          $scope.columns.push(j + 1)
        }

        vm.rows = $scope.rows.length;
        vm.columns = $scope.columns.length;



        vm.rowIndex = [];
        vm.myrecords = [];
        var col_data_update = {};

        $scope.init = function (row, key, column, index, current_index, heading) {
          col_data_update = {};
          vm.table_id;
          // var etSectionId = heading_data.parent_id;
          //     var etHeadingId = heading_data.id;
          //     var new_field = 'edit_'+etSectionId+'_'+etHeadingId;

          if (vm.editDataTable[vm.new_field]['table_str_data'] != '') {
            var tbd = vm.editDataTable[new_field]['table_str_data'][current_index];
            if (tbd == undefined) {
              return;
              // // //;
            }

            var new_val = tbd.value;

            col_data_update[row + column] = '';
            vm.myrecords.push(col_data_update);
            //// // //;


            // $rootScope.DataTableFields.cell_stucture = { 'index': parseInt(tbd.index), 'cell_no': tbd.row_no + parseInt(tbd.col_no), 'type': tbd.type, 'row': tbd.row_no, 'column': parseInt(tbd.col_no), 'value': tbd.value, 'text_align': tbd.text_align, 'text_position': tbd.text_position, 'dataPointName' : tbd.dataPointName, 'dataPointId' : tbd.dataPointId }

            $rootScope.DataTableFields.cell_stucture = { 'index': parseInt(tbd.index), 'cell_no': tbd.col_no + parseInt(tbd.row_no), 'type': tbd.type, 'row': tbd.col_no, 'column': parseInt(tbd.row_no), 'value': tbd.value, 'text_align': tbd.text_align, 'text_position': tbd.text_position, 'dataPointName': tbd.dataPointName, 'dataPointId': tbd.dataPointId }

            if (tbd.type == 'Number') {
              if (tbd.is_percentage == 1) {
                $rootScope.DataTableFields.cell_stucture['percentage'] = true;
              }
              else {
                $rootScope.DataTableFields.cell_stucture['percentage'] = false;
              }
            }
            var tbd_value = tbd.value;

            if (tbd.value != 'n-def') {
              if (tbd.type != 'Label') {

                tbd_value = '';
                // // //;
              }

              vm.myrecords[current_index][row + column] = tbd_value;


            }

            //// // //;
            //vm.myrecords.push(col_data_update);
            vm.data_table_structure[current_index] = $rootScope.DataTableFields.cell_stucture;


          }
          else {
            col_data_update[row + column] = '';
            vm.myrecords.push(col_data_update)

            vm.data_table_structure.push({})

          }



        };

        $scope.initRow = function (key_row) {
          vm.rowIndex.push(key_row + 1)

        };

        $rootScope.DataTableFields = {
          lable_show: false,
          formula_show: false,
          currency_show: false,
          number_show: false,
          percentage: false,
          textShow: false,
          data_point_show: false
        }

        vm.selectedRow = undefined;
        vm.selectedColumn = undefined;
        vm.selectedIndex = undefined;


        vm.selectedHeaderName = undefined;
        vm.selectedHeaderIndex = undefined;
      }

      console.log('templateUrl', templateUrl)

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: templateUrl,
        parent: angular.element($document.find('#checklist'))
      });
    }



    vm.select = function (row, column, index, header_name, header_index) {

      vm.dataPointId = '';
      vm.dataPointName = '';

      vm.label_name = ''


      $rootScope.DataTableFields = {
        lable_show: false,
        formula_show: false,
        currency_show: false,
        text_show: false,
        number_show: false,
        percentage: false,
        textShow: false,
        data_point_show: false,
        cellSelected: false,
      }




      vm.model = $scope.cell_format_for_reports[0].name;



      if (vm.selectedRow === row && vm.selectedColumn === column) {
        vm.selectedRow = undefined;
        vm.selectedColumn = undefined;
        vm.selectedIndex = undefined;


        vm.selectedHeaderName = undefined;
        vm.selectedHeaderIndex = undefined;


      } else {
        vm.selectedRow = row;
        vm.selectedColumn = column;

        vm.selectedHeaderName = header_name;
        vm.selectedHeaderIndex = header_index;


        vm.selectedIndex = index;
        $rootScope.DataTableFields.cellSelected = true;

        vm.data_table_structure


        if (vm.data_table_structure[index] == undefined) {
          // 
        }
        var getfcell_no = vm.data_table_structure[index].cell_no;

        if (getfcell_no != undefined && getfcell_no == vm.selectedHeaderName + vm.selectedHeaderIndex) {


          var getformat_type = vm.data_table_structure[index].type
          vm.dataPointName = vm.data_table_structure[index].dataPointName




          var text_align = vm.data_table_structure[index].text_align
          var text_position = vm.data_table_structure[index].text_position

          var cell_structure = vm.data_table_structure[index];
          var cell_value = cell_structure.value
          vm.model = getformat_type
          $rootScope.DataTableFields.selected_value = vm.model;
          $rootScope.DataTableFields.textShow = true;

          vm.alignTextStatus = text_align
          vm.TextPostitionStatus = text_position

          switch (getformat_type) {
            case 'None':
            case 'n-def':

              vm.model = $scope.cell_format_for_reports[0].name;
              vm.alignTextStatus = $scope.alignTextVal[0].name;
              vm.TextPostitionStatus = $scope.TextPostition[0].name;
              break;
            case 'Date':
              break;
            case 'Label':
              $rootScope.DataTableFields.lable_show = true;
              $rootScope.DataTableFields.label_name = cell_value

              break;
            case 'Number':
              $rootScope.DataTableFields.number_show = true;
              $rootScope.DataTableFields.number_type = cell_value

              $rootScope.DataTableFields.percentage = cell_structure.percentage

              break;
            case 'Formula':
              $rootScope.DataTableFields.formula_show = true;
              $rootScope.DataTableFields.formula = cell_value
              break;
            case 'Currency':
              $rootScope.DataTableFields.currency_show = true;
              $rootScope.DataTableFields.currency_type = cell_value
              break;
            case 'Text':
              $rootScope.DataTableFields.text_show = true;
              $rootScope.DataTableFields.text = parseInt(cell_value);
              break;
            case 'Data Point':
              $rootScope.DataTableFields.data_point_show = true;
              $rootScope.DataTableFields.data_point_function = cell_value;
              break;

            default:
              break;
          }
        }
        
        else{
          
          vm.model =  $scope.cell_format_for_reports[0].name;
     

          vm.alignTextStatus = $scope.alignTextVal[0].name;
          
          vm.TextPostitionStatus  = $scope.TextPostition[0].name;
        }

      }
    }

     vm.getdetails =function(selected_value) {


      if (selected_value === 'Number') {
        $rootScope.DataTableFields.number_type = 0;
      }


      $rootScope.DataTableFields = {
        lable_show: false,
        formula_show: false,
        currency_show: false,
        textShow: true,
        text_show: false,
        number_show: false,
        data_point_show: false
      }

      $rootScope.DataTableFields.selected_value = selected_value;

      if (selected_value == 'None') {
        $rootScope.DataTableFields.textShow = false;

      
      }


      else if (selected_value == 'Date') {
        vm.CheckToSaveFormat();
      }

      else if (selected_value == 'Formula') {
        $rootScope.DataTableFields.formula_show = true;
      }

      else if (selected_value == 'Currency') {
        $rootScope.DataTableFields.currency_show = true;
        $rootScope.DataTableFields.number_show = false;
      }

      else if (selected_value == 'Text') {
        $rootScope.DataTableFields.text_show = true;
      }

      else if (selected_value == 'Number') {
        $rootScope.DataTableFields.currency_show = false;
        $rootScope.DataTableFields.number_show = true;
      }

      else if (selected_value == 'Data Point') {
        $rootScope.DataTableFields.data_point_show = true;
      }

      else if (selected_value == 'Label') {
        $rootScope.DataTableFields.lable_show = true;
      }

      $rootScope.DataTableFields.cellSelected = true;


    }

    vm.CheckToSaveFormat = function () {
   
        // giving error if submiting empty values
        if (vm.model === "Formula") {
          if ($rootScope.DataTableFields.formula) {
            vm.saveFormat();
          }
  
        } else if (vm.model === "Text") {
  
          if ($rootScope.DataTableFields.text) {
  
            vm.saveFormat();
          }
        } else if (vm.model === "Number") {

          if ($rootScope.DataTableFields.number_type) {
  
            vm.saveFormat();
          }
  
        } else if (vm.model === "Currency") {
  
          if ($rootScope.DataTableFields.currency_type) {
  
            vm.saveFormat();
          }
        } else if (vm.model === "Data Point") {
  
          if ($rootScope.DataTableFields.data_point_function && vm.dataPointName) {
  
            vm.saveFormat();
          }
        }else { 
         
            vm.saveFormat();

        }
    }

    vm.saveFormat = function () {

 


      // // giving error if submiting empty values
      // if (vm.model === "Formula") {
      //   if (!$rootScope.DataTableFields.formula) {
      //     $rootScope.message('Plese enter the Formula to save', 'error');
      //     return 0;
      //   }

      // } else if (vm.model === "Text") {

      //   if ($rootScope.DataTableFields.text === undefined || $rootScope.DataTableFields.text === false) {

      //     $rootScope.message('Plese enter the Text characters to save', 'error');
      //     return 0;
      //   }
      // } else if (vm.model === "Number") {

      //   if ($rootScope.DataTableFields.number_type === undefined || $rootScope.DataTableFields.number_type === false) {

      //     $rootScope.message('Plese enter the Decimals to save', 'error');
      //     return 0;
      //   }

      // } else if (vm.model === "Currency") {

      //   if (!$rootScope.DataTableFields.currency_type) {

      //     $rootScope.message('Plese enter the Currency Type to save', 'error');
      //     return 0;
      //   }
      // } else if (vm.model === "Data Point") {

      //   if (!$rootScope.DataTableFields.data_point_function) {

      //     $rootScope.message('Plese select the function to save', 'error');
      //     return 0;
      //   }
      // }

      var rootScopeDatafields = $rootScope.DataTableFields;

      rootScopeDatafields.value = ''
      rootScopeDatafields.cell_stucture = '';

      var table_key = vm.selectedHeaderName + vm.selectedHeaderIndex

      var d_len = vm.myrecords.length

      for (i = 0; i < d_len; i++) {

        var recArr = vm.myrecords[i]
        var chkKey = table_key in recArr;
        if (chkKey) {
          vm.indexPos = i

        }
      }

      vm.selColIndex = vm.selectedHeaderIndex - 1

      dataTable.savingCellStructure(vm.selectedIndex, vm.selectedHeaderName, vm.selectedHeaderIndex, vm.alignTextStatus, vm.TextPostitionStatus)


      // // dataPointId: dataPointId
      rootScopeDatafields.cell_stucture.dataPointId = vm.dataPointId;
      //
      rootScopeDatafields.cell_stucture.dataPointName = vm.dataPointName;
      // rootScopeDatafields.cell_stucture.range = vm.newItem.range;

      // if(vm.newItem.range == 'Custom') {
      //   rootScopeDatafields.cell_stucture.from_date = vm.newItem.from_date;
      //   rootScopeDatafields.cell_stucture.to_date = vm.newItem.to_date;
      // }

      console.log('rootScopeDatafields.cell_stucture', rootScopeDatafields.cell_stucture)
      // vm.myrecords

      // var val = [];
      // var valKey = ''
      // for(var k = 0; k < vm.total_num_column; k++){
      //   valKey =   vm.header_names[k] + '1';
      //   val.push(vm.myrecords[k][valKey])
      // }




      // vm.dataPointId = '';
      // vm.dataPointName = '';




      vm.myrecords[vm.indexPos][vm.selectedHeaderName + vm.selectedHeaderIndex] = rootScopeDatafields.value;
      vm.data_table_structure[vm.indexPos] = rootScopeDatafields.cell_stucture


       vm.model = vm.data_table_structure[vm.indexPos].type ? vm.data_table_structure[vm.indexPos].type: $scope.cell_format_for_reports[0].name;
     

      vm.alignTextStatus = vm.data_table_structure[vm.indexPos].text_align ? vm.data_table_structure[vm.indexPos].text_align :  $scope.alignTextVal[0].name;
       
      vm.TextPostitionStatus  = vm.data_table_structure[vm.indexPos].text_position ? vm.data_table_structure[vm.indexPos].text_position : $scope.TextPostition[0].name;
      vm.indexPos = undefined;
    }

    vm.labels = {
      selected: [],
      selectable: []
    };

    vm.saveDone = function () {

      // var tab_id_update = tbl_id != '' ? tbl_id : '';

      vm.isLoader = true;
      var row_no = vm.rows;
      var columns_no = vm.columns;

      var val = [];
      var checkNotAllNull = 0;
      var valKey = ''
      for (var k = 0; k < vm.total_num_column; k++) {
        valKey = vm.header_names[k] + '1';
        var arrayItem = vm.myrecords[k][valKey]
        val.push(arrayItem);

        console.log('arrayItem.length', arrayItem.length)

        if (arrayItem.length !== 0) checkNotAllNull++;
      }

      console.log('checkAllNull', checkNotAllNull)
      // will give error if not a single heading(label) found
      if (checkNotAllNull == 0) return $rootScope.message('Please enter atleast one heading.', 'error');




      // dataPointId: dataPointId
      // rootScopeDatafields.cell_stucture.dataPointId = vm.dataPointId;
      // rootScopeDatafields.cell_stucture.range = vm.newItem.range;

      // if(vm.newItem.range == 'Custom') {
      //   rootScopeDatafields.cell_stucture.from_date = vm.newItem.from_date;
      //   rootScopeDatafields.cell_stucture.to_date = vm.newItem.to_date;
      // }

      // if (!vm.dataPointId) return $rootScope.message('Please select datapoint.', 'error');

      var request = {
        table_structure: vm.data_table_structure,
        type: 'table_structure',
        name: vm.dataTableName,
        row: row_no,
        column: columns_no,
        table_header: val,
        range: vm.newItem.range,
        // dataPointId: vm.dataPointId,
        action_type: 'create_new_report',
        users: $scope.myDropdownModel
      }

      if (vm.dialog.type === 'edit_report') {
        // $scope.multiSelectDropdown('update')
        request.action_type = 'edit_report';
        request.report_id = vm.reportView.id;
        request.table_id = vm.reportView.table_id;
 

      }

      if (vm.newItem.range == 'Custom') {
        request.from_date = vm.newItem.from_date;
        request.to_date = vm.newItem.to_date;

        if (!vm.newItem.from_date) return $rootScope.message('Please enter Custom From-Date to continue.', 'error');
        else if (!vm.newItem.to_date) return $rootScope.message('Please enter Custom To-Date to continue.', 'error');
      }



      console.log('request api savedone', request);


      api.reports.reports(request).success(function (res) {

        if (res.type == 'success') {
          $rootScope.message(vm.dialog.type === 'edit_report' ? 'Report is updated succesfully' : 'Report is generated succesfully', 'success');

          console.log(" vm.dataTableArr=", res);
          getAllReports();
          vm.closeDialog();


 
          if (vm.dialog.type === 'edit_report') {
            var data = vm.reportView;


            // for(var i = 0; i < data.length; i++) {

            if (data.id == res.data.id) {


              data.name = res.data.name;
              data.report_header = res.data.report_header;
              data.report_data = res.data.report_data;
              data.range = res.data.range.type;
              data.report_datatable = res.data.report_datatable;
              data.chart_list = res.data.chart_list;
              data.report_users = res.data.report_users;

            }
            // }

          }

          vm.reportView.report_data.forEach(function (val) {

            vm.reportView.report_datatable[0].table_str.forEach(function (rep) {

              if (rep.index == val.index) {
                // if(rep.col_no === val.col && rep.row_no === val.row ){

                rep.final_Val = val.value

              }
            });
          });

          vm.reportView.report_datatable[0].table_str.forEach(function (path) {
            if (path.col_no.length) {
              path.col = dataTable.convertLetterToNumber(path.col_no);
            }
          });

        }
        else {
          $rootScope.message(res.message, 'error');
        }
        vm.isLoader = false;
      })

    };


    function getAllReports() {
      //  var request = {action_type : get_report}
      vm.isLoader = false;
      console.log('getAllReports');

      api.reports.reports({ action_type: 'get_report' }).success(function (res) {

        if (res.type == 'success') {

          console.log(" vm.dataTableArr=", res.data);
          vm.totalReports = res.data;

          vm.showLoadingImage = false;

        }
        else {
          $rootScope.message(res.message, 'error');
        }

      })
    }

    getAllReports();

    vm.columnIndex = {}
    vm.rowIndex = {}
    vm.columnCheck = function (id, column_index, row_index) {
      vm.columnIndex[id] = (column_index + 1).toString()
      vm.rowIndex[id] = (row_index + 1).toString()

    }
    // vm.rowIndex = {}
    // vm.columnCheck= function(id, row_index){
    //   vm.rowIndex[id] = (row_index + 1).toString()

    // }

    //  function update_database_table_cell_values(res) {

    //   // var section_id = res.heading.id_parent;
    //   // var heading_id = res.heading.id;

    //   var date = new Date();
    //   var timestamp = date.getTime();

    //   var new_field = "datatable_" + timestamp;


    //   if (vm.field[new_field]) {

    //     for (var key in res.heading.datatable[0].table_str) {
    //       if (res.heading.datatable[0].table_str[key].cell_value) {

    //         var cell_new_val = res.heading.datatable[0].table_str[key].cell_value;
    //         vm.field[new_field][key] = cell_new_val;
    //       }
    //       else {
    //         vm.field[new_field][key] = null
    //       }

    //     }
    //   }
    // }

    function selectLabel(label) {
      $mdDialog.hide();
      console.log('selectLabel', label)
      // console.log(' $scope.cell_format_for_reports[0].name;',  $scope.cell_format_for_reports[0].name)
      // console.log('vm.selectedRow',  vm.selectedRow)
      // console.log('vm.selectedColumn',  vm.selectedColumn)
      // console.log('vm.selectedIndex',  vm.selectedIndex)

      vm.dataPointId = label.id;

      vm.dataPointName = label.name;
      vm.CheckToSaveFormat();

      console.log('vm.dataPointId', vm.dataPointId)

    }


    function ActionReport(what, chart, chartIndex) {




      console.log('ActionReport', what)
      console.log('vm.reportView', vm.reportView)

      if (what === 'add chart') {
        console.log('in add chart');


        vm.dialog.title = 'Add Chart';
        vm.dialog.name = 'Chart Name';
        vm.dialog.type = 'add chart';

        vm.editDialog = {};

        openReportCommonDialog();

      } else if (what === 'report_duplicate') {


        vm.dialog.title = 'Duplicate Report';
        vm.dialog.name = 'Report Name';
        vm.dialog.type = 'report_duplicate';

        vm.editDialog = {};

        openReportCommonDialog();






      } else if (what === 'export_csv') {

        vm.dialog.type = 'export_csv';

        var data = {
          action_type: 'export_csv',
          report_id: vm.reportView.id,
          report_header: vm.reportView.report_header,
          report_data: vm.reportView.report_data,
          report_datatable: vm.reportView.report_datatable
        }

        console.log('export_csv -- ', data)


        api_request(data);

      } else if (what === 'edit_report') {

        $scope.multiSelectDropdown('update');


        vm.dialog.type = 'edit_report';

        if (!vm.newItem) vm.newItem = {};


        vm.newItem.name = vm.reportView.name;
        vm.newItem.column = vm.reportView.report_datatable[0].column;
        vm.newItem.row = vm.reportView.report_datatable[0].row;

        // vm.newDataTableItem


        var heading = '';
        // var table_id = vm.reportView.table_id;
        var table_str = vm.reportView.report_datatable[0].table_str;

        openDialog('addTable', heading, table_str);

      } else if (what === 'delete_report') {

        vm.dialog.type = 'delete_report';

        vm.title = 'Delete Report';
        vm.warning = 'Warning: This can’t be undone';
        vm.description = "Please confirm you want to delete this <span class='link'>" + vm.reportView.name + "</span><br>All of the contents will be deleted and can’t be recovered"

        deleteAlert();

      } else if (what === 'edit_report_name') {

        vm.dialog.title = 'Edit Name';
        vm.dialog.name = 'Name';
        vm.dialog.type = 'edit_report_name';

        vm.editDialog.name = vm.reportView.name;

        openReportCommonDialog();

      } else if (what === 'delete_chart') {


        vm.dialog.type = 'delete_chart';

        vm.title = 'Delete Chart';
        vm.warning = 'Warning: This can’t be undone';
        vm.description = "Please confirm you want to delete this <span class='link'> Chart - " + chart.chart_data.options.title.text + "</span><br>All of the contents will be deleted and can’t be recovered"


        vm.deleteChartId = chart.id
        vm.DeletedchartIndex = chartIndex;



        deleteAlert();

      } else if (what === 'show_in_dashboard') {

        vm.dialog.type = 'show_in_dashboard';

        var data = {
          action_type: 'show_in_dashboard',
          report_id: vm.reportView.id,
          chart_id: chart.id,
          show_in_dashboard: 1
        }

        vm.selectedChart = chart;



        console.log('show_in_dashboard -- ', data)

        api_request(data);
      }



    }

    function deleteAlert() {
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        clickOutsideToClose: false
      })
    }





    function openReportCommonDialog() {



      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/reports/dialogs/reports/report-edit-section-dialog.html',
        parent: angular.element($document.find('#checklist')),
      });
    }


    function api_request(request) {

      vm.isLoader = true;

      console.log('api_request', request)

      // //

      return api.reports.reports(request).success(function (resp) {
        if (resp) {
          if (resp.code == '-1') {
            $rootScope.message(resp.message, 'error')
          } else {


            if (vm.dialog.type === 'add chart') {
              vm.reportView.chart_list = resp.data.chart_list;

              //

              $rootScope.message('Chart is added successfully', 'success')
            } else if (vm.dialog.type === 'delete_report') {
              $rootScope.message('Report is deleted successfully', 'success')

              vm.totalReports.splice(vm.reportViewIndex, 1);

              closeReportDetails()

            } else if (vm.dialog.type === 'delete_chart') {
              $rootScope.message('Chart is deleted successfully', 'success')

              vm.reportView.chart_list.splice(vm.DeletedchartIndex, 1);

            } else if (vm.dialog.type === 'edit_report_name') {
              $rootScope.message('Report updated successfully', 'success')
              vm.reportView.name = vm.editDialog.name;
              vm.reportListNAme = vm.editDialog.name;

            } else if (vm.dialog.type === 'report_duplicate') {
              $rootScope.message('Duplicate report is generated successfully', 'success')
              vm.totalReports.push(resp.data);
              getAllReports();
            } else if (vm.dialog.type === 'export_csv') {
              $rootScope.message('Report is exported in CSV successfully', 'success');
              // resp
              $window.open(resp.data, '_blank');
 
            } else if (vm.dialog.type === 'show_in_dashboard') {
              $rootScope.message('Chart is added to dashboard successfully', 'success');
              vm.selectedChart.show_in_dashboard = 1;
            } else {
              $rootScope.message('Success', 'success')
            }

          }

        }
        vm.isLoader = false;
      });


    }

    function saveDialog() {

      vm.closeDialog();

      if (vm.dialog.type === 'add chart') {

        console.log('saveDialog', vm.editDialog);
        console.log('vm.reportView', vm.reportView);
        console.log('vm.reportView.report_data', vm.reportView.report_data);


        var data = {};


        data.options = {
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                suggestedMin: 0,
                stepSize: 100
              }
            }]
          },
          title: {
            display: true,
            text: 'Total Due By Date'
          }
        }

        data.graphdata = [];
        data.labels = [];
        data.chartType = vm.editDialog.chartType;
        data.options.title.text = vm.editDialog.name;

        vm.reportView.report_data.forEach(function (i) {
          data.labels.push(i.label);
          data.graphdata.push(i.value);
        });

        if (!vm.reportView.chart_list) vm.reportView.chart_list = [];

        // vm.reportView.chart_list.push(data);

        console.log(' data', data)
        console.log(' vm.reportView', vm.reportView)

        var request = {
          report_id: vm.reportView.id,
          action_type: 'chart',
          chart_data: data
        }

        console.log(' edit_report_name -- ', request)

        api_request(request);

        getAllReports()


      } else if (vm.dialog.type === 'edit_report_name') {



        var data = {
          action_type: 'edit_report_name',
          report_id: vm.reportView.id,
          name: vm.editDialog.name
        }

        console.log(' edit_report_name -- ', data)

        api_request(data);
      } else if (vm.dialog.type === 'report_duplicate') {



        var data = {
          action_type: 'report_duplicate',
          report_id: vm.reportView.id,
          name: vm.editDialog.name
        }

        console.log('report_duplicate -- ', data)

        api_request(data);
      }

    }

    function deleteReport() {
      //deleting after confirm

      var data = {
        action_type: 'delete_report',
        report_id: vm.reportView.id
      }

      // var index = vm.reportView.chart_list.indexOf(vm.reportView.chart_list == vm.reportView.id);

      // $scope.array.splice(index, 1);

      if (vm.dialog.type === 'delete_chart') {
        data.action_type = 'delete_chart';
        data.chart_id = vm.deleteChartId;
      }

      console.log('delete_report -- ', data)


      api_request(data);
    }




    $scope.openDatapointDialog = function (ev) {
      // if(!$rootScope.user) $rootScope.login();

      console.log('openDatapointDialog');

      vm.labels.selectable = $rootScope.user.dashboard.labels;
        

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-set-labels-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        skipHide: true,
      });

    }

    function reportDetails(report, index) {
      console.log('reportDetails', report)
      console.log('index', index)



      vm.closeList = true

      vm.reportListNAme = report.name;
      vm.reportView = report;

      vm.reportView.report_data.forEach(function (val) {

        vm.reportView.report_datatable[0].table_str.forEach(function (rep) {

          if (rep.index == val.index) {
            // if(rep.col_no === val.col && rep.row_no === val.row ){

            rep.final_Val = val.value

          }
        });
      });
      1
      vm.reportView.report_datatable[0].table_str.forEach(function (path) {
        if (path.col_no.length) {
          path.col = dataTable.convertLetterToNumber(path.col_no);
        }
      });

      // vm.reportView.report_data.forEach(function (path){    
      //   if(path.col.length){
      //     path.col = dataTable.convertLetterToNumber(path.col)



      //   } 
      // });



      vm.reportViewIndex = index;

      vm.CountColSpan = vm.reportView.report_header.length;
      if (vm.CountColSpan < 3) vm.CountColSpan = 1;
      else vm.CountColSpan = vm.CountColSpan - 1

      vm.CountColSpan


    }

    //   $scope.getNumber = function(num) {

    //     return new Array(num);   
    // }

    function closeReportDetails() {
      vm.closeList = false;
    }

    //////////////////////// dropdown-multiselect starts /////////////////////////////////////
    // if(!$rootScope.user) $rootScope.login();

    // $scope.$watch(function() {
    //   return  $rootScope.user;
    // }, 

    $scope.multiSelectDropdown = function (action) {
      $scope.myDropdownModel = [];
      $scope.myDropdownOptions = $rootScope.user.dashboard.orgUsers;

   

      if (action === 'new') {
        // $scope.myDropdownModel = [$scope.myDropdownOptions[0]];
        $scope.myDropdownOptions.forEach(function (option) {
          $scope.user_id
          
          if (option.id === parseInt($scope.user_id)) {
            $scope.myDropdownModel.push(option);
     
          }

        });

      } else {

        // creating an array of users of selected report
        $scope.myDropdownOptions.forEach(function (option) {
          vm.reportView.report_users.forEach(function (user) {
            if (option.id === user.id) {
              $scope.myDropdownModel.push(option);
            }
          });
        });

      }


      $scope.myDropdownSettings = {
        styleActive: true,
        checkBoxes: true,
        scrollable: true,
        selectedToTop: true,
        scrollableHeight: 'auto',
        enableSearch: true,
        // smartButtonTextProvider(selectionArray) {
        //   if (selectionArray.length === 1) {
        //     return selectionArray[0].label;
        //   } else {
        //     return selectionArray.length + ' Selected';
        //   }
        // }
      };

      if ($scope.myDropdownOptions.length > 3) {
        $scope.myDropdownSettings.scrollableHeight = '300px';
      }



    }
    // }, true);



    // $scope.myDropdownOptions = [{
    //   id: "S",
    //   label: "Standard"
    // }, {
    //   id: "I",
    //   label: "Intermediate"
    // }, {
    //   id: "B",
    //   label: "Best available"
    // }, 
    // {
    //   id: "S",
    //   label: "Standard"
    // }, {
    //   id: "I",
    //   label: "Intermediate"
    // }, {
    //   id: "B",
    //   label: "Best available"
    // }];

    // $scope.myDropdownModel = [$scope.myDropdownOptions[0]];
    // $scope.myDropdownTranslation = {
    //   searchPlaceholder: 'Search USer'
    // };


    // http://dotansimha.github.io/angularjs-dropdown-multiselect/docs/#/main

    ///////////////////////////// dropdown-multiselect ends ////////////////////////////////


    //Alert Cancel an close
    $scope.hide = function () {

      console.log('$scope.hide ')
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      console.log('$scope.cancel ')
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {

      console.log('$scope.answer ')

      $mdDialog.hide(answer);

      // if(vm.dialog.type == 'delete_report'){
      deleteReport();
      // }
    };


    // Content sub menu
    vm.submenu = [
      { link: 'summary', title: 'Issues', active: false },
      { link: 'schedule', title: 'Schedules', active: false },
      { link: 'reports', title: 'Reports', active: true },
      { link: 'dashboard', title: 'Dashboard', active: false }
    ];


    $('.Communicate').removeClass('communicate');
    $('.Analyze').addClass('analyze');
    $('.Process').removeClass('opacity1');

  }


})();