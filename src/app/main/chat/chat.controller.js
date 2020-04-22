(function () {
  'use strict';

  angular
    .module('app.chat')
    .controller('ChatController', ChatController);

  /** @ngInject */
  function ChatController($state, $rootScope, $cookies, $stateParams, $scope, $filter, $http, $mdSidenav, $interval, $timeout, $document, $mdMedia, api, $mdDialog) {


    var vm = this;

    var id;
    var type;
    vm.contacts = [];
    vm.user = $rootScope.user;
    var array_test = [];
    vm.leftSidenavView = false;
    vm.chat = undefined;
    vm.isLoader = false;
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
    vm.submitMessage = submitMessage;
    vm.old = old;
    vm.closeConversation = closeConversation;
    vm.pushPosts = pushPosts;
    vm.postProcessPosts = postProcessPosts;
    //vm.getLatestPosts = getLatestPosts;

    vm.passID = $stateParams.passID;
    vm.closeDialog = closeDialog;
    vm.readMessage = readMessage;

    //Build Fetch contactsTest
    var i = '';
    var contacts = [];
    var switchUser;
    var contactsTest = [];
    //var vm.contactsTest = [];
    function closeDialog() {
      $mdDialog.hide();
    };


    // $interval(function(){ // ; $scope.getNewLatestPosts(); }, 10000);

    function livechatchecking() {
      $rootScope.socketio.on('livemessages', function (data) {
        $scope.$apply(function () {
          console.log('livemessages=', data);
          vm.messages[data.index] = data;
          listMenu();
        });
        $('#messageHeight' + data.index).addClass('messagescroll');
        var scroll=$('#messageHeight' + data.index);
        scroll.animate({scrollTop: scroll.prop("scrollHeight")});

      })

    }

    $scope.$watch(function() {
      return  vm.newLivemessage;
    }, function() {
     
      if( vm.newLivemessage){
        console.log('livemessages=', vm.newLivemessage);
        vm.messages[vm.newLivemessage.index] = vm.newLivemessage;
        listMenu();
    
        $('#messageHeight' + vm.newLivemessage.index).addClass('messagescroll');
        var scroll=$('#messageHeight' + vm.newLivemessage.index);
        scroll.animate({scrollTop: scroll.prop("scrollHeight")});
        // 
      }

        
    }, true);





    function readMessage(item) {
      console.log('read msg', item)
      // 
      item.is_read = "1";
      var array = [item.id];
      console.log('read msg array', array)
      if(item.user_id != $scope.user_id_){
        if (item.child_data ) {
          // 
          item.child_data.reduce(function (map, data) {
            if (data.is_read == 0) {
              array.push(data.id);
            }
          });
        }
        if (array && array.length > 0) {
          return api.notifications.read(id, 'notification-count', array).success(function (resp) {
            console.log('list resp',resp)
            if (resp) {
              listMenu();
            }
          })
        }
      }


    }

    $scope.$on('event:socketConnected', function () {
      console.log('haaaaaaa');
      livechatchecking();
    });

    if ((ref = $rootScope.socketio) != null ? ref.connected : void 0) {
      console.log('socket was already connected for testing');
      livechatchecking();
    }




    api.contacts.get().then(function (d) {
      contacts = d.data.friendships;

      if (d.data.code == '-1') {
        // $scope.subscriptionAlert(d.data.message);
        console.log('logout no alert')
        
        if(d.data.message=='unauthorized access'){
          $state.go('app.logout');
        }else{

          $scope.subscriptionAlert(d.data.message);
        
        }
      }

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

      if (vm.passID) {

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
          $rootScope.messageToEmit = res.posts[0];
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
        console.log(' chatContent', chatContent)

        chatContent.animate({
          scrollTop: chatContent[0].scrollHeight
        }, 400);
      }, 2000);

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
      return post < old;
    };

    vm.conversation = {
      id: vm.viewingConversation.id,
      posts: [],
      name: '',
      currentSkip: 0
    };

    // console.log('vm.conversation', vm.conversation);

    ///////SET UP THE SOCKET CONNECTION FOR REALTIME

    $scope.user_id_ = $cookies.get("useridCON")
   

    function setSocketStuff() {
      //$rootScope.socketio.emit('join', "/conversation/" + vm.viewingConversation.id);
      return $rootScope.socketio.on('message', function (post) {
        var notifyItem;
        console.log('message received', post);
        if (post.idFDI && post.id_contact === $rootScope.user.idCON) {
          notifyItem = $.extend({}, post, {
            type: 'post'
          });
          $rootScope.socketio.emit('notify', [notifyItem]);
        }

        return vm.pushPosts(vm.postProcessPosts([post]));
      });

      // $rootScope.messageToEmit

     
    };

    $scope.$watch(function() {
      return   $rootScope.messageToEmit;
    }, function() {

      if($rootScope.messageToEmit){
        var notifyItem;
        console.log('message received', $rootScope.messageToEmit);
        if ($rootScope.messageToEmit.idFDI && $rootScope.messageToEmit.id_contact === $rootScope.user.idCON) {
          notifyItem = $.extend({}, $rootScope.messageToEmit, {
            type: 'post'
          });
          $rootScope.socketio.emit('notify', [notifyItem]);
        }
  
        return vm.pushPosts(vm.postProcessPosts([$rootScope.messageToEmit]));
        // 
      }

      
    }, true);



    if ((ref = $rootScope.socketio) != null ? ref.connected : void 0) {
      console.log('socket was already connected (convo)');
      vm.setSocketStuff();
    }
    $scope.$on('event:socketConnected', function () {
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
      return posts;
    }


  



    //new conversion
    $scope.setFile = function (element) {
      //  var files = document.getElementById(element.id).files[0];
      $scope.$apply(function ($scope) {
        $scope.theFile = element.files[0];
      });
    };
    $scope.getNewLatestPosts = function(id) {
      vm.isLoader = true;
      api.conversations.getnew(id).success(function (res) {
        vm.chat = [];
        vm.isLoader = false;
        if (res.type == 'success') {
          var object = res.posts.data.conversions;
          vm.messages = res.posts.data;
          // 
          vm.directMesage = res.posts.data.contacts;
          // 

        }
      })
    };
    vm.notificationDate = notificationDate;
    vm.unixtimestamp = [];
    function notificationDate(item) {
      if (item && item !== 'undefined' || item !== undefined) {
        vm.unixtimestamp.push((new Date(item.replace('-', '/'))).getTime());

      }
    }
    $scope.getNewLatestPosts($cookies.get('useridCON'));
    vm.msgChOpen = false;
    function submitMessage(message, index, filename, type_of, type, user_id, parent_id) {
     


      vm.isLoader = false;
      vm.file_name = [];
      var text = $("#text" + message.fdi_feed_item_id + index).val();

      var log_user_id = $cookies.get("useridCON");

      user_id = (log_user_id == user_id) ? parent_id : user_id


      var message_to_id = type == 'message' ? user_id : ''

      var files = document.getElementById(filename).files[0];
      vm.file_name[index] = files;

      var fd = new FormData();
      fd.append('file', files);
      var filedata = { id: message.checklist_id ? message.checklist_id : '', text: text, itemType: message.type, producerType: type_of, parent_id: message.parent_id, conversation_from: type, message_to_id: message_to_id };
      fd.append('data', JSON.stringify(filedata));

      $http.post(BASEURL + 'posts-post.php', fd, {
        headers: { 'Content-Type': undefined },
        cache: false
      }).error(function (res) {
        return $rootScope.message('Could not send message. Unknown error.', 'warning');
      }).success(function (res) {
        if (res.type == 'success') {
       
          res.posts[0].index = index;
          vm.msgChOpen = true;
          vm.currentIndex = index;
          $rootScope.message('Message send successfully', 'success');
          $("#text" + message.fdi_feed_item_id + index).val('');;
          var fileElement = angular.element('#fileAttachment');
          angular.element(fileElement).val(null);
          $scope.theFile = [];
          vm.file_name = '';
          vm.newPost.submitting = false;
          vm.checklistCionversion = true;
          $rootScope.socketio.emit('livemessages', res.posts[0]);
          vm.newLivemessage = res.posts[0];
          
          api.notifications.count_notifi();
          vm.messages
          

          //vm.conversation.posts.unshift(res.posts[0]);
        }
      })
    };



    function pushPosts(posts, filter) {
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

    function listMenu() {
     
     
      var user_id = $cookies.get("useridCON").toString();
      api.notifications.count_notifi().success(function (notification) {
        // 

        console.log('listMenu', notification)
        var data = notification.item;
        var message_count = data.message_count;
        var notification_count = data["user_notification" + user_id];
        var alert_count = data["user_alert" + user_id];
        var invites_count = data.invites_count;

        vm.submenu = [
          { link: 'alerts', title: 'Alerts', notification: alert_count, active : false   },
          { link: 'invitations', title: 'Action Items', notification: invites_count, active : false  },
          { link: 'chat.message', title: 'Messages', notification: message_count, active : true  },
          { link: 'notification', title: 'Notifications', notification: notification_count, active : false  }
        ];
        
      });
    }


    listMenu();



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
    setTimeout(function () {
      $('.Communicate').addClass('communicate');
    }, 800);

    // redirrecting ti checklist heading, section or item when clicked
    $scope.breadcrumbRedirect = function(what, breadcrumb){
      // 

      if(what === 'section'){
        // 
        $state.go('app.checklist.conflicts', { id: breadcrumb.checklist_id,  sections: [breadcrumb.section_id] });
      }else if(what === 'heading'){
        // 
        $state.go('app.checklist.conflicts', { id: breadcrumb.checklist_id, sections: [breadcrumb.section_id], headings: [breadcrumb.heading_id] });
      }else if(what === 'line'){
        // 
        $state.go('app.checklist.conflicts', { id: breadcrumb.checklist_id,  sections: [breadcrumb.section_id], headings: [breadcrumb.heading_id], items: [breadcrumb.line_id] });
      }
      // var checklist = {rid: "827", id: 22, created: 1550842977, idCHK: "690", idFDI: ""}

      // var headings = ["598"]
      // var sections = ["787"]

      // $state.go('app.checklist.conflicts', { id: checklist.idCHK, checklist: checklist, sections: sections, headings: headings });
      // $state.go('app.checklist.conflicts', { id: checklist.idCHK, checklist: checklist, sections: sections, headings: headings, items: conflicts.idsITEM });
      // ----{"project_id":"675","project_name":"CHECK","folder_id":"1913","folder_name":"checking","checklist_name":"hello test 1 23","checklist_id":"1043","folder_chk_id":1135,"flag_complete":null,"section_name":"test 33","section_id":1309,"heading_name":"test 34","heading_id":1205,"line_name":"test 35","line_id":1771} ------
    }


// showMe: {idCON: "40", name: "Mahto202"}
// showThem: {idCON: "43", name: "Naman




  }
})();
