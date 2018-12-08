(function ()
{
    'use strict';

    angular
        .module('app.checklist')
        .controller('ChecklistFindGroupTemplateDialogController', ChecklistFindGroupTemplateDialogController);

    /** @ngInject */
    function ChecklistFindGroupTemplateDialogController($mdDialog, api, idCHK, $document, $filter, $mdSidenav, $rootScope, $scope, $http)
    {

     var vm = this;
     
	 vm.title = 'Find Group Template';
             
     vm.find = {
      template: null,
      searchCount: 0,
      searching: false,
      creating: false,
      results: [],
      begin: function(parentID, type) {
        vm.find.template = {
          criteria: {
            name: '',
            organization: '',
            author: '',
            version: '',
            type: type
          },
          parentID: parentID
        };
        vm.find.searching = false;
        vm.find.creating = false;
        vm.find.searchCount = 0;
        vm.find.results = [];
        $("#findTemplate").modal('show');
        return null;
      },
      search: function() {
        vm.find.searching = true;
        if (vm.find.template.criteria.name === '' && vm.find.template.criteria.organization === '' && vm.find.template.criteria.author === '' && vm.find.template.criteria.version === '') {
          $rootScope.message('Please provide Search Criteria', 'warning');
          vm.find.searching = false;
          return false;
        }
        return api.checklists.searchForTemplates(vm.find.template.criteria).error(function(res) {
          return $rootScope.message('Unknown error finding Templates.', 'warning');
        }).success(function(res) {
          if (res.code) {
            res.display = "Error finding Templates: (" + res.code + "): " + res.message;
          }
          vm.find.results.push(res);
          return vm.find.searchCount++;
        })["finally"](function() {
          return vm.find.searching = false;
        });
      },
      create: function(idCTMPL) {
        vm.find.creating = true;
        return api.checklist.createFromTemplate(idCTMPL, vm.find.template.parentID, vm.find.template.criteria.type).error(function(res) {
          return $rootScope.message('Unknown error creating Checklist from selected Template.', 'warning');
        }).success(function(res) {
          if (res.code) {
            return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
          } else {
            if (vm.find.template.criteria.type === 'group') {
              $rootScope.groups.push(res.groups[0]);
            }
            $rootScope.checklists = $rootScope.checklists.concat(res.checklists);
            $rootScope.organizeData();
            return $("#findTemplate").modal('hide');
          }
        })["finally"](function() {
          return vm.find.creating = false;
        });
      }
    };
    
  	
        function closeDialog()
        {
        	console.log('close me');
           	$mdDialog.hide();
        }
  	
        
        
    }
})();