(function () {
  'use strict';

  angular
    .module('app.checklist')
    .controller('ChecklistConversationDialogController', ChecklistConversationDialogController);

  /** @ngInject */
  function ChecklistConversationDialogController($mdDialog, api, convoId, convoName, producerType, $document, $mdSidenav, $http, $rootScope, $scope, $filter) {

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
      console.log('setting socket stuff (convo)');
      vm.socketStuffSet = true;
      $rootScope.socketio.emit('join', "/conversation/" + vm.convoId);
      if ($rootScope.socketio._callbacks['$message'] === void 0) {
        console.log('socket message callback is not set up; setting now', $rootScope.socketio);
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
      console.log('socket was already connected (convo)');
      vm.setSocketStuff();
    }

    $scope.$on('event:socketConnected', function () {
      console.log('received ng event:socketConnected (convo)');
      return vm.setSocketStuff();
    });

    function getLatestPosts() {

      console.log('vm.conversation.id', vm.conversation.id);

      console.log('vm.conversation.currentSkip', vm.conversation.currentSkip);

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
      console.log('posts', posts);
      console.log('filter');
      var i, len, post, ref1, results;
      if (filter == null) {
        filter = $filter;
      }
      console.log('pushing posts', posts);
      if (posts != null ? posts.length : void 0) {
        results = [];
        for (i = 0, len = posts.length; i < len; i++) {
          post = posts[i];
          if (post.id_parent === vm.conversation.id) {
            console.log('post accepted', post);
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

    function submitPost() {
      vm.newPost.submitting = true;
      console.log('vm.type', vm.type);
      console.log('submitting convo entry', vm.conversation.id, vm.newPost.text, vm.itemType, vm.producerType);
      return api.conversations.add(vm.conversation.id, vm.newPost.text, vm.itemType, vm.producerType).error(function (res) {
        return $rootScope.message('Error posting.', 'warning');
      }).success(function (res) {
        if (res.type=='success') {
          vm.newPost.submitting = false;
          vm.newPost.text = '';
          vm.conversation.posts.unshift(res.posts[0]);
         // vm.conversation.posts.unshift(res.posts[0]);
         // return $rootScope.socketio.emit('message', res.posts[0]);
        }  else {
          return $rootScope.message(res.message, 'warning');

          //return $rootScope.socketio.emit('message', res.posts[0]);
        }
      })["finally"](function () {
       // vm.closeDialog();
        /*
         return vm.newPost = {
         text: vm.newPost.text,
         submitting: false
         };
         */
      });
    };

    function closeDialog() {
      $mdDialog.hide();
    }

    vm.getLatestPosts();
  }

})();
