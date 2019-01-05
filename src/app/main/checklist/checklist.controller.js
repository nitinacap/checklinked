var indexOf = [].indexOf || function (item) {
  for (var i = 0, l = this.length; i < l; i++) {
    if (i in this && this[i] === item) return i;
  }
  return -1;
};

(function () {
  'use strict';

  angular
    .module('app.checklist')
    .controller('checklistController', checklistController);

  /** @ngInject */
  function checklistController($rootScope, $scope, $cookies, api, $state, $stateParams, $location, $mdDialog, $mdSidenav, $document, $http, $filter, $window) {
    var vm = this;
    var ref;


    vm.setChecklistCtrlBlank = setChecklistCtrlBlank;
    vm.preventDefault = preventDefault;
    vm.deleteConfirm = deleteConfirm;
    vm.deleteItem = deleteItem;
    vm.toggleSidenav = toggleSidenav;
    vm.toggleFilter = toggleFilter;
    vm.resetFilters = resetFilters;
    vm.toggleFilterWithEmpty = toggleFilterWithEmpty;
    vm.completeLoad = completeLoad;
    vm.organizeData = organizeData;
    vm.children = children;
    vm.joinFeeds = joinFeeds;
    vm.toggleComplete = toggleComplete;
    vm.isForm = isForm;
    vm.add = add;
    vm.toggleCheckbox = toggleCheckbox;
    vm.showWhichInviteContactData = showWhichInviteContactData;
    vm.CFC = CFC;
    vm.next = next;
    vm.previous = previous;
    vm.group = group;
    vm.checkIfLinked = checkIfLinked;
    vm.loadChecklist = loadChecklist;
    vm.setSocketStuff = setSocketStuff;

    vm.showLinkedUsers = showLinkedUsers;
    vm.sendLinkRequest = sendLinkRequest;
    vm.publishTemplate = publishTemplate;
    vm.createSegment = createSegment;
    vm.svc = svc;
    vm.fetchGroups = fetchGroups;
    vm.closeDialog = closeDialog;
    vm.setLabels = setLabels;
    vm.addChecklistDialog = addChecklistDialog;
    vm.addNewFolder = addNewFolder;
    vm.addNewGroup = addNewGroup;
    vm.addNewChecklist = addNewChecklist;
    vm.toggle = toggle;
    vm.openFolderInput = openFolderInput;
    vm.cancelFolderInput = cancelFolderInput;
    vm.openGroupInput = openGroupInput;
    vm.cancelGroupInput = cancelGroupInput;
    vm.cancelChecklistInput = cancelChecklistInput;
    vm.openAddChecklistTemplateDialog = openAddChecklistTemplateDialog;
    vm.openUploadAttachmentDialog = openUploadAttachmentDialog;
    vm.openConflictsDialog = openConflictsDialog;
    vm.viewAttachmentsDialog = viewAttachmentsDialog;
    vm.fetchAttachmentsParent = fetchAttachmentsParent;
    vm.fetchAttachmentsChecklist = fetchAttachmentsChecklist;
    vm.uploadAttachment = uploadAttachment;
    //vm.uniqueString = uniqueString;
    vm.getUserKey = getUserKey;
    vm.downloadPDF = downloadPDF;
    vm.downloadXML = downloadXML;
    vm.fetchHeadingBlock = fetchHeadingBlock;
    vm.fetchItemBlock = fetchItemBlock;
    vm.displayUserCheckboxes = displayUserCheckboxes;
    vm.evaluateConflicts = evaluateConflicts;
    vm.appendCheckboxesToItems = appendCheckboxesToItems;
    vm.removeUserCheckboxes = removeUserCheckboxes;
    vm.userCheckboxes = userCheckboxes;
    vm.setBlank = setBlank;
    vm.setError = setError;
    vm.toggleShowCheckboxes = toggleShowCheckboxes;
    vm.loadLinkedUsers = loadLinkedUsers;

    vm.openChecklistDialog = openChecklistDialog;
    vm.saveChecklist = saveChecklist;
    vm.openSectionDialog = openSectionDialog;
    vm.saveSection = saveSection;
    vm.openHeadingDialog = openHeadingDialog;
    vm.saveHeading = saveHeading;
    vm.openItemDialog = openItemDialog;
    vm.openFormLineDialog = openFormLineDialog;
    vm.saveItem = saveItem;
    vm.openConversationDialog = openConversationDialog;
    vm.children = children;
    vm.isExpandable = isExpandable;
    vm.toggleableChildren = toggleableChildren;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.isExpanded = isExpanded;
    vm.toggle = toggle;
    vm.downloadAttachment = downloadAttachment;
    vm.expanded = {
      sections: [],
      headings: [],
      items: [],
      referencess: []
    };
    // CONFLICTS
    vm.fetchConflictsHeadingBlock = fetchConflictsHeadingBlock;
    vm.fetchConflictsItemBlock = fetchConflictsItemBlock;
    vm.closeConfilicts = closeConfilicts;
    //vm.loadMore = loadMore;

    //console.log('$stateParams', $stateParams, $state);
    vm.idCHK = $stateParams.id;
    vm.isLoader = true;
    vm.folders = [];
    var token = $cookies.get("token");

    api.folders.get(token).then(function (d) {
      vm.isLoader = false;
      vm.folders = d.data.folders;
    });

    vm.checklist = {
      sending: false
    };

    vm.wizard = {
      newFolder: false,
      newGroup: false
    };

    vm.tempGroup = {};


    if (!vm.isExpandedCounter) {
      vm.isExpandedCounter = 0;
    }

    if ($stateParams.id !== undefined && $stateParams.id != null) {
      //console.log('$stateParams.id not null/undefined', $stateParams);
      //console.log('$state', $state);
      //////debugger;
      console.log('myShowingUser', $rootScope.showingUsers)
      if ($stateParams.id == '') {
        console.log('$stateParams empty', $stateParams);
        console.log('$state', $state);
        $location.path('/checklist');
      } else if ($state.is('app.checklist.detail')) {
        //////debugger;
        console.log('stateParams', $stateParams);
        console.log('$state', $state);
        vm.passChecklist = [];
        api.checklists.getGroup($stateParams.id, token).then(function (d) {
          vm.passChecklist = d.data.checklists;
          // vm.isLoader = false;

        });
        vm.setChecklistCtrlBlank();
        vm.loadChecklist($stateParams.id);


        if ($stateParams.headings && $stateParams.sections && $stateParams.items) {

          //console.log('grab conflicts objects');


          var section, heading, i;

          for (i = 0; i < $stateParams.sections.length; i++) {
            section = {
              id: $stateParams.sections[i],
              headings: []
            };
            vm.toggle('section', section);
            vm.fetchConflictsHeadingBlock(section, $stateParams.id);
          }

          for (z = 0; z < $stateParams.headings.length; z++) {
            heading = {
              id: $stateParams.headings[z],
              items: []
            };
            vm.toggle('heading', heading);
            vm.fetchConflictsItemBlock(heading, $stateParams.id);
          }


          for (i = 0; i < $stateParams.headings.length; i++) {
            heading = {
              id: $stateParams.headings[i],
              items: []
            };
            vm.toggle('heading', heading);
            vm.fetchConflictsItemBlock(heading, $stateParams.id);
          }


          vm.completeLoad();
        }


      } else if ($state.is('app.checklist.conflicts')) {
        //console.log('stateParams', $stateParams);
        //console.log('$state', $state);
        vm.passChecklist = [];
        api.checklists.getGroup($stateParams.id, token).then(function (d) {
          vm.passChecklist = d.data.checklists;
          //vm.isLoader = false;
        });
        //console.log('$stateParams.id here', $stateParams.id);
        vm.setChecklistCtrlBlank();
        vm.loadChecklist($stateParams.id);

        if ($stateParams.headings && $stateParams.sections) {

          console.log('$stateParams.sections.length', $stateParams.sections.length);
          console.log('$stateParams.sections.length', $stateParams.headings.length);

          var section, heading, i, z;

          for (i = 0; i < $stateParams.sections.length; i++) {
            section = {
              id: $stateParams.sections[i],
              headings: []
            };
            vm.toggle('section', section);
            vm.fetchConflictsHeadingBlock(section, $stateParams.id);
          }

          for (z = 0; z < $stateParams.headings.length; z++) {
            heading = {
              id: $stateParams.headings[z],
              items: []
            };
            vm.toggle('heading', heading);
            vm.fetchConflictsItemBlock(heading, $stateParams.id);
          }

          vm.completeLoad();
        }

      } else if ($state.is('app.checklist.notifications')) {
        console.log('stateParams', $stateParams);
        console.log('$state', $state);

        vm.passedNotification = {
          id: $stateParams.id,
          idCHK: $stateParams.idCHK,
          sections: $stateParams.sections,
          headings: $stateParams.headings,
          items: $stateParams.items,
          name: $stateParams.name,
          type: $stateParams.type
        };


        vm.passChecklist = [];
        api.checklists.getGroup($stateParams.idCHK, token).then(function (d) {
          vm.passChecklist = d.data.checklists;
          vm.isLoader = false;
        });

        //console.log('$stateParams.id here', $stateParams.id);
        vm.setChecklistCtrlBlank();
        vm.loadChecklist($stateParams.idCHK);

        if ($stateParams.headings && $stateParams.sections) {

          var sections, headings;

          sections = $stateParams.sections;

          headings = $stateParams.headings;

          console.log('vm.passedNotification', vm.passedNotification);

          var section, heading, i, z;

          console.log('sections', sections);
          console.log('sections.length', sections.length);

          for (i = 0; i < sections.length; i++) {
            section = {
              id: sections[i],
              headings: []
            };
            vm.toggle('section', section);
            vm.fetchConflictsHeadingBlock(section, $stateParams.idCHK);
          }


          console.log('headings', headings);
          console.log('headings.length', headings.length);

          for (z = 0; z < $stateParams.headings.length; z++) {
            heading = {
              id: $stateParams.headings[z],
              items: []
            };
            vm.toggle('heading', heading);
            vm.fetchConflictsItemBlock(heading, $stateParams.idCHK);
          }

          vm.completeLoad();

          if (vm.passedNotification.type == 'post') {
            vm.openConversationDialog('item', vm.passedNotification.id, vm.passedNotification.name);
          }
        }

      }
      else {
        ////debugger;
        vm.checklists = [];
        api.checklists.getGroup($stateParams.id, token).then(function (d) {
          vm.checklists = d.data.checklists;
          // vm.isLoader = false;
          //console.log('vm.checklists', vm.checklists);
        });
      }

    } else {
      vm.setChecklistCtrlBlank();
      vm.loadChecklist();
    }


    //FUSE Methods
    vm.checklistFilters = {
      search: '',
      deleted: false
    };

    vm.dragControlListenersSections = {

      accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {

        //console.log('sourceItemHandleScope', sourceItemHandleScope);
        //console.log('destSortableScope', destSortableScope);

        if (sourceItemHandleScope.itemScope.section && (!sourceItemHandleScope.itemScope.heading && !sourceItemHandleScope.itemScope.item)) {
          //console.log('truthy');
          //console.log('sourceItemHandleScope', sourceItemHandleScope);
          //console.log('sourceItemHandleScope.itemScope', sourceItemHandleScope.itemScope);
          //console.log('sourceItemHandleScope.itemScope.section', sourceItemHandleScope.itemScope.section);
          //console.log('sourceItemHandleScope.itemScope.heading', sourceItemHandleScope.itemScope.heading);
          //console.log('sourceItemHandleScope.itemScope.item', sourceItemHandleScope.itemScope.item);
          return true
        } else {
          //console.log('falsy');
          //console.log('sourceItemHandleScope', sourceItemHandleScope);
          //console.log('sourceItemHandleScope.itemScope', sourceItemHandleScope.itemScope);
          //console.log('sourceItemHandleScope.itemScope.section', sourceItemHandleScope.itemScope.section);
          //console.log('sourceItemHandleScope.itemScope.heading', sourceItemHandleScope.itemScope.heading);
          //console.log('sourceItemHandleScope.itemScope.item', sourceItemHandleScope.itemScope.item);
          return false
        }

        //console.log('destItemScope', destItemScope);
        //console.log('source cl.id', sourceItemHandleScope.itemScope.sortableScope.$parent.checklist.id);
        //console.log('destination cl.id', destSortableScope.$parent.checklist.id);
        //return sourceItemHandleScope.itemScope.sortableScope.$parent.checklist.id === destSortableScope.$parent.checklist.id;
      },
      itemMoved: function (event) {

        var moveSuccess, moveFailure;
        /**
         * Action to perform after move success.
         */
        moveSuccess = function () {
        };

        /**
         * Action to perform on move failure.
         * remove the item from destination Column.
         * insert the item again in original Column.
         */
        moveFailure = function () {
          eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
          eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.item);
        };

      },
      orderChanged: function (event) {

        console.log('event', event);

        // Location where section was dragged to


        var arrayKeyNext = (event.dest.index + 1);
        var arrayKeyMoved = (event.dest.index);
        var arrayKeyPrevious = (event.dest.index - 1);

        console.log('arrayKeyNext', arrayKeyNext);
        console.log('arrayKeyMoved', arrayKeyMoved);
        console.log('arrayKeyPrevious', arrayKeyPrevious);

        var itemNext = event.dest.sortableScope.modelValue[arrayKeyNext];
        var itemMoved = event.dest.sortableScope.modelValue[arrayKeyMoved];
        var itemPrevious = event.dest.sortableScope.modelValue[arrayKeyPrevious];

        console.log('itemNext', itemNext);
        console.log('itemMoved', itemMoved);
        console.log('itemPrevious', itemPrevious);


        if (arrayKeyPrevious != -1 && typeof itemNext != 'undefined') {


          var reorderOrder = (((itemNext.order - itemPrevious.order) / 2) + itemPrevious.order);
        } else if (arrayKeyPrevious == -1 && itemNext.order != 0) {
          var reorderOrder = (((itemNext.order) / 2));
          //console.log('nope');
          //return;
        } else if (itemPrevious.order != 0 && typeof itemNext === 'undefined') {
          var reorderOrder = (itemPrevious.order + 1);

        }

        console.log('reorderOrder', reorderOrder);

        vm.reorder = {
          id: itemMoved.id,
          type: 'section',
          id_parent: itemMoved.id_parent,
          order: reorderOrder
        };

        console.log('pre API vm.sections', vm.sections);


        api.items.reorder(vm.reorder.id, vm.reorder.order, vm.reorder.type, vm.reorder.id_parent, token).error(function (res) {
          $rootScope.message('Unknown error updating server with reorder info.', 'warning');
        }).success(function (res) {
          if (res.code) {
            vm.isLoader = false;
            return $rootScope.message("Error updating reorder information. (" + res.code + ": " + res.message + ")");
          } else {

            vm.isLoader = false;
            $rootScope.message("Checklist has been modified");

            var itemIndex;

            itemIndex = vm.sections.indexOf(itemMoved);
            console.log('itemIndex', itemIndex);
            vm.sections[itemIndex].order = vm.reorder.order;

            vm.organizeData();

            console.log('post vm.sections', vm.sections);

            var packet;
            packet = {
              catalog: 'sections',
              type: 'reorder',
              user: {
                idCON: $rootScope.user.idCON,
                name: $rootScope.user.name
              },
              record: vm.sections[itemIndex]
            };
            console.log('emitting data', packet);
            $rootScope.socketio.emit('data', packet);

          }
        });

      },
      containment: '#sections',
      allowDuplicates: false
    };

    vm.dragControlListenersHeadings = {

      accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {

        if (sourceItemHandleScope.itemScope.heading && (!sourceItemHandleScope.itemScope.item)) {
          //console.log('truthy');
          //console.log('sourceItemHandleScope', sourceItemHandleScope);
          //console.log('sourceItemHandleScope.itemScope', sourceItemHandleScope.itemScope);
          //console.log('sourceItemHandleScope.itemScope.section', sourceItemHandleScope.itemScope.section);
          //console.log('sourceItemHandleScope.itemScope.heading', sourceItemHandleScope.itemScope.heading);
          //console.log('sourceItemHandleScope.itemScope.item', sourceItemHandleScope.itemScope.item);
          return true
        } else {
          //console.log('falsy');
          //console.log('sourceItemHandleScope', sourceItemHandleScope);
          //console.log('sourceItemHandleScope.itemScope', sourceItemHandleScope.itemScope);
          //console.log('sourceItemHandleScope.itemScope.section', sourceItemHandleScope.itemScope.section);
          //console.log('sourceItemHandleScope.itemScope.heading', sourceItemHandleScope.itemScope.heading);
          //console.log('sourceItemHandleScope.itemScope.item', sourceItemHandleScope.itemScope.item);
          return false
        }


      },
      itemMoved: function (event) {
        var moveSuccess, moveFailure;
        /**
         * Action to perform after move success.
         */
        moveSuccess = function () {
        };

        /**
         * Action to perform on move failure.
         * remove the item from destination Column.
         * insert the item again in original Column.
         */
        moveFailure = function () {
          eventObj.dest.sortableScope.removeItem(eventObj.dest.index);
          eventObj.source.itemScope.sortableScope.insertItem(eventObj.source.index, eventObj.source.itemScope.item);
        };

      },
      orderChanged: function (event) {


        console.log('event', event);

        // Location where heading was dragged to


        var arrayKeyNext = (event.dest.index + 1);
        var arrayKeyMoved = (event.dest.index);
        var arrayKeyPrevious = (event.dest.index - 1);

        console.log('arrayKeyNext', arrayKeyNext);
        console.log('arrayKeyMoved', arrayKeyMoved);
        console.log('arrayKeyPrevious', arrayKeyPrevious);

        var itemNext = event.dest.sortableScope.modelValue[arrayKeyNext];
        var itemMoved = event.dest.sortableScope.modelValue[arrayKeyMoved];
        var itemPrevious = event.dest.sortableScope.modelValue[arrayKeyPrevious];

        console.log('itemNext', itemNext);
        console.log('itemMoved', itemMoved);
        console.log('itemPrevious', itemPrevious);


        if (arrayKeyPrevious != -1 && typeof itemNext != 'undefined') {


          var reorderOrder = (((itemNext.order - itemPrevious.order) / 2) + itemPrevious.order);
        } else if (arrayKeyPrevious == -1 && itemNext.order != 0) {
          var reorderOrder = (((itemNext.order) / 2));
          //console.log('nope');
          //return;
        } else if (itemPrevious.order != 0 && typeof itemNext === 'undefined') {
          var reorderOrder = (itemPrevious.order + 1);

        }

        console.log('reorderOrder', reorderOrder);

        vm.reorder = {
          id: itemMoved.id,
          type: 'heading',
          id_parent: itemMoved.id_parent,
          order: reorderOrder
        };

        console.log('pre API vm.headings', vm.headings);


        api.items.reorder(vm.reorder.id, vm.reorder.order, vm.reorder.type, vm.reorder.id_parent, token).error(function (res) {
          $rootScope.message('Unknown error updating server with reorder info.', 'warning');
        }).success(function (res) {
          vm.isLoader = false;
          if (res.code) {
            return $rootScope.message("Error updating reorder information. (" + res.code + ": " + res.message + ")");
          } else {

            $rootScope.message("Checklist has been modified");

            var itemIndex;

            itemIndex = vm.headings.indexOf(itemMoved);
            console.log('itemIndex', itemIndex);
            vm.headings[itemIndex].order = vm.reorder.order;

            vm.organizeData();

            console.log('post vm.headings', vm.headings);

            var packet;
            packet = {
              catalog: 'headings',
              type: 'reorder',
              user: {
                idCON: $rootScope.user.idCON,
                name: $rootScope.user.name
              },
              record: vm.headings[itemIndex]
            };
            console.log('emitting data', packet);
            $rootScope.socketio.emit('data', packet);

          }
        });

      },
      containment: '#headings',
      allowDuplicates: false
    };

    vm.dragControlListenersItems = {
      accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {

        if (sourceItemHandleScope.itemScope.item) {
          //console.log('truthy');
          //console.log('destSortableScope', destSortableScope);
          //console.log('sourceItemHandleScope', sourceItemHandleScope);
          //console.log('sourceItemHandleScope.itemScope', sourceItemHandleScope.itemScope);
          //console.log('sourceItemHandleScope.itemScope.section', sourceItemHandleScope.itemScope.section);
          //console.log('sourceItemHandleScope.itemScope.heading', sourceItemHandleScope.itemScope.heading);
          //console.log('sourceItemHandleScope.itemScope.item', sourceItemHandleScope.itemScope.item);

          var sourceItemID = sourceItemHandleScope.itemScope.item.id;

          var modelArray;

          modelArray = destSortableScope.modelValue;

          //console.log('sourceItemHandleScope.sortableScope.modelValue', sourceItemHandleScope.sortableScope.modelValue);

          function findItem(element) {
            return element.id === sourceItemID;
          }


          var abc = sourceItemHandleScope.sortableScope.modelValue.findIndex(findItem);


          return true
        } else {
          //console.log('falsy');
          //console.log('destSortableScope', destSortableScope);
          //console.log('sourceItemHandleScope', sourceItemHandleScope);
          //console.log('sourceItemHandleScope.itemScope', sourceItemHandleScope.itemScope);
          //console.log('sourceItemHandleScope.itemScope.section', sourceItemHandleScope.itemScope.section);
          //console.log('sourceItemHandleScope.itemScope.heading', sourceItemHandleScope.itemScope.heading);
          //console.log('sourceItemHandleScope.itemScope.item', sourceItemHandleScope.itemScope.item);

          console.log('sourceItemID', sourceItemID);

          return false
        }


      },
      orderChanged: function (event) {

        console.log('event', event);

        // Location where item was dragged to


        var arrayKeyNext = (event.dest.index + 1);
        var arrayKeyMoved = (event.dest.index);
        var arrayKeyPrevious = (event.dest.index - 1);

        console.log('arrayKeyNext', arrayKeyNext);
        console.log('arrayKeyMoved', arrayKeyMoved);
        console.log('arrayKeyPrevious', arrayKeyPrevious);

        var itemNext = event.dest.sortableScope.modelValue[arrayKeyNext];
        var itemMoved = event.dest.sortableScope.modelValue[arrayKeyMoved];
        var itemPrevious = event.dest.sortableScope.modelValue[arrayKeyPrevious];

        console.log('itemNext', itemNext);
        console.log('itemMoved', itemMoved);
        console.log('itemPrevious', itemPrevious);


        if (arrayKeyPrevious != -1 && typeof itemNext != 'undefined') {


          var reorderOrder = (((itemNext.order - itemPrevious.order) / 2) + itemPrevious.order);
        } else if (arrayKeyPrevious == -1 && itemNext.order != 0) {
          var reorderOrder = (((itemNext.order) / 2));
          console.log('reorderOrder', reorderOrder);
          console.log('arrayKeyPrevious == -1 && itemNext.order != 0');
          //return;
        } else if (itemPrevious.order != 0 && typeof itemNext === 'undefined') {
          var reorderOrder = (itemPrevious.order + 1);
          console.log('reorderOrder', reorderOrder);
          console.log('itemPrevious.order != 0 && typeof itemNext === undefined');
          //return;
        }

        console.log('reorderOrder', reorderOrder);

        vm.reorder = {
          id: itemMoved.id,
          type: 'item',
          id_parent: itemMoved.id_parent,
          order: reorderOrder
        };

        console.log('pre API vm.items', vm.items);


        api.items.reorder(vm.reorder.id, vm.reorder.order, vm.reorder.type, vm.reorder.id_parent, token).error(function (res) {
          $rootScope.message('Unknown error updating server with reorder info.', 'warning');
        }).success(function (res) {
          var i, len, old, packet, ref1;
          if (res.code) {
            return $rootScope.message("Error updating reorder information. (" + res.code + ": " + res.message + ")");
          } else {

            $rootScope.message("Checklist has been modified");

            var itemIndex;

            itemIndex = vm.items.indexOf(itemMoved);
            console.log('itemIndex', itemIndex);
            vm.items[itemIndex].order = vm.reorder.order;

            vm.organizeData();

            console.log('post vm.items', vm.items);

            var packet;
            packet = {
              catalog: 'items',
              type: 'reorder',
              user: {
                idCON: $rootScope.user.idCON,
                name: $rootScope.user.name
              },
              record: vm.items[itemIndex]
            };
            console.log('emitting data', packet);
            $rootScope.socketio.emit('data', packet);

          }
        });


      },
      containment: '#items',
      allowDuplicates: false
    };


    vm.sortableOptions = {
      handle: '.handle',
      forceFallback: true,
      ghostClass: 'checklist-item-placeholder',
      fallbackClass: 'checklist-item-ghost',
      fallbackOnBody: true,
      sort: true
    };

    vm.msScrollOptions = {
      suppressScrollX: true
    };


    //console.log('vm.checklistFilters', vm.checklistFilters);
    vm.checklistFiltersDefaults = angular.copy(vm.checklistFilters);
    vm.showAllChecklists = true;

    vm.checklistOrder = '';
    vm.checklistOrderDescending = false;


    /*
     LEGACY CONTROLLER
     */
    function setChecklistCtrlBlank() {
      vm.conflicts = 0;
      vm.nonCompliant = [0, 0];
      vm.loading = vm.loaded = {
        checklist: false,
        sections: false,
        headings: false,
        items: false,
        checkboxes: false,
        attachments: false
      };
      vm.checklists = [];
      vm.sections = [];
      vm.headings = [];
      vm.items = [];
      vm.checkboxes = [];
      vm.attachments = [];
      vm.SelectedAttachments = [];
      vm.referencess = [];
      if (!vm.expanded) {
        console.log('set vm.expanded');
        vm.expanded = {
          sections: [],
          headings: [],
          items: [],
          referencess: []
        };
      } else {
        console.log('vm.expanded is already set', vm.expanded);
      }
      vm.type = [];
      return vm.itemShortLength = 45;
    };

    vm.setChecklistCtrlBlank();


    /*
     NESTED ACCORDION FUNCTIONS
     */

    function children(whats, parentID) {
      return $filter('orderBy')($filter('filter')(vm[whats], {
        id_parent: parentID
      }, true), 'order');
    };
    function isExpandable(what, which) {
      if (what === !'item') {
        return true;
      }
      if (which.name.length > vm.itemShortLength) {
        return true;
      }
      return false;
    };
    function toggleableChildren(what, parentID) {
      var items, whats;
      if (what === 'section') {
        return vm.sections;
      }
      whats = what + 's';
      if (what !== 'item') {
        return $filter('filter')(vm[whats], {
          id_parent: parentID
        }, true);
      }
      items = vm.items;
      return $filter('filter')(items, function (item, index, items) {
        if (item.id_parent === parentID && vm.isExpandable(what, item)) {
          return true;
        }
      });
    };
    function expand(what, which, parentID) {



      var catalog, item, items, key, whats;
      if (parentID == null) {
        parentID = null;
      }
      whats = what + 's';
      if (which === 'all') {
        catalog = [];
        if (parentID === null) {
          catalog = vm.sections;
        } else {
          items = vm.toggleableChildren(what, parentID);
          for (key in items) {
            item = items[key];
            if (indexOf.call(vm.expanded[whats], item) < 0) {
              catalog.push(item);
            }
          }
        }
        console.log('vm.expanded', vm.expanded);
        return vm.expanded[whats] = vm.expanded[whats].concat(catalog);
      } else {
        vm.expanded[whats].push(which);
        console.log('vm.expanded after push', vm.expanded);
      }
    };
    function collapse(what, which, parentID) {
      var catalog, item, items, key, ref1, whats;
      if (parentID == null) {
        parentID = null;
      }
      whats = what + 's';
      if (which === 'all') {
        catalog = [];
        if (parentID === !null) {
          items = vm.toggleableChildren(what, parentID);
          ref1 = vm.expanded[whats];
          for (key in ref1) {
            item = ref1[key];
            if (indexOf.call(items, item) < 0) {
              catalog.push(item);
            }
          }
        }
        return vm.expanded[whats] = catalog;
      } else {
        return vm.expanded[whats].remove(which);
      }
    };
    function isExpanded(what, which) {
      var whats, i, x;
      whats = what + 's';
      x = false;

      vm.isExpandedCounter++;

      //console.log('indexOf', vm.expanded[whats].indexOf(which.id));

      for (i = 0; i < vm.expanded[whats].length; i++) {
        if (vm.expanded[whats][i].id == which.id) {
          console.log('found');
          return true;
        }
      }
    };

    function toggle(what, which, parentID) {
      debugger;


      if (parentID == null) {
        parentID = null;
      }
      if (what === 'item' && which.name.length <= vm.itemShortLength) {
        return false;
      }
      if (what === 'references') {
        which.showReferences = !which.showReferences;
        return false;
      }
      if (what === 'na') {
        which.notApplicable = !which.notApplicable;
        return false;
      }
      if (vm.isExpanded(what, which)) {
        return vm.collapse(what, which, parentID);
      } else {
        return vm.expand(what, which, parentID);
      }
    };


    function toggleComplete(checklist) {
      api.checklists.toggleComplete(checklist.id).error(function (res) {
        return $rootScope.message("Error toggling Complete. (Communication with Server)", 'warning');
      }).success(function (res) {

        if (res && res.checklist && res.checklist.complete == 1) {
          $rootScope.message("Checklist marked not completed", 'success');
        } else if (res && res.checklist && res.checklist.complete == 0) {
          $rootScope.message("Checklist completed", 'success');
        }

        if (res === void 0 || res === null || res === '') {

          return $rootScope.message("Error toggling Complete. (No response.)", 'warning');
        } else if (res.code) {

          return $rootScope.message(res.message, 'warning');
        } else {


          return vm.checklists.forEach(function (local) {
            var index, notifyItem;
            if (local.id === res.checklist.id) {
              //console.log('local found', local);
              index = vm.checklists.indexOf(local);
              //console.log('local index is', index);
              vm.checklists[index] = res.checklist;
              vm.organizeData();
              notifyItem = $.extend({}, res.checklist, {
                type: 'complete',
                idFDI: res.checklist.idFDI_latest
              });
              return $rootScope.notify(notifyItem);
            }
          });
        }
      });
    };


    /*
     INITIAL DATA LOAD
     */
    vm.feedsJoined = false;
    vm.loadComplete = false;

    function joinFeeds() {
      var checklist, heading, item, j, k, l, len, len1, len2, len3, m, ref, ref1, ref2, ref3, ref4, section;
      //console.log('joinFeeds()');
      if (vm.feedsJoined) {
        return true;
      }
      if (!vm.loadComplete) {
        return false;
      }
      if (!((ref = $rootScope.socketio) != null ? ref.connected : void 0)) {
        return false;
      }
      //console.log('joining feeds', vm.loadComplete, vm.checklists, vm.sections, vm.headings, vm.items);
      ref1 = vm.items;
      for (j = 0, len = ref1.length; j < len; j++) {
        item = ref1[j];
        //console.log('joining room: ', "/items/" + item.id);
        $rootScope.socketio.emit('join', "/items/" + item.id);
      }
      ref2 = vm.headings;
      for (k = 0, len1 = ref2.length; k < len1; k++) {
        heading = ref2[k];
        //console.log('joining room: ', "/headings/" + heading.id);
        $rootScope.socketio.emit('join', "/headings/" + heading.id);
      }
      ref3 = vm.sections;
      for (l = 0, len2 = ref3.length; l < len2; l++) {
        section = ref3[l];
        //console.log('joining room: ', "/sections/" + section.id);
        $rootScope.socketio.emit('join', "/sections/" + section.id);
      }
      ref4 = vm.checklists;
      for (m = 0, len3 = ref4.length; m < len3; m++) {
        checklist = ref4[m];
        //console.log('joining room: ', "/checklists/" + checklist.idCHK);
        $rootScope.socketio.emit('join', "/checklists/" + checklist.idCHK);
      }
      return vm.feedsJoined = true;
      //console.log('feedsJoined', true);
    };

    function completeLoad() {
      if (vm.loading.checklist || vm.loading.sections || vm.loading.headings || vm.loading.items || vm.loading.attachments) {
        return false;
      }
      vm.loadComplete = true;
      vm.loading.checklist = false;
      vm.joinFeeds();
      vm.organizeData();

      //return $scope.$broadcast('event:dataOrganized');
    };

    function organizeData() {
      vm.items.forEach(function (item) {
        return item.attachments = vm.children('attachments', item.id.toString());
      });
      vm.headings.forEach(function (heading) {
        heading.items = vm.children('items', heading.id.toString());
        return heading.attachments = vm.children('attachments', heading.id.toString());
      });
      vm.sections.forEach(function (section) {
        var section_id = section.id.toString();

        section.headings = vm.children('headings', section_id);
        return section.attachments = vm.children('attachments', section.id.toString());
      });

      vm.checklists.forEach(function (checklist) {
        checklist.sections = vm.children('sections', checklist.idCHK);
        return checklist.attachments = vm.children('attachments', checklist.idCHK.toString());
      });
      //console.log('data organized', vm.checklists);
    }

    function checkIfLinked(idCHK) {
      //console.log('cfc vm.checklists', $rootScope.checklists);
      var cfc;
      cfc = $filter('filter')($rootScope.checklists, {
        idCHK: idCHK
      });
      //console.log(cfc);
      //console.log('checking if viewAs.user is linked to checklist', idCHK, $rootScope.viewAs.user, $rootScope.checklists);
      return vm.isLinked = cfc.length > 0;
      return console.log('set isLinked', vm.isLinked);
    };

    function loadChecklist(idCHK) {
      vm.isLoader = true;
      //console.log('idCHK', idCHK);
      vm.setChecklistCtrlBlank();
      vm.checkIfLinked(idCHK);
      if (vm.isLinked || !vm.isLinked) {
        //console.log('is linked');
        if (!vm.loaded.checklist) {
          //console.log('not loaded');
          $scope.getChecklinked = function () {


            api.checklists.get(idCHK, token).success(function (res) {
              var ref;

              if ((ref = res.checklists) != null ? ref.length : void 0) {
                vm.checklists = res.checklists;
                vm.isLinked = true;
                //vm.isLoader = false;
                //console.log('vm.checklists', vm.checklists);
              } else {
                //console.log('problem');
                vm.checklists = [];
                // vm.isLinked = false;
              }

              console.log('not sure');
              vm.loaded.checklist = true;
              return $scope.$broadcast('event:checklistLoaded');
              console.log('broadcast event:checklistLoaded');
            })["finally"](function () {
              vm.loading.checklist = false;
              vm.isLoader = false
              return vm.completeLoad();

            });
          }
          $scope.getChecklinked();


        }

        if (!vm.loaded.sections) {
          api.sections.get(idCHK, token).success(function (res) {
            var ref;
            vm.isLoader = false;
            if ((ref = res.sections) != null ? ref.length : void 0) {
              vm.sections = res.sections;
            }
            return vm.loaded.sections = true;
          })["finally"](function () {
            vm.loading.sections = false;
            return vm.completeLoad();

          });
        }


        if (!vm.loaded.headings) {
          api.headings.get(idCHK).success(function (res) {
            var ref;
            if ((ref = res.headings) != null ? ref.length : void 0) {
              vm.headings = res.headings;
            }
            return vm.loaded.headings = true;
          })["finally"](function () {
            vm.loading.headings = false;
            return vm.completeLoad();
          });
        }
        if (!vm.loaded.items) {
          api.items.get(idCHK).success(function (res) {
            var ref;
            if ((ref = res.items) != null ? ref.length : void 0) {
              vm.items = res.items;
              console.log('res.items', res.items)
            }
            vm.loaded.items = true;

            return $scope.$emit('event:itemsLoaded');
            //console.log('broadcast event:itemsLoaded');
          })["finally"](function () {
            vm.loading.items = false;
            return vm.completeLoad();
          });
        }


        if (!vm.loaded.attachments) {
          console.log('look for attachments');
          api.attachments.checklist(idCHK, token).success(function (res) {
            var ref;
            console.log(res);
            vm.isLoader = false;
            if ((ref = res.attachments) != null ? ref.length : void 0) {
              vm.attachments = vm.attachments.concat(res.attachments);
              $rootScope.attachments = res.attachments;
              console.log("attachmentlength", res.attachments.length);
            }
            vm.loaded.attachments = true;
            return $scope.$broadcast('event:attachmentsLoaded');
            //console.log('broadcast event:attachmentsLoaded');
          })["finally"](function () {
            vm.loading.attachments = false;
            return vm.completeLoad();
          });
        }

        return true;
      } else {
        console.log('not linked');
        vm.loading = {
          checklist: false,
          sections: false,
          headings: false,
          items: false,
          attachments: false,
          checkboxes: false
        };

        vm.loaded = {
          checklist: true,
          sections: true,
          headings: true,
          items: true,
          attachments: false,
          checkboxes: true
        };
      }
    };

    // $scope.$on('event:checklistsLoaded', function () {
    //   if (!vm.loading.checklist) {
    //     return vm.loadChecklist(vm.idCHK);
    //   }
    // });

    /*
     SET UP THE SOCKET CONNECTION FOR REALTIME
     */
    function setSocketStuff() {
      //console.log('setting socket stuff for checklist');
      vm.joinFeeds();
      return $rootScope.socketio.on('data', function (update) {
        var catalog, local;
        if (update.user.idCON !== $rootScope.user.idCON) {
          //console.log('section data received', update);
          catalog = update.catalog;
          switch (update.type) {
            case 'add':
              debugger;
              $scope[catalog] = $scope[catalog].concat(update.record);
              $rootScope.socketio.emit('feed_subscribe', {
                idCON: $rootScope.user.idCON,
                ids: [update.record.id]
              });
              break;
            case 'edit':
            case 'reorder':
              $scope[catalog].forEach(function (local) {
                var index;
                if (local.id === update.record.id) {
                  //console.log('local found', local);
                  index = $scope[catalog].indexOf(local);
                  //console.log('local index is', index);
                  return $scope[catalog][index] = update.record;
                }
              });
              break;
            case 'delete':
              local = $filter('filter')($scope[catalog], {
                id: update.record.id
              }, true);
              if (local != null ? local.length : void 0) {
                $scope[catalog].remove(local[0]);
                $rootScope.socketio.emit('feed_unsubscribe', {
                  idCON: $rootScope.user.idCON,
                  ids: [update.record.id]
                });
              }
          }
          vm.organizeData();
          return $scope.$apply();
        }
      });
    };

    if ((ref = $rootScope.socketio) != null ? ref.connected : void 0) {
      //console.log('socket was already connected (checklist)');
      vm.setSocketStuff();
    }

    $scope.$on('event:socketConnected', function () {
      console.log('received ng event:socketConnected (checklist)');
      return vm.setSocketStuff();
    });

    /*
     NESTED ACCORDION FUNCTIONS
     */
    function children(whats, parentID) {
      return $filter('orderBy')($filter('filter')(vm[whats], {
        id_parent: parentID
      }, true), 'order');
    };

    /*
     DATA FUNCTIONS
     */
    $scope.svc = function (what) {

      var checklists, sections, items, checkbox, headings;

      if (what === 'checklist') {
        return api.checklists;
      }
      if (what === 'section') {
        return api.sections;
      }
      if (what === 'heading') {
        return api.headings;
      }
      if (what === 'item') {
        return api.items;
      }
      if (what === 'checkbox') {
        return api.checkbox;
      }
    };

    function svc(what) {
      var checklist, sections, headings, items, checkbox;

      if (what === 'checklist') {
        return api.checklists;
      }
      if (what === 'section') {
        return api.sections;
      }
      if (what === 'heading') {
        return api.headings;
      }
      if (what === 'item') {
        return api.items;
      }
      if (what === 'checkbox') {
        return api.checkbox;
      }
    };

    function createSegment(what, name, to, type, info, item_type, alert) {
      vm.isLoader = true;

      var count, order, ref1, svc, whats;
      if (to == null) {
        to = null;
      }
      if (type == null) {
        type = 1;
      }
      if (info == null) {
        info = '';
      }
      if (item_type == null) {
        item_type = '';
      }
      if (alert == null) {
        alert = '';
      }
      whats = what + 's';

      svc = $scope.svc(what);

      //console.log('svc', svc);

      //console.log('what post svc', what);
      vm.newItem.submitting = true;
      order = 1;
      if (what === 'section') {
        order += vm.sections.length;
      } else {
        count = (ref1 = $filter('filter')(vm[whats], {
          id_parent: to
        }, true)) != null ? ref1 : [];
        order += count.length;
      }
      vm.headingDialog = true;
      return svc.add(name, order, to, type, info, item_type, alert).success(function (res) {
        vm.headingDialog = false;
        var notifyItem, packet;
        if (res.code) {
          vm.isLoader = false;
          vm.closeDialog();
          return $rootScope.message(res.message, 'warning');
        } else {

          vm.closeDialog();
          vm.isLoader = false;
          vm[whats].push(res[what]);
          vm.organizeData();
          packet = {
            catalog: whats,
            type: 'add',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: res[what]
          };
          //console.log('emitting data', packet);
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, res[what], {
            type: 'data'
          });
          //console.log('about to sent notify event', notifyItem);
          $rootScope.socketio.emit('notify', [notifyItem]);
          $rootScope.message('Created successfully', 'success');
          // //Added by me for manipulating newly created Checkboxes// 
          $rootScope.showingUsers.forEach(function (user) {
            vm.displayUserCheckboxes(user);
          });
          vm.closeDialog();
        }
      })["finally"](function () {
        return vm.newItem.submitting = false;
      });
    };

    function destroy(what, item) {

      var svc, whats;
      svc = vm.svc(what);
      whats = what + 's';

      return svc.destroy(item.rid).success(function (res) {
        var notifyItem, packet;
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm[whats].remove(item);
          vm.expanded[whats].remove(item.id);
          vm.organizeData();
          packet = {
            catalog: whats,
            type: 'delete',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: item
          };
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, item, {
            type: 'data'
          });
          return $rootScope.socketio.emit('notify', [notifyItem]);
        }
      });
    };

    function isForm(item) {
      /*
       1= bool, 2= str, 3 =num
       */
      return item.type === 2 || item.type === 3;
    };

    function add(what, to, ev, option) {
      debugger;
      var option;
      var title;

      if (option === void 0 || option === null || option === '') {
        option = 1;
      } else {
        option = option;
      }


      switch (what) {
        case 'item':
          if (option == '1') {
            vm.type =
              {
                title: 'Checkbox',
                label: 'Checkbox Label',
                type: 'checkbox',
              }
          } else if (option == '2') {
            vm.type =
              {
                title: 'Text Box',
                label: 'Text Box Label',
                type: 'textbox',

              }
          }
          else if (option == 'yn') {
            vm.type =
              {
                title: 'Add Y/N Checkboxes',
                label: 'Add Y/N Checkboxes Label',
                type: 'yn',

              }
          }
          break;
        case 'section':
          vm.type.title = 'Section';
          vm.type.label = 'Section Label'
          vm.type.type = '';
          break;
        case 'heading':
          vm.type.title = 'Heading';
          vm.type.label = 'Heading Label';
          vm.type.type = '';
          break;
        default:
          vm.type.title = what;
          vm.type.label = what + 'label';
          vm.type.type = '';

      }


      vm.newItem = {
        type: what,
        to: to,
        option: option,
        name: '',
        submitting: false,
        dataType: option
      };

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-add-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };

    function userCheckboxes(userID) {
      return $filter('filter')(vm.checkboxes, {
        id_user: userID
      }, true);
    };

    vm.item = {
      applies: function (itemID) {
        if ($filter('filter')(vm.checkboxDisplay.userCheckboxes(), {
          id_item: itemID,
          type: 1
        }, true)[0] === !void 0) {
          return true;
        }
      },
      complies: function (itemID) {
        if ($filter('filter')(vm.checkboxDisplay.userCheckboxes(), {
          id_item: itemID,
          type: 2
        }, true)[0] === !void 0) {
          return true;
        }
      }
    }

    function getUserKey(user) {
      var ref1, ref2;
      if (user.idCON === ((ref1 = $rootScope.showingUsers[0]) != null ? ref1.idCON : void 0)) {
        return 0;
      }
      if (user.idCON === ((ref2 = $rootScope.showingUsers[1]) != null ? ref2.idCON : void 0)) {
        return 1;
      }
      return -1;
    };

    function displayUserCheckboxes(user) {
      ////debugger;
      var userID, userKey;
      userKey = vm.getUserKey(user);
      console.log('initial userKey check', userKey);
      if (userKey === -1) {
        userKey = $rootScope.showingUsers.length ? 1 : 0;
      }
      console.log('final userKey', userKey);
      $rootScope.showingUsers[userKey] = user;
      userID = user.idCON;
      if (!vm.userCheckboxes(userID).length) {
        vm.loading.checkboxes = true;
        return api.checkbox.get(vm.idCHK, userID, token).error(function (res) {
          return $rootScope.message('Error talking to server to find user checkboxes.', 'warning');
        }).success(function (res) {
          vm.isLoader = false;
          console.log('vm.checkboxes', vm.checkboxes);

          vm.checkboxes = vm.checkboxes.concat(res.checkboxes);
          return vm.appendCheckboxesToItems(user);
        })["finally"](function () {
          return vm.loading.checkboxes = false;
        });
      }
    };

    function evaluateConflicts(item, operation) {
      ////debugger;
      var addConflicts, leftNonCompliant, ref1, ref2, rightNonCompliant;
      item = api.summary.evaluateItem(item, item.checkbox, token);
      addConflicts = operation * +item.conflicts;
      vm.conflicts += addConflicts;
      if (((ref1 = item.checkbox) != null ? ref1[0] : void 0) !== void 0) {
        leftNonCompliant = operation * +item.checkbox[0].nonCompliant;
        vm.nonCompliant[0] += leftNonCompliant;
      }
      if (((ref2 = item.checkbox) != null ? ref2[1] : void 0) !== void 0) {
        rightNonCompliant = operation * +item.checkbox[1].nonCompliant;
        vm.nonCompliant[1] += rightNonCompliant;
      }
      return item;
    }

    function appendCheckboxesToItems(user) {
      ////debugger;
      var userKey;
      vm.nonCompliant = [0, 0];
      vm.conflicts = 0;
      userKey = vm.getUserKey(user);
      if (userKey === -1) {
        return false;
      }
      return vm.items.forEach(function (item) {
        var checkbox;
        if (item.checkbox === void 0) {
          item.checkbox = [];
        }
        checkbox = $filter('filter')(vm.checkboxes, {
          id_item: item.id,
          id_contact: user.idCON
        }, true);
        if (checkbox != null ? checkbox.length : void 0) {
          item.checkbox[userKey] = checkbox[0];
        }
        return vm.evaluateConflicts(item, +1);
      });
    };

    function removeUserCheckboxes(user) {
      var action, userKey;
      userKey = vm.getUserKey(user);
      if (userKey === -1) {
        return false;
      }
      action = ['shift', 'pop'][userKey];
      vm.items.forEach(function (item) {
        var checkbox, ref1;
        checkbox = $filter('filter')(vm.checkboxes, {
          id_item: item.id,
          id_contact: user.idCON
        }, true);
        if ((ref1 = item.checkbox) != null) {
          ref1[action]();
        }
        return item.checkbox[1] = [];
      });
      $rootScope.showingUsers[action]();
      vm.conflicts = 0;
      vm.nonCompliant = [0, 0];
      vm.items.forEach(function (item) {
        return vm.evaluateConflicts(item, +1);
      });
      return console.log('user checkboxes removed', user, $rootScope.showingUsers);
    };

    function showLinkedUsers(ev, item) {

      console.log()

      vm.item = {
        'name': item.name
      }
      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-show-linked-users-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    $scope.$on('event:itemsLoaded', function () {
      console.log('received event:itemsLoaded', $rootScope.showingUsers);
      return $rootScope.showingUsers.forEach(function (user) {
        vm.displayUserCheckboxes(user);
      });
    });

    function toggleCheckbox(item, which, userKey) {
      debugger;
      vm.evaluateConflicts(item, -1);
      return api.checkbox.toggle(item.id, $rootScope.showingUsers[userKey].idCON, which, token).success(function (res) {
        if (item.checkbox === void 0) {
          item.checkbox = [];
        }
        //  item.checkbox[userKey] = res.checkboxes[0];
        item.checkbox[userKey] = res.checkboxes[0];
        return vm.evaluateConflicts(item, +1);
      });
    };

    function showWhichInviteContactData(friend) {
      var ref1, ref2, ref3;
      if (((ref1 = $rootScope.user) != null ? ref1.idCON : void 0) === (friend != null ? (ref2 = friend.contacts) != null ? (ref3 = ref2.accepter) != null ? ref3.id : void 0 : void 0 : void 0)) {
        return 'originator';
      }
      return 'accepter';
    };

    function CFC() {
      var CFCs, checklists, group;
      group = vm.group();
      checklists = $rootScope.children('checklists', group.id);
      CFCs = $filter('filter')(checklists, {
        idCHK: vm.idCHK
      }, true);
      return CFCs[0];
    };
    function group() {
      return $filter('filter')($rootScope.groups, {
        id: vm.checklists[0].id_parent
      }, true)[0];
    };
    function previous() {
      var cfc, checklists, group, previousIndex, thisIndex;
      group = vm.group();
      if (group === void 0) {
        return void 0;
      }
      checklists = $rootScope.children('checklists', group.id);
      cfc = vm.CFC();
      thisIndex = checklists.indexOf(cfc);
      previousIndex = thisIndex - 1;
      return checklists[thisIndex - 1];
    };
    function next() {
      var cfc, checklists, group, nextIndex, thisIndex;
      group = vm.group();
      if (group === void 0) {
        return void 0;
      }
      checklists = $rootScope.children('checklists', group.id);
      cfc = vm.CFC();
      thisIndex = checklists.indexOf(cfc);
      nextIndex = thisIndex + 1;
      return checklists[thisIndex + 1];
    };

    /*
     PUBLISH
     */
    vm.publish = {
      idCHK: null,
      name: null,
      pvt: true,
      submitting: false,
      gatherInfo: function (idCHK) {
        vm.publish.idCHK = idCHK;
        return true;
      },
      togglePrivate: function () {
        this.pvt = !this.pvt;
        return true;
      },
      publish: function () {

        console.log('vm.publish.name', vm.publish.name);

        var ref1, ref2;
        if (((ref1 = vm.publish.idCHK) != null ? ref1.length : void 0) && ((ref2 = vm.publish.name) != null ? ref2.length : void 0)) {
          vm.publish.submitting = true;
          return api.checklists.publish(vm.publish.idCHK, vm.publish.name, 'checklist', vm.publish.pvt, token).error(function (res) {
            return $rootScope.message('Unknown error publishing Template.', 'warning');
          }).success(function (res) {
            vm.isLoader = false;
            if (res.code) {
              return $rootScope.message("Error publishing Template. (" + res.code + ": " + res.message + ")", 'warning');
            } else {
              $rootScope.message("Template published successfully.");
              return $("#publishTemplate").modal('hide');
            }
          })["finally"](function () {
            vm.publish.submitting = false;
            vm.publish.idCHK = null;
            return vm.publish.name = null;
          });
        } else {
          return $rootScope.message('You must specify the Template Name.', 'warning');
        }
      }
    };

    /*
     UPLOAD EXCEL
     */
    vm.uploaderOpts = {
      url: 'ajax/checklist_details-uploadExcel.php',
      queueLimit: 1,
      filters: [
        {
          name: 'allTrue',
          fn: function (item) {
            return true;
          }
        }
      ],
      formData: [],
      removeAfterUpload: true,
      autoUpload: false,
      onCancelItem: function (item) {
        return item.remove();
      },
      onErrorItem: function (item, res) {
        return $rootScope.message('Unable to upload File.', 'warning');
      },
      onSuccessItem: function (item, res) {
        if (res.code) {
          return $rootScope.message("Error adding Checklist details: (" + res.code + ") " + res.message, 'warning');
        } else {
          $rootScope.message("File uploaded.  Please refresh the page to see the changes.");
          return $("#uploadFile").modal("hide");
        }
      },
      onAfterAddingFile: function (item) {
        return console.log('File added: ', item);
      },
      onWhenAddingFileFailed: function (item, filter, options) {
        return console.log('File add failed: ', item, filter, options);
      },
      onAfterAddingAll: function (addedItems) {
        console.log('All added: ', addedItems);
        vm.uploader.queue = addedItems;
        return console.log('Queue: ', vm.uploader.queue);
      }
    };
    //vm.uploader = new FileUploader(vm.uploaderOpts);
    vm.upload = function (chkID) {
      vm.uploader.formData = [
        {
          idCHK: chkID
        }
      ];
      console.log('Form Data: ', vm.uploader.formData);
      $("#uploadFile").modal("show");
      return null;
    };

    /*
     MODE SPECIFIC
     */
    vm.edit = {
      start: function (what, which) {
        var index, whats;
        whats = what + 's';
        index = vm[whats].indexOf(which);
        vm[whats][index].edit = {
          id: what === 'checklist' ? which.idCHK : which.id,
          rid: which.rid,
          index: index,
          type: what,
          text: which.name,
          info: '',
          submitting: false,
          error: null,
          message: ''
        };
        if (what === 'item') {
          vm[whats][index].edit.info = which.info;
        }
        return vm[whats][index].editing = true;
      },
      stop: function (which) {
        var whats;
        whats = which.type + 's';
        vm[whats][which.index].edit = null;
        return vm[whats][which.index].editing = false;
      },
      submit: function (which) {
        var whats;
        whats = which.type + 's';
        if (vm[whats][which.index].edit.text === vm[whats][which.index].name && vm[whats][which.index].edit.info === vm[whats][which.index].info) {
          vm.edit.stop(which);
          return false;
        }
        return api.edit.attemptEdit(which, token).error(function (res) {
          vm.isLoader = false;
          vm[whats][which.index].edit.error = res.code;
          return vm[whats][which.index].edit.message = res.message;
        }).success(function (res) {
          var notifyItem, packet;
          vm[whats][which.index] = res.updated;
          packet = {
            catalog: whats,
            type: 'edit',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: res.updated
          };
          console.log('emitting data', packet);
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, res.updated, {
            type: 'data'
          });
          $rootScope.notify(notifyItem);
          vm.organizeData();
          return $rootScope.showingUsers.forEach(function (user) {
            return vm.appendCheckboxesToItems(user);
          });
        })["finally"](function () {
          return vm.edit.stop(which);
        });
      }
    };


    /*
     LABELS
     */
    $scope.$on('event:labelsUpdated', function () {
      return vm.labels.selectable = $filter('filter')($rootScope.user.dashboard.labels, {
        type: vm.labels.item.type
      });
    });
    $scope.$on('event:labelSelectionUpdated', function (e, data) {
      var idx, item, itemLocal, showModal, user;
      console.log('labelSelectionUpdated triggered', data);
      user = data.user;
      item = data.item;
      if (user.idCON === $rootScope.user.idCON) {
        return console.log('event triggered by this user; no action');
      } else if (item.idCHK !== vm.idCHK) {
        return console.log('event triggered on other checklist');
      } else {
        console.log('event is relevant; replacing local item');
        itemLocal = $filter('filter')(vm.items, {
          id: item.id
        }, true)[0];
        if (itemLocal === void 0) {
          console.log('could not find local item');
        } else {
          idx = vm.items.indexOf(itemLocal);
          if (idx === -1) {
            console.log('could not index local item');
          } else {
            vm.items[idx] = item;
            console.log('local item replaced', idx, vm.items);
          }
        }
        if (item.id === vm.labels.item.id) {
          console.log('event is about this item!');
          showModal = ($('#select-labels-modal').data('bs.modal') || {
            isShown: false
          }).isShown;
          vm.labels.select(item, showModal);
          $scope.$apply();
          console.log('new item selected', vm.labels.item);
          return $rootScope.message("Label selection updated by " + user.name.full);
        }
      }
    });

    vm.labels = {
      saving: false,
      item: null,
      selected: [],
      selectable: [],
      select: function (item) {
        var base, base1;
        vm.labels.selected = item.labels;
        vm.labels.item = {
          id: item.id,
          index: vm.items.indexOf(item),
          type: item.type,
          displayType: typeof (base = item.type === 2) === "function" ? base({
            'Text': typeof (base1 = item.type === 3) === "function" ? base1({
              'Number': 'Apply/Comply'
            }) : void 0
          }) : void 0
        };
        vm.labels.saving = false;
        vm.labels.create.entering = false;
        vm.labels.create.saving = false;
        vm.labels.create.name = '';
        vm.labels.create.explanation = '';
        vm.labels.selectable = $filter('filter')($rootScope.user.dashboard.labels, {
          type: item.type
        });
        //console.log('item selected for label update', item);
        //console.log('labels selectable for item label update', vm.labels);
        vm.setLabels(item);
        return false;
      },
      isSelected: function (label) {
        //console.log('isSelected => label', label);
        var index;
        index = vm.labels.selected.indexOf(label.id);
        if (index < 0) {
          return false;
        }
        return true;
      },
      toggle: function (label) {
        var index, isSelected;
        isSelected = vm.labels.isSelected(label);
        if (isSelected) {
          index = vm.labels.selected.indexOf(label.id);
          return vm.labels.selected.splice(index, 1);
        } else {
          return vm.labels.selected.push(label.id);
        }
      },
      hide: function (lbl) {
        lbl.hiding = true;
        return api.dashboard.labels.hide(lbl.id).success(function (res) {
          var idx;
          vm.isLoader = false;
          if (res === void 0 || res === null || res === "") {
            return $rootScope.message("Server not responding properly.", 'warning');
          } else if (res.code) {
            //return $rootScope.message(res.message, 'warning');
          } else {
            idx = $rootScope.user.dashboard.labels.indexOf(lbl);
            $rootScope.user.dashboard.labels.splice(idx, 1);
            idx = vm.labels.selectable.indexOf(lbl);
            return vm.labels.selectable.splice(idx, 1);
          }
        }).error(function (res) {
          return $rootScope.message("Server not responding.", 'warning');
        })["finally"](function () {
          return lbl.hiding = false;
        });
      },
      save: function () {
        vm.isLoader = true;
        vm.labels.saving = true;
        return api.dashboard.labels.update(this.item.id, this.selected).success(function (res) {
          vm.isLoader = false;
          var notifyItem, packet;
          if (res === void 0 || res === null || res === "") {
            return $rootScope.message("Server not responding properly.", 'warning');
          } else if (res.code) {
            return $rootScope.message(res.message, 'warning');
          } else {
            vm.items[vm.labels.item.index] = res.item;
            packet = {
              catalog: 'items',
              type: 'edit',
              user: {
                idCON: $rootScope.user.idCON,
                name: $rootScope.user.name
              },
              record: res.item
            };
            //console.log('emitting data', packet);
            $rootScope.socketio.emit('data', packet);
            notifyItem = $.extend({}, res.item, {
              type: 'data'
            });
            //console.log('about to sent notify event', notifyItem);
            $rootScope.socketio.emit('notify', [notifyItem]);
            $rootScope.message("Labels saved.", 'success');
            vm.closeDialog();
            return vm.organizeData();
          }
        }).error(function (res) {
          return $rootScope.message("Server not responding.", 'warning');
        })["finally"](function () {

          return vm.labels.saving = false;
        });
      },
      create: {
        entering: false,
        saving: false,
        name: '',
        explanation: '',
        enter: function () {
          vm.labels.create.entering = true;
          return false;
        },
        save: function () {
          vm.isLoader = true;
          vm.labels.create.saving = true;
          //console.log('adding new label', vm.labels.item, this.name, this.explanation);
          return api.dashboard.labels.add(vm.labels.item.type, this.name, this.explanation).success(function (res) {
            vm.isLoader = false;
            if (res === void 0 || res === null || res === '') {
              return $rootScope.message("Server not responding properly.", 'warning');
            } else if (res.code) {
              return $rootScope.message(res.message, 'warning');
            } else {
              vm.labels.selectable.push(res.labels[0]);
              vm.labels.create.entering = false;
              $rootScope.user = res.user;
              //console.log('about to propagate labels created', $rootScope.user.organization.idACC, $rootScope.socketio);
              $rootScope.socketio.emit('labels_changed', $rootScope.user.organization.idACC);
              return $rootScope.message("New Label added", 'success');
              //vm.closeDialog();
            }
          }).error(function (res) {
            return $rootScope.message("Server not responding.", 'warning');
          })["finally"](function () {
            return vm.labels.create.saving = false;

          });
        }
      },
      test: function (label) {
        //console.log(label);
      }
    };

    vm.find = {
      template: null,
      searchCount: 0,
      searching: false,
      creating: false,
      results: [],
      begin: function (ev, parentID, type) {

        console.log(ev, parentID, type);
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
        vm.openAddChecklistTemplateDialog(ev);
        return null;
      },
      search: function () {
        vm.isLoader = true;
        vm.find.searching = true;
        if (vm.find.template.criteria.name === '' && vm.find.template.criteria.organization === '' && vm.find.template.criteria.author === '' && vm.find.template.criteria.version === '') {
          $rootScope.message('Please provide Search Criteria', 'warning');
          vm.find.searching = false;
          //console.log('died in search');
          return false;
        }

        //console.log('vm.find', vm.find.template);
        return api.checklists.searchForTemplates(vm.find.template.criteria).error(function (res) {
          return $rootScope.message('Unknown error finding Templates.', 'warning');
        }).success(function (res) {
          vm.isLoader = false;
          if (res.code) {
            res.display = "Error finding Templates: (" + res.code + "): " + res.message;
            $rootScope.message(res.display, 'warning');
          }
          vm.find.results = res;
          console.log('vm.find.results', vm.find.results);
          return vm.find.searchCount++;
        })["finally"](function () {
          return vm.find.searching = false;
        });
      },
      create: function (idCTMPL, parentID) {
        console.log('idCTMPL', idCTMPL);
        console.log('parentID', parentID);
        vm.isLoader = true;

        vm.find.creating = true;
        return api.checklists.createFromTemplate(idCTMPL, parentID, 'checklist', token).error(function (res) {
          return $rootScope.message('Unknown error creating Checklist from selected Template.', 'warning');
        }).success(function (res) {
          vm.isLoader = false;
          if (res.code) {
            return $rootScope.message("Error creating Checklist from Template: (" + res.code + "): " + res.message, 'warning');
          } else {

            $rootScope.$broadcast('event:updateModels');

            if (!$state.is('app.checklist.detail')) {
              vm.checklists.unshift(res.checklists[0]);
            }

            $rootScope.message('Template had been applied', 'success');
            $rootScope.organizeData();
            vm.closeDialog();
          }
        })["finally"](function () {
          return vm.find.creating = false;
        });
      }

    };

    function preventDefault(e) {
      e.preventDefault();
      e.stopPropagation();
    };

    function addChecklistDialog(ev) {
      //////debugger;
      vm.verticalStepper = {
        step1: {},
        step2: {},
        step3: {}
      };

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            // debugger
            vm.wizard.newFolder = false;
            vm.wizard.newGroup = false;
            vm.wizard.newChecklist = false;
            vm.wizard.switch = false;
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-new-checklist-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };

    function openAddChecklistTemplateDialog(ev) {

      vm.title = 'Determine the place and name your new checklist';

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-add-from-template-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };


    function openUploadAttachmentDialog(ev, pType, pID, index, attachments) {
      debugger;
      vm.pType = pType;
      vm.pID = pID;
      vm.title = 'Attachments';
      vm.index = index;
      vm.SelectedAttachments = attachments;
      vm.upload = false;
      console.log('vm.attachments', vm.attachments);


      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-upload-attachment-dialog.html',
        parent: angular.element($document.find('#todo')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };



    function openConflictsDialog(ev) {

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-conflicts-dialog.html',
        parent: angular.element($document.find('#todo')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };
    $scope.getAttachmentFileName = function () {
      alert($scope.file);
      console.lof("wow2");
    }


    function uploadAttachment(what, pID, index) {

      var whats;
      whats = what + 's';

      // console.log('what', what);
      // console.log('whats', whats);
      // console.log('PID', pID);
      // console.log('index', index);

      // console.log('AWS.config', AWS.config);

      // AWS.config.update({ accessKeyId: vm.creds.access_key, secretAccessKey: vm.creds.secret_key });
      // AWS.config.region = 'us-west-1';
      // var bucket = new AWS.S3({ params: { Bucket: vm.creds.bucket } });
      
      vm.file_name = $scope.files[0].name;
      var fd = new FormData();
      angular.forEach($scope.files, function (file) {
        fd.append('file', file);
      });
      vm.spinner = true;
      vm.sizeLimit = 10585760; // 10MB in Bytes
      // if (vm.file) {

      // console.log('files2', vm.label);
      // var fileSize = Math.round(parseInt(vm.file.size));
      // if (fileSize > vm.sizeLimit) {
      //   $rootScope.message('Sorry, your attachment is too big. <br/> Maximum ' + vm.sizeLimit + ' file attachment allowed', 'warning');
      //   return false;
      // }
      // Prepend Unique String To Prevent Overwrites
      //   var uniqueFileName = vm.uniqueString() + '-' + vm.file.name;
      //   vm.aws = 'https://s3-us-west-1.amazonaws.com/checklinked-attachments-temp/' + uniqueFileName;

      // var params = { Key: uniqueFileName, ContentType: vm.file.type, Body: vm.file, ServerSideEncryption: 'AES256' };


      //  function finalFileUload(){
      var filedata = { 'pID': vm.pID, 'pType': whats, 'aws': '', 'name': vm.file_name, 'size': vm.sizeLimit, 'label': vm.label };
      fd.append('data', JSON.stringify(filedata));
      $http.post(BASEURL + 'attachments-finish_upload-post.php', fd,
        {
          headers: { 'Content-Type': undefined }
        }).success(function (res) {
          vm.spinner = false;
          if (res && res.type == 'success') {
            $mdDialog.hide();
            vm.attachments.push(res.attachments[0]);
            //vm[whats][index].attachments.push(res.attachments[0]);
            vm.label = '';
            $rootScope.message("Attachment label added successfully", 'success');
          } else {
            $rootScope.message("The file label has already been taken.", 'warning');
          }
        })


      // api.attachments.add(vm.pID, vm.pType, vm.aws, 'files', 'sizeLimit', vm.label,fd).error(function (res) {
      //   ////debugger;
      //   return $rootScope.message("Error Uploading Attachment", 'warning');
      // }).success(function (res) {
      //   vm.spinner = false;
      //   vm.fileUploadButton = false;
      //   if (res && res.type == 'success') {
      //     vm.attachments.push(res.attachments[0]);
      //     //vm[whats][index].attachments.push(res.attachments[0]);
      //     $mdDialog.hide();
      //     vm.label = '';
      //     $rootScope.message("Attachment label added successfully", 'success');
      //   } else {
      //     $rootScope.message("The file label has already been taken.", 'warning');
      //   }

      // });

      //  };



      // }

      // vm.organizeData();
      // finalFileUload();

    }

    // function uniqueString() {
    //   var text = "";
    //   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    //   for (var i = 0; i < 8; i++) {
    //     text += possible.charAt(Math.floor(Math.random() * possible.length));
    //   }
    //   return text;
    // }

    // vm.sizeLimit = 10585760; // 10MB in Bytes
    // vm.uploadProgress = 0;
    // vm.creds = {
    //   bucket: 'checklinked-attachments-temp',
    //   access_key: 'AKIAI6XHWIU2YCPG6BPA',
    //   secret_key: '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'
    // };

    vm.fileSizeLabel = function () {
      // Convert Bytes To MB
      return Math.round(vm.sizeLimit / 1024 / 1024) + 'MB';
    };


    function viewAttachmentsDialog(ev, idParent, idCHK, idCNV, s) {

      vm.title = 'View Attachemnts';

      $mdDialog.show({
        controller: 'ChecklistViewAttachmentsDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-view-attachments-dialog.html',
        parent: angular.element($document.find('#todo')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          idParent: idParent,
          idATT: idATT,
          idCHK: idCHK,
          idCNV: idCNV,
          s: s
        }
      });

    };


    function openFolderInput() {
      ////debugger;
      vm.folder = '';
      vm.group = '';
      vm.wizard.newFolder = true;
      vm.wizard.newGroup = false;
      vm.wizard.newChecklist = false;


    }

    function cancelFolderInput() {
      return vm.wizard.newFolder = false;
    }

    function cancelGroupInput() {

      return vm.wizard.newGroup = false;
      return vm.wizard.switch = false;

    }

    function cancelChecklistInput() {
      vm.closeDialog();
    }

    function openGroupInput() {
      vm.group = '';
      vm.wizard.newFolder = false;
      vm.wizard.newChecklist = false;
      vm.wizard.newGroup = true;
      vm.wizard.switch = true;

    }

    function addNewFolder() {
      //console.log('pre insert vm.folders', vm.folders);
      //Set sending variable for buttons
      vm.folder.sending = true;

      //Set order variable for sql insert
      vm.folder.order = 1;
      vm.folder.order += vm.folders.length;
      vm.isLoader = true;
      api.folders.add(vm.folder.name, vm.folder.description, vm.folder.order, token).error(function (res) {
        return $rootScope.message("Error Creating Project", 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Creating Project", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          vm.verticalStepper = {
            newFolderID: res.folder.id
          }


          $rootScope.$broadcast('event:updateModels');
          vm.folders.push(res.folder);
          $rootScope.organizeData();

          vm.fetchGroups(res.folder.id);


          $rootScope.message('Project Added');

          //Hide Buttons
          vm.wizard.newFolder = false;


        }
      });

    };

    function addNewGroup(groupName, folderID) {
      // vm.isLoader = true;
      //Set sending variable for buttons
      vm.group.sending = true;
      //Set order variable for sql insert
      vm.group.order = 1;
      vm.group.order += vm.groups ? vm.groups.length : 0;
      vm.group.text = groupName;

      vm.group.id_parent = folderID;

      api.groups.add(vm.group.text, vm.group.order, vm.group.id_parent, vm.group.description).error(function (res) {
        return $rootScope.message("Error Adding Folder", 'warning');
      }).success(function (res) {
        // vm.isLoader = false;
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Adding Folder", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          $rootScope.$broadcast('event:updateModels');
          vm.groups.push(res.group);
          $rootScope.organizeData();

          vm.verticalStepper.newGroupID = res.group.id;
          vm.verticalStepper.newFolderID = res.group.id_parent;

          vm.wizard.newGroup = false;
          vm.wizard.switch = false;


          $rootScope.message('Folder Added');
        }
      });
    };

    function addNewChecklist(checklistName, checklistDescription, groupID, folderID) {
      debugger
      vm.isLoader = true;
      //Set sending variable for buttons
      vm.checklist.sending = true;

      //Set order variable for sql insert
      vm.checklist.order = 1;
      vm.checklist.order += vm.checklists.length;

      //name, order, to
      api.checklists.add(checklistName, vm.checklist.order, groupID, token, checklistDescription).error(function (res) {
        return $rootScope.message("Error Adding Checklist", 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        vm.loadChecklist(vm.idCHK);
        if (res.type !='success' || res === '') {
          return $rootScope.message("Error Adding Checklist", 'warning');
       } 
       //else if (res.code) {
        //   return $rootScope.message(res.message, 'warning');

        // } 
        else {
          console.log('res checklist', res);
          $scope.getChecklinked();
        
          api.sections.add('sections', 1, res.checklist.id).error(function (res) {
            return $rootScope.message("Error Adding Section", 'warning');
          }).success(function (res) {
            vm.isLoader = false;
            //console.log('res failed', res);
            if (res === void 0 || res === null || res === '') {
              return $rootScope.message("Error Adding Section", 'warning');
            } else if (res.code) {
              return $rootScope.message(res.message, 'warning');
            } else {
              //console.log('res success', res);
              vm.sections.push(res.section);
            }
          });
          //console.log('vm.checklists pre', vm.checklists);

          $rootScope.$broadcast('event:updateModels');
          console.log('$stateParams.id', $stateParams.id);
          //console.log('$state', $state);
          console.log('$state.is', $state.is);


          //vm.checklists = $rootScope.checklists;
          if (!$state.is('app.checklist.detail')) {
            console.log('pre unshift vm.checklists', vm.checklists);
            vm.checklists.unshift(res.checklist);
            console.log('post unshift vm.checklists', vm.checklists);
          }

          $rootScope.organizeData();
          $rootScope.message('Checklist Added');

        }
      });

      vm.closeDialog();
    };

    function setLabels(item, ev) {
      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-set-labels-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    function sendLinkRequest(ev, idCHK) {

      $mdDialog.show({
        controller: 'ChecklistSendLinkRequestDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-send-link-request-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          idCHK: idCHK
        }
      });

    };

    function publishTemplate(ev, idCHK) {
      $mdDialog.show({
        controller: 'ChecklistPublishTemplateDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-publish-template-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          idCHK: idCHK
        }
      });

    };

    function deleteConfirm(what, item, ev) {
      vm.title = 'Delete Checklist Information';
      vm.warning = 'Warning: This can’t be undone';
      vm.description = "Please confirm you want to delete this <span class='link'>" + item.name + "</span><br>All of the contents will be deleted and can’t be recovered"
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/organization/dialogs/organizations/alert.html',
        parent: angular.element(document.body),
        targetEvent: what,
        clickOutsideToClose: false
      })
        .then(function (type) {
          vm.deleteItem(what, item, ev);
        }, function () {
          $scope.status = 'You cancelled the dialog.';
        })

    };



    function deleteItem(what, item, ev) {
      vm.isLoader = true;
      var svc, whats;
      whats = what + 's';

      svc = vm.svc(what);

      return svc.destroy(item.id).success(function (res) {
        vm.isLoader = false;
        var notifyItem, packet;
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm[whats].remove(item);
          vm.organizeData();
          packet = {
            catalog: whats,
            type: 'delete',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: item
          };
          //console.log('emitting data', packet);
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, item, {
            type: 'data'
          });
          //console.log('about to sent notify event', notifyItem);
          $rootScope.message(item.name + ' successfully deleted', 'success');
          return $rootScope.socketio.emit('notify', [notifyItem]);
        }
      });

    };

    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
      //console.log('sidenavId', sidenavId);
    };

    function toggleFilter(filter) {
      vm.checklistFilters[filter] = !vm.checklistFilters[filter];

      checkFilters();
    };

    function toggleFilterWithEmpty(filter) {
      if (vm.checklistFilters[filter] === '') {
        vm.checklistFilters[filter] = true;
      }
      else {
        vm.checklistFilters[filter] = '';
      }
      checkFilters();
    };

    function resetFilters() {
      vm.showAllChecklists = true;
      vm.checklistFilters = angular.copy(vm.checklistFiltersDefaults);
    };

    function checkFilters() {
      vm.showAllChecklists = !!angular.equals(vm.checklistFiltersDefaults, vm.checklistFilters);
    };

    function fetchGroups(id) {
      ftchFolder(id)
      vm.groups = $rootScope.children('groups', id);
      $rootScope.organizeData();

      if (!vm.groups.length > 0) {
        vm.wizard.switch = true;
      } else {
        vm.wizard.switch = false;
      }
    };

    function ftchFolder(id) {
      api.groups.get(id).then(function (d) {
        vm.groups = d.data.groups
      });
    }


    vm.loading = {
      checklist: false,
      sections: false,
      headings: false,
      items: false,
      checkboxes: false
    };

    vm.loaded = {
      checklist: false,
      sections: false,
      headings: false,
      items: false,
      checkboxes: false
    };

    //console.log('initial loading & loaded set', vm.loading, vm.loaded);

    function setBlank() {
      vm.loadingLinked = false;
      vm.error = 0;
      vm.message = '';
      vm.users = [];
      return vm.usersLoaded = false;
    };

    vm.setBlank();

    function setError(err, msg) {
      vm.error = err;
      return vm.message = msg;
    };

    function toggleShowCheckboxes(user) {
      var show;
      show = {
        idCON: user.idCON,
        name: user.name.first
      };
      user.isShowing = !$rootScope.userCheckboxesAreShowing(show);
      if (user.isShowing) {
        vm.displayUserCheckboxes(show);
        console.log('displayed user', user, show);
        console.log('showingUsers', $rootScope.showingUsers);
      } else {
        vm.removeUserCheckboxes(show);
        console.log('undisplayed user', user, show);
      }
      return true;
    };

    function loadLinkedUsers() {
      console.log('loading users 2', $scope);
      vm.setBlank();
      vm.loadingLinked = true;
      return api.checklists.getLinkedUsers(vm.idCHK, token).then(function (res) {
        vm.isLoader = false;
        if (res === void 0 || res === null || res === '') {
          return vm.setError(-1, 'Server not responding properly.');
        } else if (res.code) {
          return vm.setError(res.code, res.message);
        } else {
          var newcheckLists = res.checklists ? res.checklists : res.checkLists;
          if (res && newcheckLists && newcheckLists.length > 0 && newcheckLists != undefined)
            newcheckLists.forEach(function (cfc) {
              var show, usr;
              usr = cfc.ownerDetails;
              usr.isShowing = $rootScope.userCheckboxesAreShowing(usr);
              if (cfc.complete) {
                usr.complete = true;
              } else {
                usr.complete = false;
              }
              vm.users.push(usr);
              console.log('pushed cfc to users', cfc, usr, vm.users);
              if (usr.isShowing) {
                show = {
                  idCON: usr.idCON,
                  name: usr.name.first
                };
                return vm.displayUserCheckboxes(show);
              }
            });
          return vm.usersLoaded = true;
        }
      }, function (err) {
        return vm.setError(-1, 'Unable to load linked user list.');
      }).then(function () {
        return vm.loadingLinked = false;
      });
    };


    ///////////////figure a way to make this work/////////////////

    $scope.$on('event:checklistLoaded', function () {
      console.log('$on');
      if (!vm.usersLoaded && !vm.loadingLinked) {
        console.log('loading users by event');
        vm.loadLinkedUsers();
      }
    });

    if (!vm.usersLoaded && !vm.loadingLinked) {
      console.log('loading users by default');
      vm.loadLinkedUsers();
    }

    /*
     function createHeading(what, name, to, type, info) {
     var count, order, ref1, svc, whats;
     if (to == null) {
     to = null;
     }
     if (type == null) {
     type = 1;
     }
     if (info == null) {
     info = '';
     }
     whats = what + 's';
     svc = vm.svc(what);
     vm.newItem.submitting = true;
     order = 1;
     if (what === 'section') {
     order += vm.sections.length;

     } else {
     count = (ref1 = $filter('filter')($scope[whats], {
     id_parent: to
     }, true)) != null ? ref1 : [];
     order += count.length;
     }
     console.log('calling create:add service', name, order, to, type, info);
     return svc.add(name, order, to, type, info).success(function(res) {
     var notifyItem, packet;
     if (res.code) {
     return $rootScope.message(res.message, 'warning');
     } else {
     vm.sections.push(res[what]);
     vm.organizeData();
     packet = {
     catalog: whats,
     type: 'add',
     user: {
     idCON: $rootScope.user.idCON,
     name: $rootScope.user.name
     },
     record: res[what]
     };
     console.log('emitting data', packet);
     $rootScope.socketio.emit('data', packet);
     notifyItem = $.extend({}, res[what], {
     type: 'data'
     });
     console.log('about to sent notify event', notifyItem);
     $rootScope.socketio.emit('notify', [notifyItem]);
     return $("#newItem").modal("hide");
     }
     })["finally"](function() {
     return vm.newItem.submitting = false;
     });
     };
     */

    function openChecklistDialog(ev, checklist) {

      vm.checklist = checklist;
      vm.title = 'Edit Checklist';

      console.log('vm.checklist', vm.checklist);


      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-checklist-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function saveChecklist() {

      var editPack;

      editPack = {
        'id': vm.checklist.idCHK,
        'rid': vm.checklist.rid,
        'index': 0,
        'type': 'checklist',
        'text': vm.checklist.name,
        'token': token
      };

      console.log('vm.vars.message', vm.checklist.name);

      api.checklists.edit(editPack).error(function (res) {
        $rootScope.message("Error Editing Checklist", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          $rootScope.message("Error Editing Checklist", 'warning');
        } else if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {

          //Toaster Notification
          $rootScope.message('Checklist has been changed successfully', 'success');

          vm.checklist.sending = false;

          //Close Dialog Window
          vm.closeDialog();
        }
      });
    }

    function openSectionDialog(ev, section) {

      vm.section = section;
      vm.title = 'Edit Section';

      console.log('vm.section', vm.section);


      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-section-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function saveSection() {
      var editPack;
      editPack = {
        'id': vm.section.id,
        'rid': vm.section.rid,
        'index': 0,
        'type': 'section',
        'text': vm.section.name,
        'token': token
      };

      api.checklists.edit(editPack).error(function (res) {
        $rootScope.message("Error Editing Section", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          $rootScope.message("Error Editing Section", 'warning');
        } else if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {

          $rootScope.message('Section has been changed successfully', 'success');
          vm.section.sending = false;

          //  vm.closeDialog();
        }
      });
    }

    function openHeadingDialog(ev, heading) {

      vm.heading = heading;
      vm.title = 'Edit Heading';

      console.log('vm.heading', vm.heading);

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-heading-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function saveHeading() {

      var editPack;

      editPack = {
        'id': vm.heading.id,
        'rid': vm.heading.rid,
        'index': 0,
        'type': 'heading',
        'text': vm.heading.name,
        'token': token
      };

      api.checklists.edit(editPack).error(function (res) {
        $rootScope.message("Error Editing Heading", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          $rootScope.message("Error Editing Heading", 'warning');
        } else if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {

          $rootScope.message('Heading has been changed successfully ', 'success');

          vm.heading.sending = false;

          vm.closeDialog();
        }
      });
    }


    function closeConfilicts() {
      ////debugger;
      if ($rootScope.showingUsers.length > 1) {
        $rootScope.showingUsers.splice(1, 1);
        $state.go('app.summary');
      }


    }

    function openItemDialog(ev, item) {
      ////debugger;
      vm.item = item;
      vm.title = 'Edit Checkbox Item';

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-item-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function openFormLineDialog(ev, item) {
      ////debugger;
      vm.item = item;
      vm.title = 'Edit Item';

      console.log('vm.item', vm.item);


      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-form-line-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    function saveItem() {

      var editPack;

      editPack = {
        'id': vm.item.id,
        'rid': vm.item.rid,
        'index': 0,
        'type': 'item',
        'info': vm.item.info,
        'text': vm.item.name,
        'token': token
      };

      api.checklists.edit(editPack).error(function (res) {
        $rootScope.message("Error Editing Item", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          $rootScope.message("Error Editing Item", 'warning');
        } else if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {

          $rootScope.message('Section has been changed successfully', 'success');

          vm.item.sending = false;

          vm.closeDialog();
        }
      });
    }

    function openConversationDialog(producerType, id, name, $event) {
      ////debugger;
      console.log('id', id);
      console.log('name', name);
      console.log('producerType', producerType);

      $mdDialog.show({
        controller: 'ChecklistConversationDialogController',
        controllerAs: 'vm',
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-conversation-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: $event,
        clickOutsideToClose: true,
        locals: {
          convoId: id,
          convoName: name,
          producerType: producerType
        }
      });
    }


    /*
     MODE SPECIFIC
     */
    $scope.edit = {
      start: function (what, which, ev, checklists) {
        console.log('what', what);
        console.log('which', which);
        console.log('checklists', checklists);

        var index, whats;
        whats = what + 's';
        index = vm[whats].indexOf(which);

        $rootScope[whats][index].edit = {
          id: what === 'checklist' ? which.idCHK : which.id,
          rid: which.rid,
          index: index,
          type: what,
          text: which.name,
          info: '',
          submitting: false,
          error: null,
          message: ''
        };


        console.log('vm[whats][index].edit', vm[whats][index].edit);

        if (what === 'item') {
          $rootScope[whats][index].edit.info = which.info;
        }

        $mdDialog.show({
          controller: function DialogController($scope, $mdDialog) {
            $scope.closeDialog = function () {
              $mdDialog.hide();
            }
          },
          scope: $scope,
          preserveScope: true,
          templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-checklist-dialog.html',
          parent: angular.element($document.find('#checklist')),
          targetEvent: ev,
          clickOutsideToClose: true
        });

        return vm[whats][index].editing = true;
      },
      stop: function (which) {
        var whats;
        whats = which.type + 's';
        vm[whats][which.index].edit = null;
        return vm[whats][which.index].editing = false;
      },
      submit: function (which) {

        //console.log('which', which);
        var whats;
        whats = which.type + 's';
        if (vm[whats][which.index].edit.text === vm[whats][which.index].name && vm[whats][which.index].edit.info === vm[whats][which.index].info) {
          $scope.edit.stop(which);
          return false;
        }
        return api.checklists.edit(which).error(function (res) {
          vm[whats][which.index].edit.error = res.code;
          return vm[whats][which.index].edit.message = res.message;
        }).success(function (res) {
          var notifyItem, packet;
          vm[whats][which.index] = res.updated;
          packet = {
            catalog: whats,
            type: 'edit',
            user: {
              idCON: $rootScope.user.idCON,
              name: $rootScope.user.name
            },
            record: res.updated
          };
          //console.log('emitting data', packet);
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, res.updated, {
            type: 'data'
          });
          //console.log('about to sent notify event', notifyItem);
          $rootScope.socketio.emit('notify', [notifyItem]);
          vm.organizeData();
          return $rootScope.message("Checklist updated successfully", 'success');
        })["finally"](function () {
          vm.closeDialog();
          return vm.edit.stop(which);
        });
      }
    };

    function fetchAttachmentsChecklist(idCHK) {
      var attme;
      api.attachments.checklist(idCHK).then(function (d) {
        attme = d;
      });

    }


    function fetchAttachmentsParent(idPARENT) {

      api.attachments.parent(idPARENT).success(function (res) {
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          return res;
        }
      });

    }


    $scope.pdf = {
      submit: function (data) {

        console.log('data', data);
      }
    };

    function downloadPDF(ev, idCHK, chkName) {
      ////debugger;
      vm.title = 'Download ' + chkName + ' To PDF';


      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-dialog-pdf.html',
        parent: angular.element($document.find('#todo')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          idCHK: idCHK,
          chkName: chkName
        }
      });

    }


    function downloadXML(ev, idCHK, chkName) {

      $window.location.href = ('http://wdc1.acapqa.net:8081/dist/ajax/archive.php?idCHK=' + idCHK);
    }


    function downloadAttachment(ev, location) {
      //$window.location.href = (location);
      $window.open(location, '_blank');
    }


    function fetchHeadingBlock(section, idCHK) {


      var id_parent = section.id;
      var i;
      var x;



      if (!section.headings.length && id_parent) {

        api.headings.getParent(id_parent).success(function (res) {

          // console.log('res on getParent', res);
          console.log('id_parent', id_parent);

          var ref;
          if ((ref = res.headings) != null ? ref.length : void 0) {

            if ((ref = vm.headings) != null ? vm.headings.length : void 0) {
              console.log('about to loop');
              for (i = 0; i < res.headings.length; i++) {

                console.log('looping', i);
                vm.headings.push(res.headings[i]);
              }

            } else {
              vm.headings = res.headings;
            }
            vm.headings
            console.log('heading data', vm.headings);

          }
          return vm.loaded.headings = true;
        })["finally"](function () {
          vm.loading.headings = false;
          return vm.completeLoad();
        });


        api.attachments.checklist(idCHK).success(function (res) {

          var ref;
          if ((ref = res.attachments) != null ? ref.length : void 0) {
            vm.attachments = vm.attachments.concat(res.attachments);
          }
          vm.loaded.attachments = true;
          return $scope.$broadcast('event:attachmentsLoaded');
          //console.log('broadcast event:attachmentsLoaded');
        })["finally"](function () {
          vm.loading.attachments = false;
          return vm.completeLoad();
        });


      }

    }


    function fetchConflictsHeadingBlock(section, idCHK) {

      console.log('section', section);

      var id_parent = section.id;
      var i;
      var x;

      console.log('id_parent', id_parent);


      if (id_parent) {

        console.log('Try to fetch Headings for Conflicts');

        api.headings.getParent(id_parent).success(function (res) {

          console.log('api results api.headings.getParent', res);

          var ref;
          if ((ref = res.headings) != null ? ref.length : void 0) {


            if ((ref = vm.headings) != null ? vm.headings.length : void 0) {

              for (i = 0; i < res.headings.length; i++) {

                //vm.headings.push(res.headings[i]);
              }

            } else {
              vm.headings = res.headings;
            }

            console.log('post process vm.headings array', vm.headings);

          }
          return vm.loaded.headings = true;
        })["finally"](function () {
          vm.loading.headings = false;
          return vm.completeLoad();
        });


        // Worry about attachments later, do not want to fuck upi the bullshit here.
        api.attachments.checklist(idCHK).success(function (res) {
          var ref;
          if ((ref = res.attachments) != null ? ref.length : void 0) {
            vm.attachments = vm.attachments.concat(res.attachments);
          }
          vm.loaded.attachments = true;
          return $scope.$broadcast('event:attachmentsLoaded');
          //console.log('broadcast event:attachmentsLoaded');
        })["finally"](function () {
          vm.loading.attachments = false;
          return vm.completeLoad();
        });


      }

    }

    function fetchItemBlock(heading, idCHK) {

      var id_parent = heading.id;
      var i;
      var x;

      console.log('heading', heading);
      console.log('id_parent', id_parent);

      if (!heading.items.length && id_parent) {

        api.items.getParent(id_parent).success(function (res) {
          //console.log('api.item.get');
          var ref;
          if ((ref = res.items) != null ? ref.length : void 0) {


            console.log('pre result', vm.headings);

            if ((ref = vm.items) != null ? vm.items.length : void 0) {
              console.log('about to loop');
              for (i = 0; i < res.items.length; i++) {

                console.log('looping', i);
                vm.items.push(res.items[i]);
              }

            } else {
              console.log('first heading');
              vm.items = res.items;
            }

            console.log('post result', vm.items);


            //vm.items = res.items;
          }
          vm.loaded.items = true;

          return $scope.$emit('event:itemsLoaded');
          //console.log('broadcast event:itemsLoaded');
        })["finally"](function () {
          vm.loading.items = false;
          return vm.completeLoad();
        });

        api.attachments.checklist(idCHK).success(function (res) {
          var ref;
          if ((ref = res.attachments) != null ? ref.length : void 0) {
            vm.attachments = vm.attachments.concat(res.attachments);
          }
          vm.loaded.attachments = true;
          return $scope.$broadcast('event:attachmentsLoaded');
          //console.log('broadcast event:attachmentsLoaded');
        })["finally"](function () {
          vm.loading.attachments = false;
          return vm.completeLoad();
        });
      }

    }

    function fetchConflictsItemBlock(heading, idCHK) {

      var id_parent = heading.id;
      var i;
      var x;

      console.log('heading', heading);
      console.log('id_parent', id_parent);

      if (!heading.items.length && id_parent) {

        api.items.getParent(id_parent).success(function (res) {
          //console.log('api.item.get');
          var ref;
          if ((ref = res.items) != null ? ref.length : void 0) {


            console.log('pre result', vm.headings);

            if ((ref = vm.items) != null ? vm.items.length : void 0) {
              console.log('about to loop');
              for (i = 0; i < res.items.length; i++) {

                console.log('looping', i);
                vm.items.push(res.items[i]);
              }

            } else {
              console.log('first heading');
              vm.items = res.items;
            }

            console.log('post result', vm.items);


            //vm.items = res.items;
          }
          vm.loaded.items = true;

          return $scope.$emit('event:itemsLoaded');
          //console.log('broadcast event:itemsLoaded');
        })["finally"](function () {
          vm.loading.items = false;

        });

        api.attachments.checklist(idCHK).success(function (res) {
          var ref;
          if ((ref = res.attachments) != null ? ref.length : void 0) {
            vm.attachments = vm.attachments.concat(res.attachments);
          }
          vm.loaded.attachments = true;
          return $scope.$broadcast('event:attachmentsLoaded');
          //console.log('broadcast event:attachmentsLoaded');
        })["finally"](function () {
          vm.loading.attachments = false;
          return vm.completeLoad();
        });
      }

    }



    function closeDialog() {
      vm.wizard.newFolder = false;
      vm.wizard.newGroup = false;
      vm.wizard.newChecklist = false;
      vm.wizard.switch = false;
      $mdDialog.hide();
    }

    // Content sub menu
    vm.submenu = [
      { link: 'folders', title: 'Projects' },
      { link: 'groups', title: 'Workflow' },
      { link: '', title: 'Checklists' },
      { link: 'templates', title: 'Templates' },
      { link: '#', title: 'Others' },
      { link: 'archives', title: 'Archives' }

    ];

    $scope.IsAttachment = true;
    $scope.deleteAttachment = function (id) {
      this.IsAttachment = false
      $http.post(BASEURL + "destroy_attachment.php", { 'id': id, 'idCON': $rootScope.user.idCON })
        .success(function (res) {
          if (res.type == 'success') {
            return $rootScope.message(res.message, 'success');

          } else {
            return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found password');
        })
    };

    $scope.editAttachment = function (attachment) {
      vm.editAttachment = true;
      vm.label = attachment.file.label;
      vm.filename = attachment.file.name;
      vm.upload = true;
      vm.attachment = attachment
    };

    $scope.UpdateAttachment = function (attachment) {
      $http.post(BASEURL + "edit_attachment.php", { 'idCON': $rootScope.user.idCON, 'id': attachment.id, 'label': vm.label })
        .success(function (res) {
     
          if (res.type == 'success') {
            vm.loading.attachments
            $mdDialog.hide();
            vm.loadChecklist($stateParams.id);
            
            return $rootScope.message(res.message, 'success');

          } else {
            return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found password');
        })
    }


    // vm.DeleteAttachmentConfirm = DeleteAttachmentConfirm;
    //     function DeleteAttachmentConfirm(ev, pType, pID, index, attachments,id) {
    //       var confirm = $mdDialog.confirm()
    //         .title('Are you ure to delete this item')
    //         .htmlContent('This action cannot be undone.')
    //         .ariaLabel('delete')
    //         .targetEvent(ev)
    //         .ok('OK')
    //         .cancel('CANCEL');

    //         $rootScope.attachments = attachments;
    //       $mdDialog.show(confirm).then(function () {

    //         setTimeout
    //         openUploadAttachmentDialog(ev, pType, pID, index, $rootScope.attachments);
    //         console.log('Attachment');
    //         console.log($rootScope.attachments);
    //         vm.SelectedAttachments =  $rootScope.attachments;
    //         $scope.deleteAttachment(id);

    //       }, function () {

    //        openUploadAttachmentDialog(ev, pType, pID, index, attachments);
    //       });
    //     }


    //Archieve Dialog
    vm.archieveDialog = archieveDialog;
    vm.saveArchieve = saveArchieve;

    function archieveDialog(ev, id) {
      vm.title = 'Create New Archieve';
      if (id) {
        vm.id = parseInt(id);
        console.log("Archive=" + "id=" + vm.id);
      }
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/archieve-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    }

    // Save Archive

    function saveArchieve(id) {
      vm.spinner = true;
      $http.post(BASEURL + "create-archieve-post.php", { 'name': vm.archieve.name, 'type': 'checklist', 'id': id ? id : '' })
        .success(function (res) {
          vm.spinner = false;
          if (res.type == 'success') {
            vm.archieve.name = '';
            vm.closeDialog();
            $scope.getChecklinked();
            return $rootScope.message(res.message, 'success');

          } else {
            return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found to make archieve');
        })

    };

    //Cut copy paste of checklist

    vm.cutDialog = cutDialog;
    vm.pasteDialog = pasteDialog;
    vm.undoDialog = undoDialog;

    function cutDialog(idCHK, id, type, item) {
      vm.isCuted = true;
      // $scope.item[item] = true;
      $rootScope.id_CHK = idCHK;

    };
    // disabled if trying to cut same checklist 
    if ($rootScope.id_CHK) {
      if ($stateParams.id && $stateParams.id == $rootScope.id_CHK) {
        vm.isCuted = true;
      }
    };

    function pasteDialog(idCHK, id, type, item) {
      if ($stateParams.id && $stateParams.id == $rootScope.id_CHK) {
        $rootScope.alertMessage('You can not paste in the same workflow');
      }
      else {
        $rootScope.alertMessage('Paste successfully');

      }
    };

    function undoDialog() {
      vm.isCuted = false;
    };

    $rootScope.alertMessage = function (message) {
      var confirm = $mdDialog.confirm()
        .title(message)
        //.content('This Workflow will be deleted.')
        .ok('Ok')
      $mdDialog.show(confirm);
    };

    //Alert Cancel an close
    $scope.hide = function () {
      $mdDialog.hide();
    };

    $scope.cancel = function () {
      $mdDialog.cancel();
    };

    $scope.answer = function (answer) {
      $mdDialog.hide(answer);
    };



  }


})();
