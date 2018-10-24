(function () {
  'use strict';

  angular
    .module('app.mail')
    .controller('MailController', MailController);

  /** @ngInject */
  function MailController($scope, $rootScope, $document, $mdDialog, $mdMedia, $mdSidenav, $http, $state, msApi, Folders, Labels, Outbox, $filter, api) {
    var vm = this;

    vm.debug = false;
    vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'green-bg', 'teal-bg'];
    vm.selectedAccount = 'creapond';

    vm.folders = Folders.data;
    vm.labels = Labels.data;
    vm.outbox = Outbox.data;
    vm.loadingThreads = true;
    vm.outboxToggle = false;
    vm.currentFilter = {
      type: null,
      filter: 1,
      name: 'Inbox'
    };

    vm.currentThread = null;
    vm.selectedThreads = [];

    vm.views = {
      classic: 'app/main/mail/views/classic/classic-view.html',
      outlook: 'app/main/mail/views/outlook/outlook-view.html'
    };

    vm.defaultView = 'outlook';
    vm.currentView = 'outlook';

    // Methods


    vm.isFolderActive = isFolderActive;
    vm.isOutboxActive = isOutboxActive;
    vm.isLabelActive = isLabelActive;

    vm.openThread = openThread;
    vm.closeThread = closeThread;

    vm.isSelected = isSelected;
    vm.toggleSelectThread = toggleSelectThread;
    vm.selectThreads = selectThreads;
    vm.deselectThreads = deselectThreads;
    vm.toggleSelectThreads = toggleSelectThreads;

    vm.setThreadStatus = setThreadStatus;
    vm.toggleThreadStatus = toggleThreadStatus;

    vm.getLabel = getLabel;
    vm.getLabelColor = getLabelColor;
    vm.getLabelTitle = getLabelTitle;
    vm.toggleLabel = toggleLabel;
    vm.isLabelExist = isLabelExist;

    vm.changeView = changeView;

    vm.composeDialog = composeDialog;
    vm.replyDialog = replyDialog;

    vm.toggleSidenav = toggleSidenav;

    vm.filterThreads = filterThreads;
    vm.filterFolder = filterFolder;

    vm.fetchChecklist = fetchChecklist;
    vm.fetchSection = fetchSection;
    vm.fetchHeading = fetchHeading;
    vm.fetchItem = fetchItem;
    vm.fetchChecklistData = fetchChecklistData;
    vm.fetchUser = fetchUser;
    vm.deleteFeed = deleteFeed;
    vm.filterOutbox = filterOutbox;

    vm.upperCaseFirst = upperCaseFirst;

    vm.passChecklistPostings = passChecklistPostings;
    vm.passInvitations = passInvitations;
    vm.passContacts = passContacts;
    vm.passMessages = passMessages;

    vm.fetchInvites = fetchInvites;

    vm.type = {
      'notification': '',
      'post': '',
      'checklist': '',
      'message': '',
      'invited': ''
    };

    vm.type.item = {
      'checklist': '',
      'section': '',
      'heading': '',
      'invited': ''
    };

    console.log('vm.type', vm.type);
    console.log('vm.type.item', vm.type.item);

    init();

    /**
     * Initialize
     */
    function init() {
      // Request the feed
      //vm.threads = $rootScope.feed.items;

      api.feed.get().then(function (d) {
        vm.threads = d.data.feed;
        vm.threads.forEach(function (thread) {

          //console.log('thread', thread);
          switch (thread.type) {
            case 'notification':
              thread.labels = [5];
              break;
            case 'invite':
              thread.labels = [2];
              break;
            case 'invited':
              thread.labels = [3];
              break;
            case 'message':
              thread.labels = [4];
              break;
            case 'post':
              thread.labels = [6];
              break;
            case 'accepted':
              thread.labels = [3];
              break;
            default:
              thread.labels = [0];
              break;
          }
          switch (thread.item.type) {
            case 'checklist':
              thread.labels.push(7);
              break;
            case 'section':
              thread.labels.push(11);
              break;
            case 'heading':
              thread.labels.push(10);
              break;
            case 'item':
              thread.labels.push(12);
              break;
            case 'post':
              thread.labels.push(6);
              break;
            default:
              thread.labels.push(0);
              break;
          }

        });


        console.log('$rootScope.user', $rootScope.user);

        api.conversations.sent($rootScope.user.idCON, 0).success(function (res) {
          if (res !== undefined && res != null && res != '' && !res.code) {
            vm.sent = res;
            console.log('sent', vm.sent);
          }
        })["finally"](function () {
        });
        console.log('vm.threads', vm.threads);
      });

      // Load new threads
      //vm.threads = vm.threads;

      // Hide the loading screen
      vm.loadingThreads = false;
      if (vm.threads) {
        // Open the thread if needed
        if ($state.params.threadId) {
          for (var i = 0; i < vm.threads.length; i++) {
            if (vm.threads[i].id === $state.params.threadId) {
              vm.openThread(vm.threads[i]);
              break;
            }
          }
        }
      }
    }


    function fetchInvites() {
      $rootScope.loading.invites = true;
      api.checklists.invite.get().error(function (res) {
        vm.inviteControl.error = 'Unknown error talking to server.';
      }).success(function (res) {
        if (res.code) {
          console.log('res.code', res);
          vm.inviteControl.error = res.message;
        } else {
          console.log('res.code', res);
          vm.invites = res.invites;
        }
      })["finally"](function () {
        vm.invites.loaded = true;
        $rootScope.loading.invites = false;
        noNav = true;
      });
    }

    function upperCaseFirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }


    function filterThreads(labelId) {
      vm.outboxToggle = false;
      console.log('labelId', labelId);
      var label;
      label = vm.getLabel(labelId);

      console.log('label', label);

      // Show loader
      $rootScope.loadingProgress = true;

      // Update the state without reloading the controller
      $state.go('app.mail.threads', {
        type: 'label',
        filter: label.id
      }, {notify: false});


      // Set the current filter
      vm.currentFilter = {
        type: 'label',
        filter: label.id,
        name: label.title
      };

      // Close the current thread if open
      if (vm.currentThread) {
        vm.closeThread();
      }

      // Hide loader
      $rootScope.loadingProgress = false;

      //Reset vm.threads and filter again...
      vm.threads = $rootScope.feed.items;
      //console.log('vm.threads', vm.threads);
      vm.threads = $filter('filter')(
        vm.threads, {labels: labelId}, true
      );

      $mdSidenav('main-sidenav').toggle();
      return vm.threads;
    }

    function filterFolder(unread) {
      var label, folderID;
      vm.outboxToggle = false;
      console.log('unread', unread);

      // Show loader
      $rootScope.loadingProgress = true;

      // Update the state without reloading the controller
      /*
       $state.go('app.mail.threads', {
       type: null,
       filter: unread
       }, {notify: false});
       */

      //Replace switchCase with array
      switch (unread) {
        case 'all':
          label = 'Inbox';
          folderID = 1;
          console.log('label', label);
          break;
        case 'true':
          label = 'Unread';
          folderID = 2;
          console.log('label', label);
          break;
        case 'false':
          label = 'Read';
          folderID = 3;
          console.log('label', label);
          break;
        default:
          label = 'Inbox';
          folderID = 1;
      }
      // Set the current filter
      vm.currentFilter = {
        type: null,
        filter: folderID,
        name: label
      };

      // Close the current thread if open
      if (vm.currentThread) {
        vm.closeThread();
      }

      // Hide loader
      $rootScope.loadingProgress = false;

      vm.threads = $rootScope.feed.items;
      console.log('vm.threads', vm.threads);
      console.log('unread', unread);
      if (unread !== 'all') {
        vm.threads = $filter('filter')(
          vm.threads, {unread: unread}
        );
      }
      console.log('vm.threads filtered', vm.threads);
      $mdSidenav('main-sidenav').toggle();
      return vm.threads;
    }


    function filterOutbox() {
      vm.outboxToggle = true;
      console.log('sent', vm.sent);

      vm.currentFilter = {
        type: 'outbox',
        filter: 1,
        name: 'Outbox'
      };

      // Close the current thread if open
      if (vm.currentThread) {
        vm.closeThread();
      }

      $mdSidenav('main-sidenav').toggle();
      return vm.outboxThreads = vm.sent.posts;
    }


    $rootScope.$on('event:feedNotificationsReceived', function () {
      vm.threads = null;
      //console.log('vm.threads loaded', vm.threads);
      vm.threads = $rootScope.feed.items;
      //console.log('vm.threads loaded', vm.threads);
    });

    // Watch screen size to change view modesfeedNotificationsReceived
    $scope.$watch(function () {
      return $mdMedia('xs');
    }, function (current, old) {
      if (current) {
        vm.currentView = 'classic';
      }
    });

    $scope.$watch(function () {
      return $mdMedia('gt-xs');
    }, function (current, old) {
      if (current) {
        if (vm.defaultView === 'outlook') {
          vm.currentView = 'outlook';
        }
      }
    });


    /**
     * Is the folder with the given name active?
     *
     * @param name
     * @returns {boolean}
     */
    function isFolderActive(id) {
      //console.log('isFolderActive:name', id);
      //console.log('vm.currentFilter.filter', vm.currentFilter.filter);
      return (vm.currentFilter.type === null && vm.currentFilter.filter === id);
    }

    function isOutboxActive(id) {
      //console.log('isFolderActive:name', id);
      //console.log('vm.currentFilter.filter', vm.currentFilter.filter);
      return (vm.currentFilter.type === 'outbox' && vm.currentFilter.filter === id);
    }

    /**
     * Is the label with the given name active?
     *
     * @param name
     * @returns {boolean}
     */
    function isLabelActive(id) {

      //console.log('isLabelActive:id', id);

      return (vm.currentFilter.type === 'label' && vm.currentFilter.filter === id);
    }

    /**
     * Open thread
     *
     * @param thread
     */

    function openThread(thread) {

      //Set Details to true
      vm.selectedMailShowDetails = false;

      // Set the read status on the thread
      thread.read = true;

      // Assign thread as the current thread
      vm.currentThread = thread;


      // Update the state without reloading the controller
      //$state.go('app.mail.threads.thread', {threadId: thread.id}, {notify: false});


      console.log('thread', thread);
      console.log('thread.item.type', thread.item.type);
      var itemID = [thread.id];
      console.log(itemID);

      // This HACK will be replaced when endpoint data is refactored and consistent
      switch (thread.type) {
        case 'notification':
          vm.fetchChecklist(thread.item.idCHK);
          switch (thread.item.type) {
            case 'section':
              vm.fetchSection(thread.item.idCHK, thread.item.id);
              break;
            case 'heading':
              vm.fetchHeading(thread.item.idCHK, thread.item.id);
              break;
            case 'item':
              vm.fetchItem(thread.item.idCHK, thread.item.id);
              break;
            default:
              break;
          }
          break;
        case 'invite':
          vm.fetchUser(thread);
          break;
        case 'invited':
          vm.fetchUser(thread);
          break;
        case 'message':
          vm.fetchUser(thread);
          break;
        case 'accepted':
          vm.fetchUser(thread);
          break;
        case 'post':
          vm.fetchChecklist(thread.item.idCHK);
          switch (thread.item.type) {
            case 'section':
              vm.fetchSection(thread.item.idCHK, thread.item.id);
              break;
            case 'heading':
              vm.fetchHeading(thread.item.idCHK, thread.item.id);
              break;
            case 'item':
              vm.fetchItem(thread.item.idCHK, thread.item.id);
              break;
            default:
              break;
          }
          break;
        default:
          break;
      }


      $rootScope.feed.mark(itemID);

      var i;
      for (i = 0; i < vm.threads.length; i++) {
        if (vm.threads[i].id == itemID) {
          console.log('pre shift', vm.threads[i]);

          vm.threads[i].unread = false;
          console.log('post shift', vm.threads[i]);
        }
      }


    }

    /**
     * Close thread
     */
    function closeThread() {
      vm.currentThread = null;

      // Update the state without reloading the controller
      $state.go('app.mail.threads', {
        type: vm.currentFilter.type,
        filter: vm.currentFilter.filter
      }, {notify: false});
    }

    /**
     * Return selected status of the thread
     *
     * @param thread
     * @returns {boolean}
     */
    function isSelected(thread) {
      return vm.selectedThreads.indexOf(thread) > -1;
    }

    /**
     * Toggle selected status of the thread
     *
     * @param thread
     * @param event
     */
    function toggleSelectThread(thread, event) {
      if (event) {
        event.stopPropagation();
      }

      if (vm.selectedThreads.indexOf(thread) > -1) {
        vm.selectedThreads.splice(vm.selectedThreads.indexOf(thread), 1);
      }
      else {
        vm.selectedThreads.push(thread);
      }
    }

    /**
     * Select threads. If key/value pair given,
     * threads will be tested against them.
     *
     * @param [key]
     * @param [value]
     */
    function selectThreads(key, value) {
      // Make sure the current selection is cleared
      // before trying to select new threads
      vm.selectedThreads = [];

      for (var i = 0; i < vm.threads.length; i++) {
        if (angular.isUndefined(key) && angular.isUndefined(value)) {
          vm.selectedThreads.push(vm.threads[i]);
          continue;
        }

        if (angular.isDefined(key) && angular.isDefined(value) && vm.threads[i][key] === value) {
          vm.selectedThreads.push(vm.threads[i]);
        }
      }
    }

    /**
     * Deselect threads
     */
    function deselectThreads() {
      vm.selectedThreads = [];
    }

    /**
     * Toggle select threads
     */
    function toggleSelectThreads() {
      if (vm.selectedThreads.length > 0) {
        vm.deselectThreads();
      }
      else {
        vm.selectThreads();
      }
    }

    /**
     * Set the status on given thread, current thread or selected threads
     *
     * @param key
     * @param value
     * @param [thread]
     * @param [event]
     */
    function setThreadStatus(key, value, thread, event) {
      // Stop the propagation if event provided
      // This will stop unwanted actions on button clicks
      if (event) {
        event.stopPropagation();
      }

      // If the thread provided, do the changes on that
      // particular thread
      if (thread) {
        thread[key] = value;
        return;
      }

      // If the current thread is available, do the
      // changes on that one
      if (vm.currentThread) {
        vm.currentThread[key] = value;
        return;
      }

      // Otherwise do the status update on selected threads
      for (var x = 0; x < vm.selectedThreads.length; x++) {
        vm.selectedThreads[x][key] = value;
      }
    }

    /**
     * Toggle the value of the given key on given thread, current
     * thread or selected threads. Given key value must be boolean.
     *
     * @param key
     * @param thread
     * @param event
     */
    function toggleThreadStatus(key, thread, event) {
      // Stop the propagation if event provided
      // This will stop unwanted actions on button clicks
      if (event) {
        event.stopPropagation();
      }

      // If the thread provided, do the changes on that
      // particular thread
      if (thread) {
        if (typeof(thread[key]) !== 'boolean') {
          return;
        }

        thread[key] = !thread[key];
        return;
      }

      // If the current thread is available, do the
      // changes on that one
      if (vm.currentThread) {
        if (typeof(vm.currentThread[key]) !== 'boolean') {
          return;
        }

        vm.currentThread[key] = !vm.currentThread[key];
        return;
      }

      // Otherwise do the status update on selected threads
      for (var x = 0; x < vm.selectedThreads.length; x++) {
        if (typeof(vm.selectedThreads[x][key]) !== 'boolean') {
          continue;
        }

        vm.selectedThreads[x][key] = !vm.selectedThreads[x][key];
      }
    }

    /**
     * Get label object content
     *
     * @param id
     * @returns {*}
     */
    function getLabel(id) {
      for (var i = 0; i < vm.labels.length; i++) {
        if (vm.labels[i].id === id) {
          return vm.labels[i];
        }
      }
    }

    /**
     * Get label color from label object
     *
     * @param id
     * @returns {*}
     */
    function getLabelColor(id) {
      return vm.getLabel(id).color;
    }

    /**
     * Get label title from label object
     *
     * @param id
     * @returns {*}
     */
    function getLabelTitle(id) {
      return vm.getLabel(id).title;
    }

    /**
     * Toggle label
     *
     * @param label
     */
    function toggleLabel(label) {
      // Toggle label on the currently open thread
      if (vm.currentThread) {
        if (vm.currentThread.labels.indexOf(label.id) > -1) {
          vm.currentThread.labels.splice(vm.currentThread.labels.indexOf(label.id), 1);
        }
        else {
          vm.currentThread.labels.push(label.id);
        }

        return;
      }

      // Toggle labels on selected threads
      // Toggle action will be determined by the first thread from the selection.
      if (vm.selectedThreads.length > 0) {
        // Decide if we are going to remove or add labels
        var removeLabels = (vm.selectedThreads[0].labels.indexOf(label.id) > -1);

        for (var i = 0; i < vm.selectedThreads.length; i++) {
          if (!removeLabels) {
            vm.selectedThreads[i].labels.push(label.id);
            continue;
          }

          if (vm.selectedThreads[i].labels.indexOf(label.id) > -1) {
            vm.selectedThreads[i].labels.splice(vm.selectedThreads[i].labels.indexOf(label.id), 1);
          }
        }
      }
    }

    /**
     * Is label exist?
     *
     * @param label
     * @returns {boolean}
     */
    function isLabelExist(label) {
      if (vm.currentThread && vm.currentThread.labels) {
        return (vm.currentThread.labels.indexOf(label.id) > -1);
      }
    }

    /**
     * Change the view
     *
     * @param view
     */
    function changeView(view) {
      if (vm.views[view]) {
        vm.defaultView = view;
        vm.currentView = view;
      }
    }

    /**
     * Open compose dialog
     *
     * @param ev
     */

    function composeDialog(ev) {
      $mdDialog.show({
        controller: 'ComposeDialogController',
        controllerAs: 'vm',
        locals: {
          selectedMail: undefined
        },
        templateUrl: 'app/main/mail/dialogs/compose/compose-dialog.html',
        parent: angular.element($document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    /**
     * Open reply dialog
     *
     * @param ev
     */
    function replyDialog(ev, currentThread, type) {

      console.log('reply dialog', currentThread, type);

      $mdDialog.show({
        controller: 'ComposeDialogController',
        controllerAs: 'vm',
        locals: {
          selectedMail: currentThread,
          type: type
        },
        templateUrl: 'app/main/mail/dialogs/compose/compose-dialog.html',
        parent: angular.element($document.body),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }


    function deleteFeed(event, currentItem) {

      vm.currentItem = currentItem;

      var confirm = $mdDialog.confirm()
        .title('Are you sure?')
        .content('This Notification will be deleted.')
        .ariaLabel('Delete Notification')
        .ok('Delete')
        .cancel('Cancel')
        .targetEvent(event);

      $mdDialog.show(confirm).then(function () {
        api.feed.destroy(vm.currentItem.id).error(function (res) {
          return $rootScope.message("Error Deleting Notification", 'warning');
        }).success(function (res) {
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message("Error Deleting Notification", 'warning');
          } else if (res.code) {
            return $rootScope.message(res.message, 'warning');
          } else {

            console.log('currentThread', vm.currentItem);
            console.log('id', vm.currentItem.id);

            /* Remove From Threads Object */
            vm.threads.splice(vm.threads.indexOf(vm.currentItem), 1);

            vm.closeThread();
          }
        });
      });
    }


    function fetchUser(thread) {

      vm.currentThread.message = {
        from: thread.user.name,
        organization: thread.user.organization,
        message: thread.item.text
      }

    }


    function fetchChecklist(idCHK) {

      var find;

      console.log('idCHK', idCHK);

      var checklist;

      vm.loading = true;
      return $http.get(BASEURL + "coe-get.php?t=checklist&idCHK=" + idCHK).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          console.log('Error loading checklist: ', res);

        } else if (res.code) {

        } else {

          checklist = res.checklists[0];

          //console.log('res', res);
          console.log('checklist', checklist);

          if (checklist !== void 0 && checklist !== null && checklist !== '') {


            vm.currentThread.checklist = {
              idCHK: checklist.idCHK,
              name: checklist.name,
              complete: checklist.complete,
              ownerDetails: checklist.ownerDetails,
              inviterDetails: checklist.inviterDetails
            }
          }

          //console.log('vm.currentThread.checklist', vm.currentThread.checklist);

        }
      }).error(function (err) {
        console.log('Error loading checklist', err);
        vm.loading = false;

      })["finally"](function () {
        return vm.loading = false;
      });

      vm.loading = true;
    }


    function fetchSection(idCHK, sectionID) {

      console.log('idCHK', idCHK);
      console.log('sectionID', sectionID);

      var sections;

      vm.loading = true;
      return $http.get(BASEURL + "coe-get.php?t=section&idCHK=" + idCHK).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          console.log('Error loading sections: ', res);

        } else if (res.code) {

        } else {

          sections = res.sections;

          console.log('sections', sections);

          sections.forEach(function (section) {

            if (section.id == sectionID) {

              vm.currentThread.specific = {
                idCHK: idCHK,
                id: section.id,
                id_parent: section.id_parent,
                name: section.name
              }
              console.log('vm.currentThread.specific', vm.currentThread.specific);
            }

          });

        }
      }).error(function (err) {
        console.log('Error loading sections', err);
        vm.loading = false;

      })["finally"](function () {
        return vm.loading = false;
      });


      vm.loading = true;
    }


    function fetchHeading(idCHK, headingID) {

      console.log('idCHK', idCHK);
      console.log('headingID', headingID);


      var headings;

      vm.loading = true;
      return $http.get(BASEURL + "coe-get.php?t=heading&idCHK=" + idCHK).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          console.log('Error loading headings: ', res);

        } else if (res.code) {

        } else {

          headings = res.headings;

          headings.forEach(function (heading) {

            if (heading.id == headingID) {

              vm.currentThread.specific = {
                idCHK: idCHK,
                id: heading.id,
                id_parent: heading.id_parent,
                name: heading.name
              }
              console.log('vm.currentThread.specific', vm.currentThread.specific);
            }

          });

        }
      }).error(function (err) {
        console.log('Error loading headings', err);
        vm.loading = false;

      })["finally"](function () {
        return vm.loading = false;
      });


      vm.loading = true;
    }


    function fetchItem(idCHK, itemID) {

      console.log('idCHK', idCHK);
      console.log('itemID', itemID);

      console.log('itemID', itemID);


      var items;

      vm.loading = true;
      return $http.get(BASEURL + "coe-get.php?t=item&idCHK=" + idCHK).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          console.log('Error loading headings: ', res);

        } else if (res.code) {

        } else {

          items = res.items;

          items.forEach(function (item) {

            if (item.id == itemID) {

              vm.currentThread.specific = {
                idCHK: idCHK,
                id: item.id,
                id_parent: item.id_parent,
                name: item.name
              }
              console.log('vm.currentThread.specific', vm.currentThread.specific);
            }

          });

        }
      }).error(function (err) {
        console.log('Error loading headings', err);
        vm.loading = false;

      })["finally"](function () {
        return vm.loading = false;
      });


      vm.loading = true;
    }


    function fetchChecklistData(idCHK) {

      var checklist;

      vm.loading = true;
      return $http.get(BASEURL + "coe-get.php?t=checklist&idCHK=" + idCHK).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          console.log('Error loading checklist: ', res);

        } else if (res.code) {

        } else {

          console.log('res.checklists[0]', res.checklists[0]);
          checklist = res.checklists[0];

        }
      }).error(function (err) {
        console.log('Error loading checklist', err);
        vm.loading = false;

      })["finally"](function () {
        return checklist;
      });

    }


    function passChecklistPostings(idCHK, id_parent, id, type, name, threadType) {

      var sections, headings, i, noNav = false;

      sections = [];
      headings = [];

      console.log('idCHK', idCHK);
      console.log('type', type);
      console.log('id_parent', id_parent);
      console.log('id', id);
      console.log('name', name);
      console.log('threadType', threadType);

      switch (type) {
        case 'checklist':
          break;
        case 'section':
          break;
        case 'heading':
          sections.push(id_parent);
          break;
        case 'item':
          noNav = true;
          api.headings.get(idCHK).success(function (res) {

            for (i = 0; i < res.headings.length; i++) {
              console.log('res.headings[i].id', res.headings[i].id);
              if (res.headings[i].id === id_parent) {
                sections.push(res.headings[i].id_parent);

                console.log('res.headings[i].id_parent', res.headings[i].id_parent);
              }
            }

            console.log('sections post loop', sections);
            //sections.push(res.sections[0].id);
            headings.push(id_parent);

            console.log('headings post loop', headings);

            $state.go('app.checklist.notifications', {
              id: id,
              idCHK: idCHK,
              sections: sections,
              headings: headings,
              name: name,
              type: threadType
            });

          })["finally"](function () {
          });

          console.log('headings post loop', headings);
          break;
        default:
          return false;
      }

      if (!noNav) {
        $state.go('app.checklist.notifications', {
          id: id,
          idCHK: idCHK,
          sections: sections,
          headings: headings,
          name: name,
          type: threadType
        });
      }

    };

    function passInvitations(id) {

      var noNav = false;

      //console.log('id', id);

         $state.go('app.invitations.accept', {
         passID: id
         });
    };

    function passContacts(id) {

      var noNav = false;

      //console.log('id', id);

      $state.go('app.contacts.accept', {
        passID: id
      });
    };


    function passMessages(id) {

      var noNav = false;

      //console.log('id', id);

      $state.go('app.chat.pass', {
        passID: id
      });
    };



    /**
     * Toggle sidenav
     *
     * @param sidenavId
     */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }
  }
})();
