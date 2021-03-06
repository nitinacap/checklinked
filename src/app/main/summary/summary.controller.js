(function () {
  'use strict';

  angular
    .module('app.summary')
    .controller('summaryController', summaryController);

  /** @ngInject */
  function summaryController($rootScope, $http, $scope, api, $mdSidenav, $mdDialog, $document, $cookies, $timeout, $filter, $location, $state) {
    var vm = this;

    vm.toggleSidenav = toggleSidenav;
    vm.isLoader = true;
    vm.viewChecklistAsUser = viewChecklistAsUser;
    vm.showComparison = showComparison;
    vm.requestReportsProgress = requestReportsProgress;
    vm.openConversationDialog = openConversationDialog;
    vm.openContactDialog = openContactDialog;


    var userpermission = $cookies.get("userpermission");
    vm.checkIsPermission = userpermission ? JSON.parse(userpermission) : '';
    vm.closeDialog = closeDialog;



    
    function openContactDialog(contact) {

      vm.contact = angular.copy(contact);
      console.log( vm.contact);

     // vm.contact = contact;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/summary/dialogs/organization-dialog.html',
        parent: angular.element($document.find('#contacts')),
        clickOutsideToClose: true
      });
    }



    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }
    function closeDialog() {
      $mdDialog.hide();
    };

    vm.reports = {
      list: [],
      loading: false,
      requesting: false,
      error: null,
      viewing: false,
      viewingSub: false,
      progress: false,
      progressDuration: 10000,
      success: false,
      refresh: function () {
        vm.reports.loading = true;
        vm.reports.viewing = false;
        return api.summary.reports.get().success(function (res) {
         
          vm.isLoader = false;
          if (res.code == '-1') {
            if(res.message=='unauthorized access'){
              $state.go('app.logout');
            }else{
    
              // $scope.subscriptionAlert(res.message);
              $rootScope.message(res.message, 'error')
            }
          }
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Reports not loaded.', 'warning');
          } else if (res.code) {
            // return $rootScope.message("Error loading reports: (" + res.code + ": " + res.message + ")");
          } else {

            // api.checklists.get().success(function (res) {
            //   var ref;
            //   if ((ref = res.checklists) != null ? ref.length : void 0) {
            //     $rootScope.checklists = res.checklists;
            //   }
            //   $rootScope.loaded.checklists = true;
          
              
            //   console.log('$rootScope.checklists issue--- ', $rootScope.checklists)

            // })["finally"](function () {
              
              
            // });
            
         
            res.reports.forEach(function (report, index) {
              var checklists;
              checklists = [];
              // index
        
               $rootScope.checklists
              report.idsCHK.forEach(function (idCHK) {
                var checklist;
                checklist = $filter('filter')($rootScope.checklists, {
                 idCHK: idCHK
                });
                
                if (checklist !== void 0 && checklist.length) {
                  checklist = JSON.parse(JSON.stringify(checklist[0]));
                  checklist.lines = $filter('filter')(report.lines, {
                    idCHK: idCHK
                  });
                  
                  return checklists.push(checklist);
                }
              });
              
              // report.lines.forEach(function (line) {
                  
                report.chk_count = $scope.initChecklist(report.lines)
                report.all_act_users = vm.total_active_us(report)
              

           
              
              console.log(' -----------');
              console.log(' TEst it loaded reports', report.checklists);
              
              console.log(' -----------');
              return report.checklists = checklists;
            });
            console.log('loaded reports', res.reports);
            vm.isLoader = false;
             
            return vm.reports.list = res.reports;

           
          }
        }).error(function (err) {
          return $rootScope.message('Unable to load reports.', 'warning');
        })["finally"](function () {
          return vm.reports.loading = false;
        });
      },
      request: function () {
        vm.isLoader = true;
        vm.reports.requesting = true;
        vm.reports.progress = true;
        // vm.requestReportsProgress(vm.reports.progressDuration);
        //  
        $rootScope.message("Report is being processed. Please wait for a while to see the result.");
        return api.summary.reports.request().success(function (res) {
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Report not requested.', 'warning');
          } else if (res.code) {
            return $rootScope.message("Error requesting report: (" + res.code + ": " + res.message + ")");
          } else {
            // vm.reports.refresh();
            vm.reports.success = true;
             
            vm.reports.refresh();
            //report = vm.reports.list[0];
            //vm.reports.view(report, 0);
            // res.posts;
            vm.reports.progress = false;
            $rootScope.message("Report has processed completely.");
          }

          vm.isLoader = false;
        }).error(function (err) {
          vm.isLoader = false;
          return $rootScope.message('Unable to request report.', 'warning');
        })["finally"](function () {
          vm.isLoader = false;
          return vm.reports.requesting = false;
        });
      },
      delete: function (id) {

        return api.summary.reports.delete(id).success(function (res) {
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Report not requested.', 'warning');
          } else if (res.type=='success') {
             
           vm.reports.refresh();
           $rootScope.message("Report has been deleted successfully ", 'success');
          // return  vm.reports.list = res.reports;
          }
        }).error(function (err) {
          return $rootScope.message('Unable to request report.', 'warning');
        })["finally"](function () {
          //return vm.reports.requesting = false;
        });
      },
      view: function (report, id, tot_issues) {
         
        var i;
        var x;
        console.log('report', report);
        console.log('lines',  vm.reports.viewing.lines);
        console.log('checklist', vm.reports.viewing.checklists);
       
        vm.reports.viewing = report;
        vm.reports.viewing.id = id;
        vm.reports.success = false;
        vm.TotalIssueReport = tot_issues;
         
 
        console.log('vm.reports.viewing', vm.reports.viewing);

        for (i = 0; i < vm.reports.viewing.idsCHK.length; i++) {
          console.log('vm.reports.viewing.idCHK[index] i-', i, vm.reports.viewing.idsCHK[i]);
          
          for (x = 0; x < vm.reports.viewing.lines.length; x++) {
             
            console.log('vm.reports.viewing.lines[index] x -', x, vm.reports.viewing.lines[x]);
            console.log('vm.reports.viewing.checklists i -', i, vm.reports.viewing.checklists[i]);
            
            if(vm.reports.viewing.checklists ){
              if (vm.reports.viewing.checklists[i].idCHK === vm.reports.viewing.lines[x].idCHK) {
                 
                return vm.reports.viewSub(vm.reports.viewing.checklists[i], i, vm.reports.viewing.checklists[i].lastActive);
              }
            }
            
          }
        }
        console.log('vm.reports.viewing', vm.reports.viewing);
      },
      viewSub: function (checklist, id, lastActive) {
        console.log('checklist', checklist);
        console.log('id', id);
        
        $scope.initChecklist(vm.reports.viewing.lines);

        vm.reports.viewingSub = checklist;
        vm.reports.viewingSub.id = id;
        vm.reports.viewingSub.lastActive = lastActive;
        console.log('vm.reports.viewingSub', vm.reports.viewingSub);
        // 
      },
      clear: function () {
        console.log('vm.reports.viewing', vm.reports.viewing);
        console.log('vm.reports.viewingSub', vm.reports.viewingSub);
        vm.reports.viewing = false;
        vm.reports.viewingSub = false;
      },
      countReports: function (report) {

        var counterLine;
        var checklistsArray;
        var i;
        var x;
        counterLine = 0;
        checklistsArray = [];

        console.log('report.checklists.length', report.checklists.length);

        /*
         for (i = 0; i < report.checklists.length; i++) {

         console.log('report.checklists[index]', report.checklists[i]);

         for (x = 0; x < report.lines.length; x++) {

         console.log('report.lines[index]', report.lines[x]);

         if (report.checklists[i].idCHK === report.lines[x].idCHK) {
         counterLine++;
         checklistsArray.push(report.checklists[i].idCHK);


         }
         }
         }
         */
        //console.log('counterLine', counterLine);
        //console.log('checklistsArray', checklistsArray);
      }
    };

    // vm.total_active_users = function ($index) {
    //   // // ;
    //   var tot_active_users_all = 0;
    //   var arr = [];
    //   var idChk_arr = [];
    //   //var report_len = vm.reports.list.length;
    //   var report = vm.reports.list[$index];
    //  // // ;
    //     if(report.lines.length > 0){
    //         for(var i= 0;i<report.lines.length;i++){
    //           var cur_idChk = report.lines[i].idCHK;
    //           if(idChk_arr.indexOf(cur_idChk) === -1){
    //             tot_active_users_all  += parseInt(report.lines[i].counts.active_users);
    //             idChk_arr.push(report.lines[i].idCHK);
    //           }
             
    //         }
    //     }        
    //    // // ;
    //     return tot_active_users_all;

    // }

    vm.total_active_us = function (report) {
      // // ;
      var tot_active_users_all = 0;
      var arr = [];
      var idChk_arr = [];
      //var report_len = vm.reports.list.length;
      // var report = vm.reports.list[$index];
     // // ;
        if(report.lines.length > 0){
            for(var i= 0;i<report.lines.length;i++){
              var cur_idChk = report.lines[i].idCHK;
              if(idChk_arr.indexOf(cur_idChk) === -1){
                tot_active_users_all  += parseInt(report.lines[i].counts.active_users);
                idChk_arr.push(report.lines[i].idCHK);
              }
             
            }
        }        
        return tot_active_users_all;

    }
    
    vm.total_issues_msg = function (lines) {
      var tot_issue = 0;
      var tot_msg = 0;
      var tot_active_users = 0;
      var req_user_msg = 0;
      var arr = [];
      var idChk_arr = [];
        if(lines.length > 0){
            for(var i= 0;i<lines.length;i++){
              // if(i== 0){
              //   tot_msg  += parseInt(lines[i].requested_users_post);  
              // }
            
              tot_issue  += parseInt(lines[i].tot_count_conflicts) + parseInt(lines[i].tot_count_non_compliants);

              tot_msg  += parseInt(lines[i].counts.posts);              
                // tot_active_users  = i+1; 
                var cur_idChk = lines[i].idCHK;
                if(idChk_arr.indexOf(cur_idChk) === -1){
                  tot_msg  += parseInt(lines[i].count_posts_users);   
                  tot_active_users  += parseInt(lines[i].counts.active_users);
                  idChk_arr.push(lines[i].idCHK);
                }

               
            }
        }
        arr['tot_issue'] = tot_issue;
        arr['tot_msg'] = tot_msg;
        arr['tot_active_users'] = tot_active_users;
        return arr;
   

    }

    $scope.initChecklist = function (lines) {
        
      var idChk_arr = [];
      var chk_count = 0;
  
      if(lines.length > 0){
          for(var i= 0;i<lines.length;i++){
            var cur_idChk = lines[i].idCHK;
              if(idChk_arr.indexOf(cur_idChk) === -1){
                chk_count++;
                idChk_arr.push(cur_idChk);
              }

             
          }
         
        }
        console.log('chk_count', chk_count)
        console.log('idChk_arr', idChk_arr)
        vm.chk_count = chk_count;
       
        return chk_count;

    }

    // vm.total_msg = function (lines) {
    //   var tot_msg = 0;
    //     if(lines.length > 0){
    //         for(var i= 0;i<lines.length;i++){
            
    //           tot_msg  += parseInt(lines[i].counts.posts);
               
    //         }
    //     }
    //     return tot_msg;
    //     // ;

    // }


   

    function viewChecklistAsUser(checklist, user) {
      console.log('checklist', checklist);
      console.log('about to view as', user);
      return $rootScope.viewAs.select(user).then(function () {
        console.log('viewing as', user);
        console.log('about to nav to', checklist, $rootScope.viewAs.notMe);
        // 
        if ($rootScope.viewAs.notMe) {
          return $location.path("/checklist/detail/" + checklist.idCHK);
        }
      });
    };

    function showComparison(checklist, user, conflicts) {
      // // ;
      //console.log('checklist', checklist);
      console.log('conflicts', conflicts);
      //console.log('user', user);

      var showMe, showThem, sections, headings;

      showMe = {
        idCON: $rootScope.user.idCON,
        name: $rootScope.user.name.first
      };
      showThem = {
        idCON: user.idCON,
        name: user.name.first
      };

      /* insert vars from summary object here */

      sections = conflicts.idsCSCT;
      headings = conflicts.idsCHEAD;

      /*
      sections = [
        '11505481898883747996225093170054566696',
        '210035106508187953978294279645093564028',
        '290218477939258676658483551149704164901',
        '280337413950814899753635094328131491910'
      ];

      headings = [
        '222286172029066931044419024754067486563',
        '164952131789207838303693072410561785534',
        '7979676763804049159026288640890832749',
        '329258194158486837152271106676525396705'
      ];
      */


      //console.log('conflicts2', conflicts2);
      $rootScope.showingUsers = [showMe, showThem];

      //console.log('about to show comparison between', $rootScope.showingUsers);
      //return $location.path("/checklist/detail/" + checklist.idCHK);
      $state.go('app.checklist.conflicts', { id: checklist.idCHK, checklist: checklist, sections: sections, headings: headings, items: conflicts.idsITEM });
    };

    function requestReportsProgress(duration) {
      $timeout(function () {
        var report;
        vm.reports.success = true;
         
        vm.reports.refresh();
        //report = vm.reports.list[0];
        //vm.reports.view(report, 0);
        vm.reports.progress = false;
      }, duration);
    }

    function openConversationDialog(type, id, name, userName) {

      console.log('id', id);
      console.log('name', name);
      console.log('type', type);

      $mdDialog.show({
        controller: 'ChecklistConversationDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-conversation-dialog.html',
        parent: angular.element($document.find('#summary')),
        //targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          convoId: id,
          convoName: name,
          userName:userName,
          producerType: type
        }
      });
    }

    $scope.$on('event:checklistsLoaded', function () {
      if (!vm.reports.loading) {
         
        return vm.reports.refresh();
      }
    });

    //Subscription expired alert
    $scope.subscriptionAlert = function (message) {
      vm.title = 'Alert';
      vm.message = message;
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/teammembers/dialogs/subscription-alert.html',
        clickOutsideToClose: false
      });
    }

     
    vm.reports.refresh();
    // Content sub menu
    vm.submenu = [
      { link: 'summary', title: 'Issues', active : true },
      { link: 'schedule', title: 'Schedules', active : false },
      { link: 'reports', title: 'Reports', active : false },
      { link: 'dashboard', title: 'Dashboard', active : false }
    ];

    $('.Communicate').removeClass('communicate');
    $('.Analyze').removeClass('analyze');
    $('.Process').removeClass('opacity1');



  }

})();
