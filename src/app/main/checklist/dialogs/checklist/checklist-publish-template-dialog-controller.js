(function ()
{
    'use strict';

    angular
        .module('app.checklist')
        .controller('ChecklistPublishTemplateDialogController', ChecklistPublishTemplateDialogController);

    /** @ngInject */
    function ChecklistPublishTemplateDialogController($mdDialog, api, idCHK,checklist_name, $document, $mdSidenav, $http, $rootScope, $scope)
    {
        var vm = this;
debugger;
    vm.idCHK = idCHK;
        // Data
    vm.title = 'Publish Template';
		vm.closeDialog = closeDialog;

	function closeDialog()
    {
    $mdDialog.hide();
    }


    vm.publish = {
      idCHK: null,
      name: checklist_name ? checklist_name : '',
      pvt: true,
      submitting: false,
      gatherInfo: function(idCHK) {
        vm.publish.idCHK = idCHK;
        return true;
      },
      togglePrivate: function() {
        this.pvt = !this.pvt;
        return true;
      },
      publish: function() {

      	vm.publish.idCHK = vm.idCHK;


      	console.log('vm.publish.name', vm.publish.name);
      	console.log('vm.publish.idCHK', vm.publish.idCHK);
      	console.log('vm.publish.name', vm.publish.pvt);

        var ref1, ref2;
        if (((ref1 = vm.publish.idCHK) != null ? ref1.length : void 0) && ((ref2 = vm.publish.name) != null ? ref2.length : void 0)) {
          vm.publish.submitting = true;
          return api.checklists.publish(vm.publish.idCHK, vm.publish.name,vm.publish.description, 'checklist', vm.publish.pvt).error(function(res) {
            return $rootScope.message('Unknown error publishing Template.', 'warning');
          }).success(function(res) {
            if (res.code) {
              return $rootScope.message("Error publishing Template. (" + res.code + ": " + res.message + ")", 'warning');
            } else {
              $rootScope.message("Template published successfully.");
              vm.closeDialog();
            }
          })["finally"](function() {
            vm.publish.submitting = false;
            vm.publish.idCHK = null;
            return vm.publish.name = null;
          });
        } else {
          return $rootScope.message('You must specify the Template Name.', 'warning');
        }
      }
    };


    }
})();
