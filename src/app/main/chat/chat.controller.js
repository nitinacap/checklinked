(function () {
  'use strict';

  angular
    .module('app.chat')
    .controller('ChatController', ChatController);

  /** @ngInject */
  function ChatController($rootScope, $state, $stateParams, $scope, $filter, $mdSidenav, $timeout, $document, $mdMedia, api) {

    var vm = this;

    var id;
    var type;
    vm.contacts = [];
    vm.user = $rootScope.user;
    var array_test = [];
    vm.leftSidenavView = false;
    vm.chat = undefined;
    vm.newPost = {
      text: '',
      submitting: false
    };
    var ref;

    vm.viewingConversation = {
      id: id,
      type: type
    };

    // Methods
    vm.getChat = getChat;
    vm.toggleSidenav = toggleSidenav;
    vm.toggleLeftSidenavView = toggleLeftSidenavView;
    vm.reply = reply;
    vm.setUserStatus = setUserStatus;
    vm.clearMessages = clearMessages;
    vm.showWhichInviteContactData = showWhichInviteContactData;
    vm.openConversation = openConversation;
    vm.setSocketStuff = setSocketStuff;
    vm.submitPost = submitPost;
    vm.old = old;
    vm.closeConversation = closeConversation;
    vm.pushPosts = pushPosts;
    vm.postProcessPosts = postProcessPosts;
    vm.getLatestPosts = getLatestPosts;

    vm.passID = $stateParams.passID;

    console.log('vm.passID', vm.passID);

    //Build Fetch contactsTest
    var i = '';
    var contacts = [];
    var switchUser;
    var contactsTest = [];
    //var vm.contactsTest = [];

    api.contacts.get().then(function (d) {
      contacts = d.data.friendships;

      for (i = 0; i < contacts.length; i++) {
        switchUser = showWhichInviteContactData(contacts[i]);
        //console.log('contacts[i].accepted', i, contacts[i].accepted);
        //Switch array
        if ((contacts[i].accepted != '') && (contacts[i].accepted != '') && (contacts[i].accepted !== void 0) && (switchUser == 'accepter')) {
          console.log('contacts[i].accepted', contacts[i].accepted);
          vm.contacts[i] = contacts[i].contacts.accepter;
          vm.contacts[i].accepted = contacts[i].accepted;
          vm.contacts[i].contact_id = contacts[i].id;
          vm.contacts[i].rid = contacts[i].rid;
        }

        if ((contacts[i].accepted != '') && (contacts[i].accepted != '') && (contacts[i].accepted !== void 0) && (switchUser == 'originator')) {
          console.log('contacts[i].accepted', i, contacts[i].accepted);
          vm.contacts[i] = contacts[i].contacts.originator;
          vm.contacts[i].accepted = contacts[i].accepted;
          vm.contacts[i].contact_id = contacts[i].id;
          vm.contacts[i].rid = contacts[i].rid;
        }
      }
      console.log('contacts processed', vm.contacts);

      if(vm.passID){

        console.log('we are here', vm.contacts.length);

          for (var i = 0; i < vm.contacts.length; i++) {
            if (vm.contacts[i].id === vm.passID) {
              //vm.open(vm.threads[i]);

              console.log('hello charlie', vm.contacts[i]);

              vm.openConversation(vm.contacts[i].contact_id, 'message', vm.contacts[i].name, vm.contacts[i]);

              break;
            }
          }


      }

    });

    vm.contacts.shift = showWhichInviteContactData(vm.contacts);

    function showWhichInviteContactData(friend) {
      var ref2, ref3, ref4;
      if (((ref2 = $rootScope.user) != null ? ref2.idCON : void 0) === (friend != null ? (ref3 = friend.contacts) != null ? (ref4 = ref3.accepter) != null ? ref4.id : void 0 : void 0 : void 0)) {
        return 'originator';
      } else {
        return 'accepter';
      }
    }


    /**
     * Get Chat by Contact id
     * @param contactId
     */
    function getChat(contactId) {


      vm.chatContactId = contactId;


      for (i = 0; i < $rootScope.feed.items; i++) {
        switchUser = showWhichInviteContactData(contacts[i]);
        //Switch array
        if (switchUser == 'accepter') {
          vm.contacts[i] = contacts[i].contacts.accepter;
        } else {
          vm.contacts[i] = contacts[i].contacts.originator;
        }
      }

    }

    /**
     * Reply
     */

    function reply($event) {

      console.log(vm.viewingConversation);

      // If "shift + enter" pressed, grow the reply textarea
      if ($event && $event.keyCode === 13 && $event.shiftKey) {
        vm.textareaGrow = true;
        return;
      }

      // Prevent the reply() for key presses rather than the"enter" key.
      if ($event && $event.keyCode !== 13) {
        return;
      }

      // Check for empty messages
      if (vm.replyMessage === '') {
        resetReplyTextarea();
        return;
      }

      // Message
      var message = {
        who: 'user',
        text: vm.replyMessage,
        timestamp: Date.now()
      };

      // Scroll to the new message
      scrollToBottomOfChat();

      console.log('submitting convo entry', vm.viewingConversation.id, vm.replyMessage, 'message');

      api.conversations.add(vm.viewingConversation.id, vm.replyMessage, 'message').error(function (res) {
        $rootScope.message('Error posting.', 'warning');
      }).success(function (res) {
        if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {
          $rootScope.socketio.emit('message', res.posts[0]);
        }
      })["finally"](function () {
        // Reset the reply textarea
        resetReplyTextarea();
      });

    }

    /**^
     * Clear Chat Messages
     */
    function clearMessages() {
      vm.chats[vm.chatContactId] = vm.chat = [];
      vm.contacts.getById(vm.chatContactId).lastMessage = null;
    }

    /**
     * Reset reply textarea
     */
    function resetReplyTextarea() {
      vm.replyMessage = '';
      vm.textareaGrow = false;
    }

    /**
     * Scroll Chat Content to the bottom
     * @param speed
     */
    function scrollToBottomOfChat() {
      $timeout(function () {
        var chatContent = angular.element($document.find('#chat-content'));

        chatContent.animate({
          scrollTop: chatContent[0].scrollHeight
        }, 400);
      }, 0);

    }


    /**
     * Set User Status
     */
    function setUserStatus(status) {
      vm.user.status = status;
    }


    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    /**
     * Toggle Left Sidenav View
     *
     * @param view id
     */
    function toggleLeftSidenavView(id) {
      vm.leftSidenavView = id;
    }

    /**
     * Array prototype
     *
     * Get by id
     *
     * @param value
     * @returns {T}
     */
    Array.prototype.getById = function (value) {
      return this.filter(function (x) {
        return x.id === value;
      })[0];
    };


    function openConversation(id, type, name, contact) {

      console.log('id', id);
      console.log('type', type);
      console.log('name', name);
      console.log('contact', contact);

      if (type == null) {
        type = 'post';
      }

      vm.viewingConversation = {
        id: id,
        type: type,
        nameFirst: name.first,
        nameLast: name.last,
        nameFull: name.full,
        organization: contact.organization,
        phone: contact.phone,
        email: contact.email
      };

      console.log('vm.viewingConversation', vm.viewingConversation);

      console.log('opening conversation', vm.viewingConversation);
     

      $rootScope.socketio.emit('join', "/conversation/" + vm.viewingConversation.id);
      vm.getLatestPosts(vm.viewingConversation.id, vm.viewingConversation.type);

      // Reset the reply textarea
      resetReplyTextarea();

      // Scroll to the last message
      scrollToBottomOfChat();

      if (!$mdMedia('gt-md')) {
        $mdSidenav('left-sidenav').close();
      }

      // Reset Left Sidenav View
      vm.toggleLeftSidenavView(false);
    };


    vm.loading = {
      posts: true
    };

    function old(ts) {
      var now, old, post;
      if (typeof ts.getTime() !== 'function') {
        return false;
      }
      now = Math.round(new Date().getTime() / 1000);
      old = now - (12 * 3600);
      post = Math.round(ts.getTime() / 1000);
      console.log('calculating age', ts, now, old, post, post < old);
      return post < old;
    };

    vm.conversation = {
      id: vm.viewingConversation.id,
      posts: [],
      name: '',
      currentSkip: 0
    };

    console.log('vm.conversation', vm.conversation);

    ///////SET UP THE SOCKET CONNECTION FOR REALTIME

    function setSocketStuff() {
      console.log('setting socket stuff (convo)');
      //$rootScope.socketio.emit('join', "/conversation/" + vm.viewingConversation.id);
      return $rootScope.socketio.on('message', function (post) {
        var notifyItem;
        console.log('message received', post);
        if (post.idFDI && post.id_contact === $rootScope.user.idCON) {
          notifyItem = $.extend({}, post, {
            type: 'post'
          });
          console.log('about to sent notify event', notifyItem);
          $rootScope.socketio.emit('notify', [notifyItem]);
        }

        return vm.pushPosts(vm.postProcessPosts([post]));
      });
    };
    if ((ref = $rootScope.socketio) != null ? ref.connected : void 0) {
      console.log('socket was already connected (convo)');
      vm.setSocketStuff();
    }
    $scope.$on('event:socketConnected', function () {
      console.log('received ng event:socketConnected (convo)');
      return vm.setSocketStuff();
    });

    function postProcessPosts(posts) {
      console.log('post processing posts', posts);
      for (i = 0; i < posts.length; i++) {

        if ($rootScope.user.idCON == posts[i].id_contact) {
          posts[i].who = 'user';
        } else {
          posts[i].who = 'contact';
          //	vm.chat.name = vm.chat[i].user
        }

      }
      console.log('posts postprocessed', posts);
      return posts;
    }

    function getLatestPosts(id) {

      //console.log('$rootScope.feed.items.length', $rootScope.feed.items.length);

      /*for(i = 0; i < $rootScope.feed.items.length; i++) {

       if($rootScope.feed.items[i].user.id  == id)
       {
       vm.conversation.id = $rootScope.feed.items[i].item.id;
       vm.contactname = $rootScope.feed.items[i].user.name;
       break;
       }
       vm.conversation.id = 0;
       }*/
      api.conversations.get(vm.viewingConversation.id, vm.viewingConversation.currentSkip).success(function (res) {

        vm.chat = [];
        if (res !== undefined && res != null && res != '' && !res.code) {
          vm.chat = vm.postProcessPosts(res.posts);
        }


        console.log('vm.chat', vm.chat);

      })["finally"](function () {
        return vm.loading.posts = false;

      });
      scrollToBottomOfChat();
    };


    function pushPosts(posts, filter) {
      console.log('checking received message(s)', posts, filter);
      var i, len, post, ref1, results;
      if (filter == null) {
        filter = $filter;
      }
      if (posts != null ? posts.length : void 0) {
        for (i = 0, len = posts.length; i < len; i++) {
          post = posts[i];
          if (post.id_parent === vm.viewingConversation.id) {
            if (!((ref1 = $filter('filter')(vm.chat, {
                rid: post.rid
              }, true)) != null ? ref1.length : void 0)) {
              vm.chat.push(post);
              vm.conversation.currentSkip++;
              scrollToBottomOfChat();
              console.log('post accepted', post);
            } else {
              console.log('post rejected: already added', post);
            }
          } else {
            console.log('post rejected: not this convo', post);
          }
        }
      }
    };

    function submitPost() {
      $scope.newPost.submitting = true;
      console.log('submitting convo entry', vm.viewingConversation, vm.replyMessage, vm.newPost.text);
      return ConversationService.add(vm.viewingConversation.id, vm.replyMessage, 'post').error(function (res) {
        return $rootScope.message('Error posting.', 'warning');
      }).success(function (res) {
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          return $rootScope.socketio.emit('message', res.posts[0]);
        }
      })["finally"](function () {
        return vm.newPost = {
          text: '',
          submitting: false
        };
      });
    };



    if ($stateParams.id !== undefined && $stateParams.id != null) {

      console.log('user id', $stateParams.id);

      //vm.openConversation(contact.contact_id, 'message', contact.name, contact)
    }


    function closeConversation() {
      return $uibModalInstance.dismiss('cancel');
    };

    // Content sub menu
    vm.submenu = [
      { link: '#', title: 'Alerts' },
      { link: '#', title: 'Action Items' },
      { link: '', title: 'Messages' },
      { link: 'mail.threads', title: 'Notifications' },
      { link: 'invitations', title: 'Invitations' }

    ];


  }
})();
