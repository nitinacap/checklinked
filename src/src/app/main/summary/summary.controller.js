(function () {
  'use strict';

  angular
    .module('app.summary')
    .controller('summaryController', summaryController);

  /** @ngInject */
  function summaryController($rootScope, $http, $scope, api, $mdSidenav, $mdDialog, $document, $stateParams, $timeout, $filter, $location, $state) {
    var vm = this;

    vm.toggleSidenav = toggleSidenav;

    vm.viewChecklistAsUser = viewChecklistAsUser;
    vm.showComparison = showComparison;
    vm.requestReportsProgress = requestReportsProgress;
    vm.openConversationDialog = openConversationDialog;


    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

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
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Reports not loaded.', 'warning');
          } else if (res.code) {
            return $rootScope.message("Error loading reports: (" + res.code + ": " + res.message + ")");
          } else {
            res.reports.forEach(function (report) {
              var checklists;
              checklists = [];
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
              return report.checklists = checklists;
            });
            console.log('loaded reports', res.reports);
            return vm.reports.list = res.reports;
          }
        }).error(function (err) {
          return $rootScope.message('Unable to load reports.', 'warning');
        })["finally"](function () {
          return vm.reports.loading = false;
        });
      },
      request: function () {
        vm.reports.requesting = true;
        vm.reports.progress = true;
        vm.requestReportsProgress(vm.reports.progressDuration);
        return api.summary.reports.request().success(function (res) {
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Report not requested.', 'warning');
          } else if (res.code) {
            return $rootScope.message("Error requesting report: (" + res.code + ": " + res.message + ")");
          } else {
            vm.reports.list = vm.reports.list.concat(res.reports);
            $rootScope.message("Report is being processed.  Refresh in a little while to see the result.");
          }
        }).error(function (err) {
          return $rootScope.message('Unable to request report.', 'warning');
        })["finally"](function () {
          return vm.reports.requesting = false;
        });
      },
      view: function (report, id) {
        var i;
        var x;
        console.log('report', report);
        vm.reports.viewing = report;
        vm.reports.viewing.id = id;
        vm.reports.success = false;

        for (i = 0; i < vm.reports.viewing.idsCHK.length; i++) {
          //console.log('vm.reports.viewing.idCHK[index]', vm.reports.viewing.idsCHK[i]);
          for (x = 0; x < vm.reports.viewing.lines.length; x++) {
            //console.log('vm.reports.viewing.lines[index]', vm.reports.viewing.lines[x]);
            if (vm.reports.viewing.checklists[i].idCHK === vm.reports.viewing.lines[x].idCHK) {
              return vm.reports.viewSub(vm.reports.viewing.checklists[i], i, vm.reports.viewing.checklists[i].lastActive);
            }
          }
        }
        console.log('vm.reports.viewing', vm.reports.viewing);
      },
      viewSub: function (checklist, id, lastActive) {
        console.log('checklist', checklist);
        console.log('id', id);
        vm.reports.viewingSub = checklist;
        vm.reports.viewingSub.id = id;
        vm.reports.viewingSub.lastActive = lastActive;
        console.log('vm.reports.viewingSub', vm.reports.viewingSub);
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

    function viewChecklistAsUser(checklist, user) {
      console.log('checklist', checklist);
      console.log('about to view as', user);
      return $rootScope.viewAs.select(user).then(function () {
        console.log('viewing as', user);
        console.log('about to nav to', checklist, $rootScope.viewAs.notMe);
        if ($rootScope.viewAs.notMe) {
          return $location.path("/checklist/detail/" + checklist.idCHK);
        }
      });
    };

    function showComparison(checklist, user, conflicts) {
      debugger;
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

       debugger;
      //console.log('conflicts2', conflicts2);
      $rootScope.showingUsers = [showMe, showThem];

      //console.log('about to show comparison between', $rootScope.showingUsers);
      //return $location.path("/checklist/detail/" + checklist.idCHK);
      $state.go('app.checklist.conflicts', {id:checklist.idCHK, checklist:checklist, sections:sections, headings:headings, items:conflicts.idsITEM});
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

    function openConversationDialog(ev, type, id, name) {

      console.log('id', id);
      console.log('name', name);
      console.log('type', type);

      $mdDialog.show({
        controller: 'ChecklistConversationDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-conversation-dialog.html',
        parent: angular.element($document.find('#summary')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          convoId: id,
          convoName: name,
          producerType: type
        }
      });
    }

    $scope.$on('event:checklistsLoaded', function () {
      if (!vm.reports.loading) {
        return vm.reports.refresh();
      }
    });


    vm.reports.refresh();


  }

})();
