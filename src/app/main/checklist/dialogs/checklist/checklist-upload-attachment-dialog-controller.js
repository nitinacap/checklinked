(function () {
  'use strict';

  angular
    .module('app.checklist')
    .controller('ChecklistUploadAttachmentDialogController', ChecklistUploadAttachmentDialogController);

  /** @ngInject */
  function ChecklistUploadAttachmentDialogController($mdDialog, api, pID, pType, $document, $mdSidenav, $http, $rootScope, $scope) {
    var vm = this;

    vm.pID = pID;
    vm.pType = pType;

    // Data
    vm.title = 'Upload Attachments';
    vm.closeDialog = closeDialog;
    vm.upload = upload;
    vm.uniqueString = uniqueString;

    function closeDialog() {
      $mdDialog.hide();
    }

    function uniqueString() {
      var text = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 8; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

    /* BEGIN IMPORT*/

    vm.sizeLimit = 10585760; // 10MB in Bytes
    vm.uploadProgress = 0;
    vm.creds = {
      bucket: 'checklinked-attachments-temp',
      access_key: 'AKIAI6XHWIU2YCPG6BPA',
      secret_key: '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'
    };

    function upload() {
      console.log('AWS.config', AWS.config);
      //console.log('vm', vm);

      AWS.config.update({accessKeyId: vm.creds.access_key, secretAccessKey: vm.creds.secret_key});
      AWS.config.region = 'us-west-1';
      var bucket = new AWS.S3({params: {Bucket: vm.creds.bucket}});

      vm.file = $('#AWSFileUploadInput')[0].files[0];

      if (vm.file.name) {
        vm.file.label = vm.lable;
        console.log('vm.file', vm.file);
        console.log('vm.file.label', vm.label);
        var fileSize = Math.round(parseInt(vm.file.size));
        if (fileSize > vm.sizeLimit) {
          $rootScope.message('Sorry, your attachment is too big. <br/> Maximum ' + vm.fileSizeLabel() + ' file attachment allowed', 'warning');
          return false;
        }
        // Prepend Unique String To Prevent Overwrites
        var uniqueFileName = vm.uniqueString() + '-' + vm.file.name;
        vm.aws = 'https://s3-us-west-1.amazonaws.com/checklinked-attachments-temp/' + uniqueFileName;

        var params = {Key: uniqueFileName, ContentType: vm.file.type, Body: vm.file, ServerSideEncryption: 'AES256'};

        bucket.putObject(params, function (err, data) {

          api.attachments.add(vm.pID, vm.pType, vm.aws, vm.file.name, vm.file.size, vm.label).error(function (res) {
            return $rootScope.message("Error Uploading Attachment", 'warning');
          }).success(function (res) {
            if (res === void 0 || res === null || res === '') {
              $rootScope.message("Error Adding Attachments", 'warning');
            } else if (res.code) {
              $rootScope.message(res.message, 'warning');
            } else {

              //else code here
            }
          });
          
          if (err) {
            console.log('params', params);
            console.log('data', data);
            console.log('err', err);
            console.log('err.code', err.code);
            $rootScope.message(err.message, err.code, 'warning');
            return false;
          }
          else {
            // Upload Successfully Finished
            $rootScope.message("Attachment Uploaded", 'success');

            vm.checklist.// Reset The Progress Bar
            setTimeout(function () {
              vm.uploadProgress = 0;
              $scope.$digest();
            }, 4000);
          }
        })
          .on('httpUploadProgress', function (progress) {
            vm.uploadProgress = Math.round(progress.loaded / progress.total * 100);
            $scope.$digest();
          });
      }
      else {
        // No File Selected
        $rootScope.message('Please select a file to upload', 'warning');
      }
    }

    vm.fileSizeLabel = function () {
      // Convert Bytes To MB
      return Math.round(vm.sizeLimit / 1024 / 1024) + 'MB';
    };

  }

})();
