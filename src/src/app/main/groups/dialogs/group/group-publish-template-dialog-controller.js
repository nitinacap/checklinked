(function ()
{
    'use strict';

    angular
        .module('app.groups')
        .controller('GroupPublishTemplateDialogController', GroupPublishTemplateDialogController);

    /** @ngInject */
    function GroupPublishTemplateDialogController($mdDialog, api, id, name, description, $document, $mdSidenav, $http, $rootScope, $scope) {

        var vm = this;
	vm.publishTemplate = publishTemplate;

	vm.publish = {
      id: id,
      name: name,
      description: description ? description : '',
      pvt: false,
      submitting: false,
      togglePrivate: function() {
        this.pvt = !this.pvt;
        return true;
      }
     }

     console.log('vm.publish', vm.publish);

        // Data
        vm.title = 'Publish Template';
		vm.closeDialog = closeDialog;

	function closeDialog() {
    	$mdDialog.hide();
    }



      function publishTemplate() {
      	console.log('vm.publish.id', vm.publish.id);
      	console.log('vm.publish.name', vm.publish.name);
        var ref, ref1;
        if (((ref = vm.publish.id) != null) && ((ref1 = vm.publish.name) != null)) {
        //if (((ref = vm.publish.id) != null ? ref.length : void 0) && ((ref1 = vm.publish.name) != null ? ref1.length : void 0)) {
          vm.publish.submitting = true;
          return api.checklists.publish(vm.publish.id, vm.publish.name,vm.publish.description, 'group', vm.publish.pvt).error(function(res) {
            return $rootScope.message('Unknown error publishing Group Template.', 'warning');
          }).success(function(res) {
            if (res.code) {
              return $rootScope.message("Error publishing Group Template. (" + res.code + ": " + res.message + ")", 'warning');
            } else {
              $rootScope.message("Group Template published successfully.");
              //close
              vm.closeDialog();

            }
          })["finally"](function() {
            vm.publish.submitting = false;
            vm.publish.id = null;
            return vm.publish.name = null;
          });
        } else {
          return $rootScope.message('You must specify the Group Template Name.', 'warning');
        }
      }





	/*
    vm.publish = {
      idCHK: null,
      name: null,
      pvt: false,
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
      	console.log('vm.publish.name', vm.publish.name, idCHK, vm.publish.pvt);
        var ref1, ref2;
        if (((ref1 = idCHK) != null ? ref1.length : void 0) && ((ref2 = vm.publish.name) != null ? ref2.length : void 0)) {
          vm.publish.submitting = true;
          return api.checklists.publish(idCHK, vm.publish.name, vm.publish.pvt).error(function(res) {
            return $rootScope.message('Unknown error publishing Template.', 'warning');
          }).success(function(res) {
            if (res.code) {
              return $rootScope.message("Error publishing Template. (" + res.code + ": " + res.message + ")", 'warning');
            } else {
              $rootScope.message("Template published successfully.");
              return vm.closeDialog();
            }
          })["finally"](function() {
            vm.publish.submitting = false;
            idCHK = null;
            return vm.publish.name = null;
          });
        } else {
          return $rootScope.message('You must specify the Template Name.', 'warning');
        }
      }
    };



    */




    }
})();
