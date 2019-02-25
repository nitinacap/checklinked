(function () {
  'use strict';

  angular
    .module('app.checklist')
    .controller('ChecklistConversationDialogController', ChecklistConversationDialogController);

  /** @ngInject */
  function ChecklistConversationDialogController($mdDialog, api, convoId, convoName, producerType, $window , $mdSidenav, $http, $rootScope, $scope, $filter) {

    var vm = this;
    vm.convoId = convoId;
    vm.convoName = convoName;
    vm.title = vm.convoName + ' Conversation';
    vm.producerType = producerType,
    vm.itemType = 'post';
    vm.setSocketStuff = setSocketStuff;
    vm.closeDialog = closeDialog;
    vm.old = old;
    vm.getLatestPosts = getLatestPosts;
    vm.pushPosts = pushPosts;
    vm.submitPost = submitPost;
    vm.form = {
      'from': $rootScope.user.name.full,
      'subject': 'Re: ' + vm.convoName,
      'message': ''
    };

    var ref;
    vm.loading = {
      posts: true
    };

    function old(ts) {
      var now, old, post;
      if (typeof ts.getTime !== 'function') {
        return false;
      }
      now = Math.round(new Date().getTime() / 1000);
      old = now - (12 * 3600);
      post = Math.round(ts.getTime() / 1000);
      return post < old;
    };

    vm.conversation = {
      id: vm.convoId,
      posts: [],
      name: '',
      currentSkip: 0
    };

    function setSocketStuff() {
      vm.socketStuffSet = true;
      $rootScope.socketio.emit('join', "/conversation/" + vm.convoId);
      if ($rootScope.socketio._callbacks['$message'] === void 0) {
        return $rootScope.socketio.on('message', function (post) {
          var notifyItem;
          console.log('message received', post);
          if (post.idFDI && post.id_contact === $rootScope.user.idCON) {
            notifyItem = $.extend({}, post, {
              type: 'post'
            });
            $rootScope.notify(notifyItem);
          }
          vm.pushPosts([post]);
          $scope.$apply();
          $scope.$digest();
        });
      }
    };

    if ((ref = $rootScope.socketio) != null ? ref.connected : void 0) {
      vm.setSocketStuff();
    }

    $scope.$on('event:socketConnected', function () {
      return vm.setSocketStuff();
    });

    function getLatestPosts() {

      return api.conversations.get(vm.conversation.id, vm.conversation.currentSkip).success(function (res) {
        console.log(res);
        return vm.pushPosts(res.posts);
      })["finally"](function () {
        return vm.loading.posts = false;
      });
    };

    vm.newPost = {
      text: '',
      submitting: false
    };

    function pushPosts(posts, filter) {
      var i, len, post, ref1, results;
      if (filter == null) {
        filter = $filter;
      }
      if (posts != null ? posts.length : void 0) {
        results = [];
        for (i = 0, len = posts.length; i < len; i++) {
          post = posts[i];
          if (post.id_parent === vm.conversation.id) {
            if (!((ref1 = $filter('filter')(vm.conversation.posts, {
              rid: post.rid
            }, true)) != null ? ref1.length : void 0)) {
              vm.conversation.posts.unshift(post);
              results.push(vm.conversation.currentSkip += 1);
            } else {
              results.push(console.log('post rejected: already added', post));
            }
          } else {
            results.push(console.log('post rejected: not this convo', post));
          }
        }
        return results;
      }
    };
 $scope.setFile = function(element) {
        $scope.$apply(function($scope) {
            $scope.theFile = element.files[0];
        });
    };
    function submitPost() {
      vm.newPost.submitting = true;
      vm.file_name =  $scope.files ? ($scope.files[0] ? $scope.files[0].name : '') : '';
   
      var fd = new FormData();
      angular.forEach($scope.files, function (file) {
        fd.append('file', file);
      });

      var filedata = { id: vm.conversation.id, text: vm.newPost.text, itemType: vm.itemType, producerType: vm.producerType };
      fd.append('data', JSON.stringify(filedata));


      $http.post(BASEURL + 'posts-post.php', fd, {
        headers: { 'Content-Type': undefined },
        cache: false
      }).error(function (res) {
        return $rootScope.message('Could not send message. Unknown error.', 'warning');
      }).success(function (res) {
        if (res.type == 'success') {
          var fileElement = angular.element('#fileAttachment');
          angular.element(fileElement).val(null);
          $scope.theFile = [];
          vm.file_name = '';
          vm.newPost.submitting = false;
          vm.checklistCionversion = true;
          vm.newPost.text = '';
          vm.conversation.posts.unshift(res.posts[0]);
          // vm.conversation.posts.unshift(res.posts[0]);
          // return $rootScope.socketio.emit('message', res.posts[0]);
        } else {
          return $rootScope.message(res.message, 'warning');
        }
      })
    }


    //   return api.conversations.add(vm.conversation.id, vm.newPost.text, vm.itemType, vm.producerType).error(function (res) {
    //     return $rootScope.message('Error posting.', 'warning');
    //   }).success(function (res) {
    //     if (res.type == 'success') {
    //       vm.newPost.submitting = false;
    //       vm.checklistCionversion = true;
    //       vm.newPost.text = '';
    //       vm.conversation.posts.unshift(res.posts[0]);
    //     } else {
    //       return $rootScope.message(res.message, 'warning');
    //     }
    //   })
    // };

    function closeDialog() {
      $mdDialog.hide();
    }

    vm.downloadConversionAttachment = downloadConversionAttachment;
    function downloadConversionAttachment(ev, location) {
      $window.open(location, '_blank');
    }

    vm.removeFileHttp = removeFileHttp;
    function removeFileHttp(file) {
      var originalFile = file.replace('https://checklinked.azurewebsites.net', '');
      vm.downloadFile = originalFile;
    }


    vm.getLatestPosts();
  }

})();
