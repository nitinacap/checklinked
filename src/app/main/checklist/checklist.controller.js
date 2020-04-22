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
  function checklistController($rootScope, $scope, $cookies, api, $state, $stateParams, $location, $mdDialog, $mdSidenav, $document, $http, $filter, $window, dataTable) {
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
    vm.isExpandable = isExpandable;
    vm.toggleableChildren = toggleableChildren;
    vm.expand = expand;
    vm.collapse = collapse;
    vm.isExpanded = isExpanded;
    // vm.toggle = toggle;
    vm.downloadAttachment = downloadAttachment;
    vm.showAllHeaders = showAllHeaders;
    vm.selectWorkflowById = selectWorkflowById
    vm.checklistPasteDialog = checklistPasteDialog;
    vm.saveScheduler = saveScheduler;
    vm.addschedule = addschedule;
    vm.showLoadingImage = true;
    vm.deleteScheduler = deleteScheduler;

    vm.changeUppercase = changeUppercase;
    vm.newScheduler = {};
    vm.Alreadyclicked = false;

    /**Data Table Function Code Start Here ** */
    vm.createDataTableSegment = createDataTableSegment;
    vm.createTableFromTemplate = createTableFromTemplate;

    vm.head_row = 0;
    vm.field = [];
    /**Data Table Function  Code Start Here ** */


    vm.expanded = {
      sections: [],
      headings: [],
      items: [],
      referencess: []
    };

   

    vm.checklistFromGroup = false;

    $scope.dataTable = dataTable;

   


    //check permission
    var userpermission = $cookies.get("userpermission");
    vm.checkIsPermission = userpermission ? JSON.parse(userpermission) : '';
    // CONFLICTS
    vm.fetchConflictsHeadingBlock = fetchConflictsHeadingBlock;
    vm.fetchConflictsItemBlock = fetchConflictsItemBlock;
    vm.closeConfilicts = closeConfilicts;
    //vm.loadMore = loadMore;

    //console.log('$stateParams', $stateParams, $state);
    vm.idCHK = $stateParams.id;
    vm.isBreadcrum = $stateParams.id ? true : false;
    vm.isLoader = true;
    vm.folders = [];
    var token = $cookies.get("token");


    //on navigating another checklist if extra users are still visible than klogged in one in items
    if($rootScope.showingUsers.length > 1){
      $rootScope.showingUsers = [{
        idCON: $rootScope.user.idCON, 
        name: $rootScope.user.name.first
      }];
      
    }  
    
    api.folders.get(token).then(function (d) {
      vm.isLoader = false;
      if (d.data.code == '-1') {
        if (d.data.message == 'unauthorized access') {
          $state.go('app.logout');
        } else {
          // $scope.subscriptionAlert(d.data.message);
          $rootScope.message(d.data.message, 'error')
        }
      } else {
        vm.folders = d.data.folders;
      }
    });

    vm.checklist = {
      sending: false
    };

    vm.wizard = {
      newFolder: false,
      newGroup: false
    };

    vm.tempGroup = {};

    $rootScope.DataTableFields = {
      // number_type : '',
      // currency_type : ''
    }

    $scope.$broadcast('event:checklistLoaded');
    if (!vm.isExpandedCounter) {
      vm.isExpandedCounter = 0;
    }
    if ($stateParams.id !== undefined && $stateParams.id != null) {
      console.log('myShowingUser', $rootScope.showingUsers)
    //  
      if ($stateParams.id == '') {
        console.log('$stateParams empty', $stateParams);
        console.log('$state', $state);
        $location.path('/checklist');
      } else if ($state.is('app.checklist.detail')) {
        //////// //////;
        console.log('stateParams', $stateParams);
        console.log('$state', $state);
        vm.passChecklist = [];
        api.checklists.getGroup($stateParams.id, token).then(function (d) {
          vm.passChecklist = d.data.checklists;
        });
        vm.setChecklistCtrlBlank();
        vm.loadChecklist($stateParams.id);


        if ($stateParams.headings && $stateParams.sections && $stateParams.items) {

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
        vm.passChecklist = [];
        api.checklists.getGroup($stateParams.id, token).then(function (d) {
          vm.passChecklist = d.data.checklists;
        });

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
        getChecklistGroup();

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
        } else if (itemPrevious && itemPrevious.order != 0 && typeof itemNext === 'undefined') {
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


        api.items.reorder(vm.reorder.id, vm.reorder.order, vm.reorder.type, vm.reorder.id_parent, arrayKeyNext ? arrayKeyNext : '', itemNext ? itemNext.id : '', arrayKeyMoved ? arrayKeyMoved : 0, itemMoved ? itemMoved.id : 0, arrayKeyPrevious ? arrayKeyPrevious : 0, itemPrevious ? itemPrevious.id : 0).error(function (res) {
          $rootScope.message('Unknown error updating server with reorder info.', 'warning');
        }).success(function (res) {
          if (res.code) {
            vm.isLoader = false;
            return $rootScope.message("Error updating reorder information. (" + res.code + ": " + res.message + ")");
          } else {


            vm.isLoader = false;
            $rootScope.message("Section order has been modified");

            var itemIndex;


            itemIndex = vm.sections.indexOf(itemMoved);
            console.log('itemIndex', itemIndex);
            vm.sections[itemIndex] = vm.reorder.order;

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
            //$rootScope.socketio.emit('data', packet);

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
        } else if (itemPrevious && itemPrevious.order != 0 && typeof itemNext === 'undefined') {
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


        api.items.reorder(vm.reorder.id, vm.reorder.order, vm.reorder.type, vm.reorder.id_parent, arrayKeyNext ? arrayKeyNext : '', itemNext ? itemNext.id : '', arrayKeyMoved ? arrayKeyMoved : 0, itemMoved ? itemMoved.id : 0, arrayKeyPrevious ? arrayKeyPrevious : 0, itemPrevious ? itemPrevious.id : 0).error(function (res) {
          $rootScope.message('Unknown error updating server with reorder info.', 'warning');
        }).success(function (res) {
          vm.isLoader = false;
          if (res.code) {
            return $rootScope.message("Error updating reorder information. (" + res.code + ": " + res.message + ")");
          } else {

            $rootScope.message("Heading order has been modified");

            var itemIndex;

            itemIndex = vm.headings.indexOf(itemMoved);
            console.log('itemIndex', itemIndex);
            vm.headings[itemIndex] = vm.reorder.order;

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
            // //////
            $rootScope.socketio.emit('data', packet);

          }
        });

      },
      containment: '#headings',
      allowDuplicates: false
    };

    vm.dragControlListenersItems = {

      accept: function (sourceItemHandleScope, destSortableScope, destItemScope) {
        console.log('accept drag')
        console.log('sourceItemHandleScope', sourceItemHandleScope)
        console.log('destSortableScope', destSortableScope)
        console.log('destItemScope', destItemScope)

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
        event.dest.index = event.dest.index == 0 ? event.dest.index + 1 : event.dest.index;

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
        } else if (itemPrevious && itemPrevious.order != 0 && typeof itemNext === 'undefined') {
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


        api.items.reorder(vm.reorder.id, vm.reorder.order, vm.reorder.type, vm.reorder.id_parent, arrayKeyNext ? arrayKeyNext : '', itemNext ? itemNext.id : '', arrayKeyMoved ? arrayKeyMoved : 0, itemMoved ? itemMoved.id : 0, arrayKeyPrevious ? arrayKeyPrevious : 0, itemPrevious ? itemPrevious.id : 0).error(function (res) {
          $rootScope.message('Unknown error updating server with reorder info.', 'warning');
        }).success(function (res) {
          if (res.code) {
            return $rootScope.message("Error updating reorder information. (" + res.code + ": " + res.message + ")");
          } else {
            $rootScope.message("Item order has been modified");
            var itemIndex;
            // loadChecklist(vm.idCHK)

            // itemIndex = vm.items.indexOf(itemMoved);
            //console.log('itemIndex', itemIndex);
            // vm.items[itemIndex] = vm.reorder.order;
            //vm.items[itemIndex].order = vm.reorder.order;



            // console.log('post vm.items', vm.items);

            // var packet;
            // packet = {
            //   catalog: 'items',
            //   type: 'reorder',
            //   user: {
            //     idCON: $rootScope.user.idCON,
            //     name: $rootScope.user.name
            //   },
            //   record: vm.items[itemIndex]
            // };
            // console.log('emitting data', packet);
            // $rootScope.socketio.emit('data', packet);

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
    function expand(what, which, parentID, forPdf) {


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

            if (forPdf === 'forPDF') {
              if (indexOf.call(vm.expandedPdf[whats], item) < 0) {
                catalog.push(item);
              }
            } else {
              if (indexOf.call(vm.expanded[whats], item) < 0) {
                catalog.push(item);
              }
            }

          }
        }
        console.log('vm.expanded', vm.expanded);
        if (forPdf === 'forPDF') {
          return vm.expandedPdf[whats] = vm.expandedPdf[whats].concat(catalog);
        }
        else {
          return vm.expanded[whats] = vm.expanded[whats].concat(catalog);
        }
      } else {
        if (forPdf === 'forPDF') {
          return vm.expandedPdf[whats].push(which);
        } else {
          vm.expanded[whats].push(which);
        }

        console.log('vm.expanded after push', vm.expanded);
      }
    };
    function collapse(what, which, parentID, forPdf) {
      var catalog, item, items, key, ref1, whats;
      if (parentID == null) {
        parentID = null;
      }
      whats = what + 's';
      if (which === 'all') {
        catalog = [];
        if (parentID === !null) {
          items = vm.toggleableChildren(what, parentID);
          if (forPdf === 'forPDF') {
            ref1 = vm.expandedPdf[whats];
          } else {
            ref1 = vm.expanded[whats];
          }

          for (key in ref1) {
            item = ref1[key];
            if (indexOf.call(items, item) < 0) {
              catalog.push(item);
            }
          }
        }
        if (forPdf === 'forPDF') {
          return vm.expandedPdf[whats] = catalog;
        } else {
          return vm.expanded[whats] = catalog;
        }

      } else {
        if (forPdf === 'forPDF') {
          return vm.expandedPdf[whats].remove(which);
        } else {
          return vm.expanded[whats].remove(which);
        }

      }
    };
    function isExpanded(what, which) {

      var whats, i, x;
      whats = what + 's';
      x = false;

      vm.isExpandedCounter++;
      vm.isExpandedCounter


      //console.log('indexOf', vm.expanded[whats].indexOf(which.id));

      for (i = 0; i < vm.expanded[whats].length; i++) {
        if (vm.expanded[whats][i].id == which.id) {
          // console.log('found');

          return true;
        }
      }
    };


    vm.expandedPdf = {
      sections: [],
      headings: [],
      items: [],
      referencess: []
    };

    vm.isExpandedForPdf = function (what, which) {

      // var whats, i, x;
      // whats = what + 's';
      // x = false;

      // vm.isExpandedPdfCounter++;


      // //console.log('indexOf', vm.expanded[whats].indexOf(which.id));

      // for (i = 0; i < vm.expandedPdf[whats].length; i++) {
      //   if (vm.expandedPdf[whats][i].id == which.id) {
      //     // console.log('found');

      //     return true;
      //   }
      // }
      return true;
    };

    function toggle(what, which, parentID) {
      if (parentID == 'allheader') {
        return true;
      }
      if (parentID == null) {
        parentID = null;
      }
      if (what === 'item' && which.name.length <= vm.itemShortLength) {
        return true;
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

    vm.toggleForPdf = function (what, which, parentID) {
      // if (parentID == 'allheader') {
      //   return true;
      // }

      if (vm.isExpandedForPdf(what, which)) {

        return vm.collapse(what, which, parentID, 'forPDF');
      } else {
        return vm.expand(what, which, parentID, 'forPDF');
      }
    };


    function toggleComplete(checklist) {
      api.checklists.toggleComplete(checklist.id).error(function (res) {
        return $rootScope.message("Error toggling Complete. (Communication with Server)", 'warning');
      }).success(function (res) {

        if (res && res.checklist && res.checklist.complete == 1) {
          $rootScope.message("Checklist completed", 'success');

        } else if (res && res.checklist && res.checklist.complete == 0) {
          $rootScope.message("Checklist marked not completed", 'success');
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

    vm.ElementExists = function (id, array1) {
      return array1.some(function (el) {
        return el.id === id;
      });
    }

    function organizeData() {
      // vm.items


      //  
      // if (!vm.items.length) vm.items = [];
      // vm.items.forEach(function (item1, index) {
      //    
      //   if (item1 == undefined) {
      //     vm.items.splice(index, 1)
      //   }
      // });


      //  
      // console.log(' vm.items organize data', vm.items)

      // if(vm.RecentlyAddedCHecklistItem) {
      //   vm.RecentlyAddedCHecklistItem = res.item;

      //    
      //   if(!vm.ElementExists(vm.RecentlyAddedCHecklistItem.id, vm.items)){
      //      
      //     if (!vm.items.length) vm.items = [];
      //     vm.items.push(vm.RecentlyAddedCHecklistItem)
      //   }
      // }

      // if(!vm.items.length) vm.items = []
      // vm.items.push(res.item);



      if (vm.items.length) {

        vm.items.forEach(function (item) {
          if (item) {
            return item.attachments = vm.children('attachments', item.id.toString());
          } else return 1;

        });
      }

      if (vm.headings.length) {
        vm.headings.forEach(function (heading) {
          heading.items = vm.children('items', heading.id.toString());
          return heading.attachments = vm.children('attachments', heading.id.toString());
        });
      }

      if (vm.sections.length) {
        vm.sections.forEach(function (section) {
          var section_id = section.id.toString();

          section.headings = vm.children('headings', section_id);

          return section.attachments = vm.children('attachments', section.id.toString());
        });
      }

      if (vm.checklists.length) {
        vm.checklists.forEach(function (checklist) {
          checklist.sections = vm.children('sections', checklist.idCHK);
          return checklist.attachments = vm.children('attachments', checklist.idCHK.toString());
        });
      }

      arrangeAttachments();

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

      //console.log('idCHK', idCHK);
      vm.setChecklistCtrlBlank();
      vm.checkIfLinked(idCHK);
      if (vm.isLinked || !vm.isLinked) {
        //console.log('is linked');
        if (!vm.loaded.checklist) {

          $scope.getChecklinked = function () {
            console.log('$scope.getChecklinked');


            api.checklists.get(idCHK, token).success(function (res) {
              var ref;

              if ((ref = res.checklists) != null ? ref.length : void 0) {
                vm.checklists = res.checklists;

                vm.isLinked = true;
                vm.isLoader = false;
                vm.nonCompliance_count = res.checklists[0].nonCompliance_count ? res.checklists[0].nonCompliance_count : 0;
                vm.total_nonCompliance = res.checklists[0].nonCompliance_total ? res.checklists[0].nonCompliance_total : 0;


                vm.DownloadedFromTemplaeId = vm.checklists[0].template_id;

                vm.showLoadingImage = false;
              } else {

                vm.checklists = [];
                vm.showLoadingImage = false;
              }


              vm.loaded.checklist = false;

              return $scope.$broadcast('event:checklistLoaded');

            })["finally"](function () {
              vm.loading.checklist = false;
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

              // vm.items.forEach(function(item){
              //   item


              // });
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
          getAttachments();
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

    function getAttachments() {
      vm.SectionAttachmentID
      vm.HeadingAttachmentID
      vm.pType, vm.pID, vm.index

      api.attachments.checklist($stateParams.id).success(function (res) {
        var ref;
        console.log(res);
        vm.isLoader = false;
        if ((ref = res.attachments) != null ? ref.length : void 0) {
          vm.attachments = vm.attachments.concat(res.attachments);
          $rootScope.attachments = res.attachments;
          vm.attachments = res.attachments;
          vm.SelectedAttachments = res.attachments;

          vm.checklists


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

    function arrangeAttachments() {
      if (vm.pType === "checklist") {
        // //ng-click="vm.openUploadAttachmentDialog($event, 'item', item.id, $index, item.attachments)"
        // // vm.pType = pType;
        // vm.openUploadAttachmentDialog(vm.pType, vm.pID, vm.index)
        // // vm.title = 'Attachments';
        // // vm.index = index;
        // // vm.SelectedAttachments = attachments;
        // // vm.upload = false;
        // vm.checklists


        vm.SelectedAttachments = res.attachments;
      } else if (vm.pType === "section") {

        vm.checklists[0].sections.forEach(function (section) {

          if (section.id == vm.pID) {
            vm.SelectedAttachments = section.attachments;
          }
        });
      } else if (vm.pType === "heading") {

        vm.checklists[0].sections.forEach(function (section) {

          if (section.id == vm.SectionAttachmentID) {

            section.headings.forEach(function (heading) {

              if (heading.id == vm.HeadingAttachmentID) {
                vm.SelectedAttachments = heading.attachments;
              }
            })

          }
        });
      } else if (vm.pType === "item") {

        vm.checklists[0].sections.forEach(function (section) {

          if (section.id == vm.SectionAttachmentID) {

            section.headings.forEach(function (heading) {

              if (heading.id == vm.HeadingAttachmentID) {

                heading.items.forEach(function (item) {

                  if (item.id == vm.pID) {
                    vm.SelectedAttachments = item.attachments;
                  }
                })

              }
            })
          }
        });
      }
    }

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
    // function children(whats, parentID) {
    //   return $filter('orderBy')($filter('filter')(vm[whats], {
    //     id_parent: parentID
    //   }, true), 'order');
    // };

    function children(whats, parentID) {
      return $filter('filter')(vm[whats], {
        id_parent: parentID
      }, true);
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





    function createSegment(what, name, to, type, info, item_type, alert, alert_sms, mobile) {

      console.log("optiondata=" + vm.newItem.dataType);
      console.log("what=" + what, to, type, info);
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
      switch (item_type) {
        case 'checkbox':
          vm.option = 1;
          break;
        case 'textbox':
          vm.option = 2;
          break;
        default:
          vm.option = 3;
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


      return svc.add(name, order, to, type, info, item_type, alert, vm.option, alert_sms, mobile).success(function (res) {
        vm.headingDialog = false;
        var notifyItem, packet;


        if (res.code) {
          vm.isLoader = false;
          vm.closeDialog();
          return $rootScope.message(res.message, 'warning');
        } else {


          // if (what == 'item') {
          // vm.labels.create.save(res.item, 'new');

          //   }


          if (alert) {
            checklistAlert(res.item);
          }


          vm.closeDialog();
          vm.isLoader = false;
          vm[whats].push(res[what]);
          vm.organizeData();

          if (what == "item") {
            $scope.getChecklinked();

            vm.RecentlyAddedCHecklistItem = res.item;

            // if(!vm.items.length) vm.items = []
            // vm.items.push(res.item);
          }



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
          switch (what) {
            case 'section':
              vm.resp_id = res.section.id;
              break;
            case 'heading':
              vm.resp_id = res.heading.id;
              break;
            case 'item':
              vm.resp_id = res.item.id;
              break;
          }
          //console.log('about to sent notify event', notifyItem);
          //$rootScope.createStats(what, 'created', vm.resp_id);
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


    // constructor(public dataTable: dataTable) {

    // }

    function destroy(what, item) {


      console.log('destroy destroy')

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
          console.log(packet);

          var dat = {
            record: {
              idhg: 45
            }
          }
          $rootScope.socketio.emit('data', dat);
          // $rootScope.socketio.emit('data', packet);
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
      return item.type == 2;
    };

    function add(what, to, ev, option) {
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
              title: 'Add New Checkbox',
              label: 'Checkbox Label',
              type: 'checkbox',
            }
          } else if (option == '2') {
            vm.type =
            {
              title: 'Add New Text Box',
              label: 'Name',
              type: 'textbox',

            }
          }
          else if (option == 'yn') {
            vm.type =
            {
              title: 'Add New Y/N Checkboxes',
              label: 'Add Y/N Checkboxes Label',
              type: 'yn',

            }
          }
          break;
        case 'section':
          vm.type.title = 'Add New Section';
          vm.type.label = 'Section Label'
          vm.type.type = '';
          break;
        case 'heading':
          vm.type.title = 'Add New Heading';
          vm.type.label = 'Heading Label';
          vm.type.type = '';
          break;
        case 'datatable':
          vm.type.title = 'Create/Edit Table';
          vm.type.label = 'Add Name and Number of Columns and Rows';
          vm.type.rows = 'Rows';
          vm.type.columns = 'Columns';
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

      console.log('vm.newItem0', vm.newItem)

      var templ_url = 'app/main/checklist/dialogs/checklist/checklist-add-dialog.html'
      if (what === 'datatable') {

        templ_url = 'app/main/checklist/dialogs/checklist/checklist-addDataTable-dialog.html'
      }

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: templ_url,
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });

    };

    function userCheckboxes(userID) {
      // 
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
          // 

          vm.checkboxes = vm.checkboxes.concat(res.checkboxes);
          // return vm.appendCheckboxesToItems(user);
        })["finally"](function () {
          
          vm.appendCheckboxesToItems(user);
          return vm.loading.checkboxes = false;
        });
      }
    };

    function evaluateConflicts(item, operation) {
      // item
      // 


      var addConflicts, leftNonCompliant, ref1, ref2, rightNonCompliant;

      item = api.summary.evaluateItem(item, item.checkbox, token);
      // addConflicts = operation * +item.conflicts;
      vm.conflicts += addConflicts;
      if (((ref1 = item.checkbox) != null ? ref1[0] : void 0) !== void 0 && item.checkbox[0] && item.checkbox[0].item_type != 'yn') {
        leftNonCompliant = operation * +item.checkbox[0].nonCompliant;
        vm.nonCompliant[0] += leftNonCompliant;
      }
      if (((ref2 = item.checkbox) != null ? ref2[1] : void 0) !== void 0 && item.checkbox[0] && item.checkbox[0].item_type != 'yn') {
        rightNonCompliant = operation * +item.checkbox[1].nonCompliant;
        vm.nonCompliant[1] += rightNonCompliant;
      }
      return item;
    }

    function appendCheckboxesToItems(user) {

      var userKey;
      vm.nonCompliant = [0, 0];
      vm.conflicts = 0;
      userKey = vm.getUserKey(user);
      if (userKey === -1) {
        return false;
      }
      return vm.items.forEach(function (item) {
        var checkbox;
        
        if (item) {
          if (item.checkbox === void 0) {
            item.checkbox = [];
          }


          if (vm.checkboxes) {
            
            if(vm.checkboxes[0]){
              
              if(vm.checkboxes[0].parent_item_id === "0"){

             return   checkbox = $filter('filter')(vm.checkboxes, {
                  id_item: item.id,
                  id_contact: user.idCON
                }, true);
              }
            }

        //  } else {
          }
            

            checkbox = $filter('filter')(vm.checkboxes, {
              parent_item_id: item.ref_id,
              id_contact: user.idCON
            }, true);

        //  }




        }



        //   vm.users
        //  if($rootScope.showingUsers.length > 1){
        //   
        //   checkbox = $filter('filter')(vm.checkboxes, {
        //     id_item: item.id,
        //     id_contact: user.idCON
        //   }, true);
        //  }else{
        //   
        //   checkbox = $filter('filter')(vm.checkboxes, {
        //     id_item: item.id,
        //     // id_contact: user.idCON
        //   }, true);

        //  }

        // checkbox
        // 
        if (checkbox != null ? checkbox.length : void 0) {
          item.checkbox[userKey] = checkbox[0];
          // 
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
      // 
      $rootScope.showingUsers[action]();
      vm.conflicts = 0;
      vm.nonCompliant = [0, 0];
      vm.items.forEach(function (item) {
        return vm.evaluateConflicts(item, +1);
      });
      return console.log('user checkboxes removed', user, $rootScope.showingUsers);
    };



    function showLinkedUsers(ev, item) {



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

      return $rootScope.showingUsers.forEach(function (user) {
        vm.displayUserCheckboxes(user);
      });
    });

    function toggleCheckbox(item, which, type, userKey, value) {
      console.log('item with checkbox -- ', item);

      vm.evaluateConflicts(item, -1);
      //vm.isLoader = true;


      var applies = item.checkbox[userKey].applies
      var complies = item.checkbox[userKey].complies

      // item.checkbox[0].applies
      // item.checkbox[0].complies
      // item.checkbox[0].options


      // case of yes no
      if (type === "yn") {
        //in case no is clicked
        if (which === "complies") {

          // uncheck the no
          if (complies) {
            item.checkbox[0].applies = applies;
            item.checkbox[0].complies = 0;
            item.checkbox[0].options = null;
            item.item_status = null;

          } else {
            // check the no
            item.checkbox[0].applies = 0;
            item.checkbox[0].complies = 1;
            item.checkbox[0].options = "complies";
            item.item_status = "No";
          }

        } else {
          //in case yes is clicked
          // uncheck the yes
          if (applies) {
            item.checkbox[0].applies = 0;
            item.checkbox[0].complies = 0;
            item.checkbox[0].options = null;
            item.item_status = null;

            // check the yes
          } else {
            item.checkbox[0].applies = 1;
            item.checkbox[0].complies = 0;
            item.checkbox[0].options = "applies";
            item.item_status = "Yes";
          }
        }
        // case of req comp
      } else {
        //in case Comply is clicked
        if (which === "complies") {

          // uncheck the Comply
          if (complies) {
            item.checkbox[0].applies = applies;
            item.checkbox[0].complies = 0;
            if (applies) {
              item.checkbox[0].options = "applies";
              item.item_status = "Req";
            }
            else {
              item.checkbox[0].options = null;
              item.item_status = null;
            }

          } else {
            // check the Comply
            item.checkbox[0].applies = 1;
            item.checkbox[0].complies = 1;
            item.checkbox[0].options = "complies";
            item.item_status = "Comp";
          }

        } else {
          //in case Req is clicked
          // uncheck the Req
          if (applies) {
            item.checkbox[0].applies = 0;
            item.checkbox[0].complies = 0;
            item.checkbox[0].options = null;
            item.item_status = null;

            // check the Req
          } else {
            item.checkbox[0].applies = 1;
            item.checkbox[0].complies = 0;
            item.checkbox[0].options = "applies";
            item.item_status = "Req";
          }
        }
      }

      vm.datapoint_item = item;
      // ////
      saveItem('editFromToggle', item, userKey, which, type);
      // (idCLI, idCON, which, type)
      // return api.checkbox.toggle(item.id, $rootScope.showingUsers[userKey].idCON, which, type).success(function (res) {
      //   if (item.checkbox === void 0) {
      //     item.checkbox = [];
      //   }
      //   $scope.getChecklinked();
      //   vm.isLoader = false;

      //   // item
      //   // ////
      //   // $rootScope.createStats('checkbox', which == 'applies' ? 'checked' : 'uncheckd', vm.item.id);
      //   //  item.checkbox[userKey] = res.checkboxes[0];
      //   item.checkbox[userKey] = res.checkboxes[0];
      // //  vm.labels.create.save(res.checkboxes[0], 'checked');



      //   return vm.evaluateConflicts( vm.datapoint_item, +1);
      // });
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
      attachment: '',
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

        console.log('vm.publish.name', vm.publish);

        if (!vm.publish.attachment) {
          vm.publish.attachment = '';
        }

        var ref1, ref2;
        if (((ref1 = vm.publish.idCHK) != null ? ref1.length : void 0) && ((ref2 = vm.publish.name) != null ? ref2.length : void 0)) {

          vm.publish.submitting = true;
          return api.checklists.publish(vm.publish.idCHK, vm.publish.name, 'checklist', vm.publish.pvt, token, vm.publish.attachment).error(function (res) {
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
          // //////
          $rootScope.socketio.emit('data', packet);
          notifyItem = $.extend({}, res.updated, {
            type: 'data'
          });
          $rootScope.notify(notifyItem);
          vm.organizeData();
          return $rootScope.showingUsers.forEach(function (user) {
            // 
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

      if ($rootScope.user.dashboard) {

        return vm.labels.selectable = $filter('filter')($rootScope.user.dashboard.labels, {
          type: vm.labels.item.type
        });
      }

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

        vm.SelectedAddDataPointOptions = item.checkbox[0].options;
        vm.SelectedAddDataPointItemType = item.checkbox[0].item_type

        var option = '';
        if (item.item_type === 'checkbox') option = 'complies';
        else option = 'applies';

        var base, base1;
        vm.labels.selected = item.labels;
        vm.labels.item = {
          id: item.id,
          index: vm.items.indexOf(item),
          type: item.type,
          option: option,
          item_type: item.item_type,
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

        //comply
        // {"type":"item","name":"comply","info":"vv","order":15,"dataType":1,"item_type":"checkbox","item_alert":"","parentID":"1124","option":"complies"}

        //yes 
        //{"type":"item","name":"yes yes","info":"tt","order":16,"dataType":3,"item_type":"yn","item_alert":"","parentID":"1124","option":"applies"}: 

        // ?text
        // {"type":"item","name":"text","info":"ycy","order":6,"dataType":2,"item_type":"textbox","item_alert":"","parentID":"1036","option":"applies"}: 

        // right now going
        //{"type":"3","name":"hell","explanation":"fff","checkboxinfo":{"id":"1725","index":12,"type":"3","item_type":"yn","key":"new"}}: 
        // {"type":"1","name":"ff","explanation":"ff","checkboxinfo":{"id":"1726","index":13,"type":"1","item_type":"checkbox","key":"new"}}: 

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

            vm.items[vm.labels.item.index] = res.item ? res.item : vm.items[vm.labels.item.index];
            packet = {
              catalog: 'items',
              type: 'edit',
              user: {
                idCON: $rootScope.user.idCON,
                name: $rootScope.user.name
              },
              record: res.item ? res.item : vm.items[vm.labels.item.index]
            };
            console.log('emitting data', packet);
            // //////
            $rootScope.socketio.emit('data', packet);

            if (res.item) {
              notifyItem = $.extend({}, res.item, {
                type: 'data'
              });
            }

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
        item_status: '',
        enter: function () {
          vm.labels.create.entering = true;

          vm.labels.create.name = '';
          vm.labels.create.explanation = '';
          vm.labels.create.name = '';
          vm.labels.create.item_status = '';

          // $('input#newLabelName').focus(function() {
          //   alert( "Handler for .focus() called." );
          //   ////
          // });
          // ////
          return false;
        },
        save: function (labels, key) {



          if (labels && key == 'checked') {
            vm.type = '2';
            this.name = 'test';
            this.explanation = '';
            labels.key = key;

          }
          else if (key == 'new' && labels) {
            vm.type = labels ? labels.type : '';
            this.name = labels ? labels.name : '';
            this.explanation = labels ? labels.info : '';
            labels.key = key;
            delete labels.tree_structure;
            delete labels.inviterDetails;
            delete labels.labels;
            delete labels.item_bread;
            delete labels.ownerDetails;



          } else {

            if (vm.labels.item) {
              vm.type = vm.labels.item.type;
              this.name = this.name;
              vm.labels.item.key = 'new';
              this.explanation = this.explanation;

              if (vm.labels.create.item_status === '') {
                return $rootScope.message("Please select label type to continue.", 'error');
              }


            }

          }
          vm.isLoader = true;
          vm.labels.create.saving = true;


          //console.log('adding new label', vm.labels.item, this.name, this.explanation);
          return api.dashboard.labels.add(vm.type, this.name, this.explanation, labels ? labels : vm.labels.item, labels ? labels.option : vm.labels.create.item_status).success(function (res) {
            vm.isLoader = false;



            if (res === void 0 || res === null || res === '') {
              return $rootScope.message("Server not responding properly.", 'warning');
            } else if (res.code) {
              // return $rootScope.message(res.message, 'warning');
            } else {
              vm.labels.selectable.push(res.labels[0]);
              vm.labels.create.entering = false;

              $rootScope.user = res.user;
              //console.log('about to propagate labels created', $rootScope.user.organization.idACC, $rootScope.socketio);
              $rootScope.socketio.emit('labels_changed', $rootScope.user.organization.idACC);
              // return $rootScope.message("New Label added", 'success');
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
      //////// //////;
      vm.verticalStepper = {
        step1: {},
        step2: {},
        step3: {}
      };

      // console.log('fffffffffff',vm.checklists)

      // var grp_id = window.location.href.substr(window.location.href.lastIndexOf('/') + 1);
      // console.log('grp_id',grp_id)
      // fetchGroups(grp_id)
      // console.log('vm.groups', vm.groups);

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            // // //////
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


    function openUploadAttachmentDialog(ev, pType, pID, index, attachments, sectionId, headingId) {

      vm.pType = pType;
      vm.pID = pID;
      vm.title = 'Attachments';
      vm.index = index;
      vm.SelectedAttachments = attachments;
      vm.upload = false;
      vm.SectionAttachmentID = sectionId;
      vm.HeadingAttachmentID = headingId;
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


    function uploadAttachment(what, pID, index) {
      var whats;
      whats = what + 's';

      if ($scope.files[0]) {
        vm.file_name = $scope.files[0].name;
        var fd = new FormData();
        angular.forEach($scope.files, function (file) {
          fd.append('file', file);
        });
        vm.spinner = true;
        vm.sizeLimit = 10585760; // 10MB in Bytes

        var filedata = { 'pID': vm.pID, 'pType': whats, 'aws': '', 'name': vm.file_name, 'size': vm.sizeLimit, 'label': vm.label };
        fd.append('data', JSON.stringify(filedata));
        $http.post(BASEURL + 'attachments-finish_upload-post.php', fd,
          {
            headers: { 'Content-Type': undefined }
          }).success(function (res) {
            vm.spinner = false;
            if (res && res.type == 'success') {
              // //////;
              //  $mdDialog.hide();
              vm.upload = false;

              //vm.attachments.push(res.attachments[0]);
              // var SelectedAttachmentsArray = [];
              //  vm.SelectedAttachments.push(res.attachments[0]);

              getAttachments();

              vm[whats][index].attachments.push(res.attachments[0]);
              //////

              // vm.SelectedAttachments = vm.SelectedAttachments.filter( function(attachment, index, self) {
              //   index === self.findIndex( function(t) {

              //     t.id === attachment.id && t.name === attachment.name
              //      })
              //   });

              // removeDuplicates(vm.SelectedAttachments, 'id')

              var myData = vm.SelectedAttachments;

              vm.SelectedAttachments = Array.from(new Set(myData.map(JSON.stringify))).map(JSON.parse);

              vm.SelectedAttachments


              vm.label = null;
              vm.file = '';
              // organizeData();
              $rootScope.message("Attachment label added successfully", 'success');
            } else {
              if (res.message.file_label) $rootScope.message(res.message.file_label[0], 'warning');
              else $rootScope.message(res.message, 'warning');
            }
          })
      } else {
        $rootScope.message("Please choose atleast one file to upload", 'error');
      }



      // api.attachments.add(vm.pID, vm.pType, vm.aws, 'files', 'sizeLimit', vm.label,fd).error(function (res) {
      //   ////// //////;
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



    //   function removeDuplicates(originalArray, prop) {
    //     var newArray = [];
    //     var lookupObject  = {};

    //     for(var i in originalArray) {
    //        lookupObject[originalArray[i][prop]] = originalArray[i];
    //     }

    //     for(i in lookupObject) {
    //         newArray.push(lookupObject[i]);
    //     }
    //      return newArray;
    // }


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
      ////// //////;
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
      vm.folder.link = '';
      vm.folder.attachment = '';
      vm.isLoader = true;
      api.folders.add(vm.folder.name, vm.folder.description, vm.folder.link, vm.folder.attachment, vm.folder.order, '').error(function (res) {
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

          cancelGroupInput();
          $rootScope.$broadcast('event:updateModels');
          vm.folders.push(res.folder);
          $rootScope.organizeData();

          fetchGroups(res.folder.id);


          $rootScope.message('Project Added');

          //Hide Buttons
          vm.wizard.newFolder = false;


        }
      });

    };

    function addNewGroup(groupName, folderID) {


      vm.group.sending = true;
      vm.group.order = 1;
      vm.group.order += vm.groups ? vm.groups.length : 0;
      vm.group.text = groupName;

      vm.group.id_parent = folderID;

      api.groups.add(vm.group.text, vm.group.order, vm.group.id_parent, vm.group.description).error(function (res) {
        return $rootScope.message("Error Adding Folder", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          return $rootScope.message("Error Adding Folder", 'warning');
        } else if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {

          $rootScope.$broadcast('event:updateModels');
          if (res.group.length > 0) {
            vm.groups.push(res.group);
          }

          $rootScope.organizeData();
          ftchFolder(folderID)
          vm.verticalStepper.newGroupID = res.group.id;
          vm.verticalStepper.newFolderID = res.group.id_parent;

          vm.wizard.newGroup = false;
          vm.wizard.switch = false;
          $rootScope.message('Folder Added');
        }
      });
    };

    function addNewChecklist(checklistName, checklistDescription, groupID, folderID, checklist_id, sub_type, attachment, link) {

      //Set sending variable for buttons
      vm.checklist.sending = true;

      //Set order variable for sql insert
      vm.checklist.order = 1;
      vm.checklist.order += vm.checklists.length;

      //name, order, to
      api.checklists.add(checklistName, vm.checklist.order, groupID, token, checklistDescription, checklist_id ? checklist_id : '', sub_type ? sub_type : '', attachment, link).error(function (res) {
        return $rootScope.message("Error Adding Checklist", 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if (res.type != 'success' || res === '') {
          return $rootScope.message("Error Adding Checklist", 'warning');
        }

        else {
          $rootScope.message("New checklist has been created successfully", 'success');
          vm.showLoadingImage = true;
          console.log(' $scope', $scope);

          if (vm.checklistFromGroup) getChecklistGroup();
          else $scope.getChecklinked();
          // loadChecklist($stateParams.id);

          // $rootScope.createStats('checklist', 'created', res.checklist.id);
          api.sections.add('sections', 1, res.checklist.id ? res.checklist.id : checklist_id).error(function (res) {
            return $rootScope.message("Error Adding Section", 'warning');
          }).success(function (res) {

            if (res === void 0 || res === null || res === '') {
              return $rootScope.message("Error Adding Section", 'warning');

            } else {
              console.log('sections', vm.sections);
              vm.sections.push(res.section);

            }
          });
          $rootScope.$broadcast('event:updateModels');
          vm.checklists = $rootScope.checklists;
          if (!$state.is('app.checklist.detail')) {
            vm.checklists.unshift(res.checklist);
          }

          $rootScope.organizeData();
          //$rootScope.message(res.type, 'success');
          vm.total_nonCompliance = 0;

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

    function publishTemplate(ev, idCHK, checklist_name) {
      $mdDialog.show({
        controller: 'ChecklistPublishTemplateDialogController',
        controllerAs: 'vm',
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-publish-template-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true,
        locals: {
          idCHK: idCHK,
          checklist_name: checklist_name
        }
      });

    };

    function deleteConfirm(what, item, ev) {

      vm.title = 'Delete ' + what;
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



      if (what == "schedule") {

        deleteScheduler(item.id)

        return 1;

      }


      vm.isLoader = true;
      var svc, whats;
      whats = what + 's';

      svc = vm.svc(what);
      console.log('svc', svc);
      console.log('what', what);
      console.log('item.id', item.id);

      return svc.destroy(item.id).success(function (res) {
        vm.isLoader = false;
        var notifyItem, packet;
        console.log('res', res)
        if (res.code) {
          return $rootScope.message(res.message, 'warning');
        } else {
          vm[whats].remove(item);
          if (what == "item") {
            $scope.getChecklinked();
          }
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
          console.log('emitting data', packet);

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
      ftchFolder(id ? id : vm.verticalStepper.step1.folderID)
      vm.groups = $rootScope.children('groups', id ? id : vm.verticalStepper.step1.folderID);
      $rootScope.organizeData();

      // if (!vm.groups.length > 0) {
      //   vm.wizard.switch = true;
      // } else {
      //   vm.wizard.switch = false;
      // }
    };
    function ftchFolder(id) {
      api.groups.get(id ? id : '').then(function (d) {
        vm.groups = d.data.groups;
        id ? $rootScope.nextStep() : '';
      });
    }



    vm.groupNext = groupNext;
    function groupNext() {
      $rootScope.nextStep();
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
        //  vm.isLoader = false;
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

    function openChecklistDialog(ev, checklist, type) {

      vm.title = type ? 'Create Duplicate' : 'Edit Checklist';
      vm.checklist = checklist;
      vm.type = type;

      vm.checklistName = type ? '' : vm.checklist.name;
      vm.checklistDescription = type ? '' : vm.checklist.description;


      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-checklist-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: false
      });
    }

    function saveChecklist(type) {



      if (!vm.checklist.attachment) {
        vm.checklist.attachment = '';
      }

      vm.checklist.name = vm.checklistName;
      vm.checklist.description = vm.checklistDescription;

      if (type) {
        addNewChecklist(vm.checklist.name, vm.checklist.description, vm.checklist.item_bread.project_id, vm.checklist.item_bread.folder_id, vm.checklist.id, 'duplicate', vm.checklist.attachment, vm.checklist.link)
      } else {

        var editPack;
        editPack = {
          'id': vm.checklist.idCHK,
          'rid': vm.checklist.rid,
          'index': 0,
          'type': 'checklist',
          'text': vm.checklist.name,
          'description': vm.checklist.description,
          'token': token,
          'link': vm.checklist.link,
          'attachment': vm.checklist.attachment
        };


        api.checklists.edit(editPack).error(function (res) {
          $rootScope.message("Error Editing Checklist", 'warning');
        }).success(function (res) {
          if (res === void 0 || res === null || res === '') {
            $rootScope.message("Error Editing Checklist", 'warning');
          } else if (res.code) {
            $rootScope.message(res.message, 'warning');
          } else {
            // $rootScope.createStats('checklist', 'updated', vm.checklist.idCHK)
            //Toaster Notification
            $rootScope.message('Checklist has been changed successfully', 'success');

            vm.checklist.sending = false;

            //Close Dialog Window
            vm.closeDialog();
          }


        });
      }

    }

    function openSectionDialog(ev, section) {

      vm.section = section;
      vm.title = 'Edit Section';

      vm.sectionName = vm.section.name;
      // 

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



    function saveSection(section, section_na, index) {
      vm.sectionCanBeNA = true;

      section.headings.forEach(function sectionLoop(heading) {
        if (sectionLoop.stop) { return; }

        heading.items.forEach(function headingLoop(item) {
          if (headingLoop.stop) { return; }

          if (item.checkbox[0].applies || item.checkbox[0].complies) {
            $rootScope.message('Section cannot be marked N/A with inputs on the Line Item(s)', 'error');
            vm.sectionCanBeNA = false;
            headingLoop.stop = true;
          }
        });

        if (!vm.sectionCanBeNA) {
          sectionLoop.stop = true;
        }

      });


      if (vm.sectionCanBeNA) {
        vm.section = section;
        var section_na = section_na ? section_na : '';
        var index = index ? index : 0;
        var sectionIndex = index;
        var token = $cookies.get("token");
        var editPack;


        editPack = {
          'id': vm.section ? vm.section.id : section.id,
          'rid': vm.section ? vm.section.rid : section.rid,
          'index': 0,
          'type': 'section',
          'section_type': section_na,
          'text': vm.sectionName,
          'section_na': section.section_na == 'true' ? 'false' : 'true',
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

            if (vm.title === 'Edit Section') vm.section.name = vm.sectionName;


            vm.closeDialog();

            //chekSectionNA(vm.section_na)
            // loadChecklist(vm.idCHK);
            if (section_na == 'section_na') {
              // vm.section.section_na = res.updated.section_na;
              if (res.updated.section_na == 'true') {

                $rootScope.message('Section has been marked as Section N/A', 'success');
              }
              else {
                $rootScope.message('Section has been unmarked from Section N/A', 'success');
              }
              vm.sections[sectionIndex].section_na = res.updated.section_na == 'true' ? 'true' : 'false';
              // item.section_na = res.updated.section_na == 'true' ? 'true' : 'false';

              vm.items.forEach(function (item) {
                if (vm.section.id == item.item_bread.section_id) {
                  item.section_na = res.updated.section_na == 'true' ? 'true' : 'false';

                }


              });
            }
            else {
              $rootScope.message('Section has been changed successfully', 'success');
            }




          }
        });
      }

    }

    // function saveSectionNA(item_type,id,section_na,name) {
    // var token = $cookies.get("token");;
    //  // //////;
    //   var editPack;
    //   editPack = {
    //     'id':id,
    //     'rid': id,
    //     'index': 0,
    //     'type': 'section',
    //     'section_type': item_type,        
    //     'text': name,        
    //     'section_na': section_na == 'true' ? 'false' : 'true',
    //     'token': token, 
    //   };



    //   api.checklists.edit(editPack).error(function (res) {
    //     $rootScope.message("Error Editing Section", 'warning');
    //   }).success(function (res) {
    //     // //////;
    //     if (res === void 0 || res === null || res === '') {
    //       $rootScope.message("Error Editing Section", 'warning');
    //     } else if (res.code) {

    //       $rootScope.message(res.message, 'warning');
    //     } else {
    //       vm.closeDialog();
    //       vm.section_na = res.section_na == 'true' ? 'false' : 'true';
    //       if(res.section_na == 'true'){
    //         $rootScope.message('Section has been marked as Section N/A', 'success');
    //       }
    //       else{
    //           $rootScope.message('Section has been unmarked from Section N/A', 'success');
    //       }

    //     }
    //   });
    // }

    // vm.chekSectionNA = chekSectionNA;

    // function chekSectionNA(section_na,index){
    //   vm.section_na= section_na;

    // }

    //Worked for the section NA
    // vm.saveSectionNA = saveSectionNA;
    //   function saveSectionNA(section) {
    //     // //////;
    //     var editPack;
    //     editPack = {
    //       'id': section.id,
    //       'rid': section.rid,
    //       'index': 0,
    //       'type': 'section',
    //       'text': section.name,
    //       'section_na': section.section_na ? 0 : 1,
    //       'token': token
    //     };

    //     api.checklists.edit(editPack).error(function (res) {
    //       $rootScope.message("Error Editing Section", 'warning');
    //     }).success(function (res) {
    //       if (res === void 0 || res === null || res === '') {
    //         $rootScope.message("Error Editing Section", 'warning');
    //       } else if (res.code) {
    //         $rootScope.message(res.message, 'warning');
    //       } else {
    //         vm.closeDialog();
    //        // $rootScope.createStats('section', 'updated', vm.section.id);
    //         $rootScope.message('Section has been changed successfully', 'success');
    //         vm.section.sending = false;

    //         //  vm.closeDialog();
    //       }
    //     });
    //   }

    // function openHeadingDialog(ev, heading) {

    //   vm.heading = heading;
    //   vm.title = 'Edit Heading';

    //   console.log('vm.heading', vm.heading);

    //   $mdDialog.show({
    //     scope: $scope,
    //     preserveScope: true,
    //     templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-heading-dialog.html',
    //     parent: angular.element($document.find('#checklist')),
    //     targetEvent: ev,
    //     clickOutsideToClose: true
    //   });
    // }


    /**Data Table Function Updated Code Start Here ** */

    function openHeadingDialog(ev, heading, heading_type, heading_type_action) {
      // //////;
      vm.heading_type = heading_type != '' ? heading_type : '';
      var heading_type_action = heading_type_action != '' ? heading_type_action : '';
      vm.heading = heading;
      // 
      //// // //////;

      if (vm.heading_type == 'table' && heading_type_action != '' && heading_type_action == 'edit') {
        vm.title = 'Table';
        /**********************/
        var what = 'heading';



        var name = heading.name;
        var to = heading.id_parent;
        var type = heading_type;
        var info = '';
        var item_type = '';
        var alert = '';
        var columns = heading.datatable[0].column;
        var rows = heading.datatable[0].row;
        var table_id = heading.datatable[0].id;
        var table_str = heading.datatable[0].table_str;

        console.log(what, name, to, type, info, item_type, alert, columns, rows, ev, table_id, table_str, heading)
        createDataTableSegment(what, name, to, type, info, item_type, alert, columns, rows, ev, table_id, table_str, heading);

        /******************* */
      }
      else {
        vm.title = 'Heading';

        vm.headingName = heading.name;

        if (vm.heading_type == 'table') {
          vm.title = "Table";
        }


        $mdDialog.show({
          scope: $scope,
          preserveScope: true,
          templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-heading-dialog.html',
          parent: angular.element($document.find('#checklist')),
          targetEvent: ev,
          clickOutsideToClose: true
        });

      }
    }




    function saveHeading() {

      var editPack;

      editPack = {
        'id': vm.heading.id,
        'rid': vm.heading.rid,
        'index': 0,
        'type': 'heading',
        'text': vm.headingName,
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

          vm.heading.name = vm.headingName;

          //$rootScope.createStats('heading', 'created', vm.heading.id);
          $rootScope.message('Heading has been changed successfully ', 'success');

          vm.heading.sending = false;

          vm.closeDialog();
        }
      });
    }


    function closeConfilicts() {
      ////// //////;
      if ($rootScope.showingUsers.length > 1) {
        $rootScope.showingUsers.splice(1, 1);
        $state.go('app.summary');
      }


    }

    function openItemDialog(ev, item) {
      vm.ChnagedItem = item;


      // //   vm.newItem = {};

      // //   vm.newItem.name = item.name;
      // //   vm.newItem.to = item.item_bread.heading_id
      // //   vm.newItem.dataTypes = item.
      // //   vm.newItem.info = item.info
      // //   vm.newItem.alert = item.checkbox[0].item_alert
      // //   if(item.checkbox[0].item_alert_sms) vm.newItem.alert_sms = item.checkbox[0].item_alert_sms
      // //   if(item.checkbox[0].mobile) vm.newItem.mobile = item.checkbox[0].mobile
      //   vm.title = 'Edit Checkbox Line';

      //   if(item.info) vm.Item_info = item.info;
      //   else vm.Item_info = '';

      // //  if (item.type === '2'){
      // //   var option = 'yn';
      // //  }else var option = item.type;



      // //   if (option == '1') {
      // //     vm.type =
      // //       {
      // //         title: 'Edit Checkbox',
      // //         label: 'Checkbox Label',
      // //         type: 'checkbox',
      // //       }

      // //     vm.newItem.type = "Checkbox";
      // //   } else if (option == '2') {
      // //     vm.type =
      // //       {
      // //         title: 'Edit Text Box',
      // //         label: 'Name',
      // //         type: 'textbox',

      // //       }
      // //       vm.newItem.type = "Textbox";
      // //   }
      // //   else if (option == 'yn') {
      // //     vm.type =
      // //       {
      // //         title: 'Edit Y/N Checkboxes',
      // //         label: 'Add Y/N Checkboxes Label',
      // //         type: 'yn',

      // //       }
      // //       vm.newItem.type = "Y/N";
      // //   }



      // //   // vm.newItem = {

      // //   //   type: vm.
      // //   //   option: item.type,
      // //   //   name: '',
      // //   //   submitting: false,
      // //   //   dataType: option
      // //   // };

      // //   // console.log('vm.newItem0', vm.newItem)

      // //   var templ_url = 'app/main/checklist/dialogs/checklist/checklist-add-dialog.html'

      //   $mdDialog.show({
      //     scope: $scope,
      //     preserveScope: true,
      //     // templateUrl: templ_url,
      //     templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-item-dialog.html',
      //     parent: angular.element($document.find('#checklist')),
      //     targetEvent: ev,
      //     clickOutsideToClose: true
      //   });
      // }

      EvaluatingDialogDataEditItem(item)

      // vm.datapoint_item = item;

      console.log('datapoint_item', vm.datapoint_item)


      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
            EvaluatingDialogDataEditItem(item)

          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-edit-item-dialog.html',
        parent: angular.element($document.find('#checklist')),
        clickOutsideToClose: false
      });

    }

    function EvaluatingDialogDataEditItem(item) {
      vm.datapoint_item = {};




      console.log('datapoint.type', item.type)
      if (item.type == '1') {

        vm.datapoint_item =
        {
          title: 'Checkbox',
          label: 'Checkbox Label'
        }

        if (item.checkbox[0].complies) vm.datapoint_item.item_status = 'Comp';
        else if (item.checkbox[0].applies) vm.datapoint_item.item_status = 'Req';

      } else if (item.type == '2') {
        vm.datapoint_item =
        {
          title: 'Text Box',
          label: 'Name'
        }
      }
      else if (item.type == '3') {


        vm.datapoint_item =
        {
          title: ' Y/N Checkboxes',
          label: ' Y/N Checkboxes Label'
        }

        if (item.checkbox[0].applies) vm.datapoint_item.item_status = 'Yes';
        else if (item.checkbox[0].complies) vm.datapoint_item.item_status = 'No';
      }


      // vm.datapoint_item = datapoint
      vm.datapoint_item.checkbox = item.checkbox;
      vm.datapoint_item.item_type = item.item_type;
      // vm.datapoint_item.item_status = item.item_status;
      vm.datapoint_item.name = item.name;
      vm.datapoint_item.info = item.info;
      vm.datapoint_item.type = item.type;
      vm.datapoint_item.id = item.id;

      if (item.checkbox[0].item_alert === "0" || item.checkbox[0].item_alert === null) {
        vm.datapoint_item.checkbox[0].alert = false;
      } else if (item.checkbox[0].item_alert === "1") {
        vm.datapoint_item.checkbox[0].alert = true;
      } else {
        vm.datapoint_item.checkbox[0].alert = item.checkbox[0].item_alert;
      }

      if (item.checkbox[0].sms_alert == "0" || item.checkbox[0].sms_alert === null) {
        vm.datapoint_item.checkbox[0].sms_alert = false;
      } else if (item.checkbox[0].sms_alert == "1") {
        vm.datapoint_item.checkbox[0].sms_alert = true;
      } else {
        vm.datapoint_item.checkbox[0].sms_alert = item.checkbox[0].sms_alert;
      }


      // vm.datapoint_item.checkbox[0].alert = item.checkbox[0].item_alert === "0" || item.checkbox[0].item_alert === null ? false : true;
      // vm.datapoint_item.checkbox[0].sms_alert = item.checkbox[0].sms_alert  === "0" || item.checkbox[0].sms_alert === null  ? false : true;
      vm.datapoint_item.checkbox[0].sms_alert_number = item.checkbox[0].sms_alert_number;

      // vm.datapoint_item = item;


    }



    function openFormLineDialog(ev, item) {
      ////// //////;
      vm.item = item;
      vm.title = 'Edit Item';

      // vm.item.info = vm.Item_info;
      vm.Item_info = vm.item.info;
      vm.Item_name = vm.item.name;


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

    function saveItem(check, item, userKey, which, type) {

      vm.isLoader = true;

      if (check === 'edit_yn_checkbox') {

        if (vm.datapoint_item.item_status === "No") {
          vm.datapoint_item.checkbox[0].applies = 0;
          vm.datapoint_item.checkbox[0].complies = 1;
          vm.datapoint_item.checkbox[0].options = 'complies';

        } else if (vm.datapoint_item.item_status === "Comp") {
          vm.datapoint_item.checkbox[0].applies = 1;
          vm.datapoint_item.checkbox[0].complies = 1;
          vm.datapoint_item.checkbox[0].options = 'complies';

        } else if (vm.datapoint_item.item_status === "Yes" || vm.datapoint_item.item_status === "Req") {
          vm.datapoint_item.checkbox[0].applies = 1;
          vm.datapoint_item.checkbox[0].complies = 0;
          vm.datapoint_item.checkbox[0].options = 'applies';

        }
      }

      var editPack;

      if (check === 'edit_yn_checkbox') {

        editPack = {
          'id': vm.datapoint_item.id,
          'rid': vm.datapoint_item.rid,
          'index': 0,
          'type': 'item',
          'info': vm.datapoint_item.info,
          'text': vm.datapoint_item.name,
          'link': vm.datapoint_item.link,
          'token': token,
          'applies': vm.datapoint_item.checkbox[0].applies,
          'complies': vm.datapoint_item.checkbox[0].complies,
          'option': vm.datapoint_item.checkbox[0].options,
          'item_status': vm.datapoint_item.item_status,
          'alert': vm.datapoint_item.checkbox[0].alert,
          'sms_alert': vm.datapoint_item.checkbox[0].sms_alert,
          'sms_alert_number': vm.datapoint_item.checkbox[0].sms_alert_number
        };
      } else if (check === 'editFromToggle') {
        editPack = {
          'id': vm.datapoint_item.id,
          'rid': vm.datapoint_item.rid,
          'index': 0,
          'type': 'item',
          'info': vm.datapoint_item.info,
          'text': vm.datapoint_item.name,
          'link': vm.datapoint_item.link,
          'token': token,
          'applies': vm.datapoint_item.checkbox[0].applies,
          'complies': vm.datapoint_item.checkbox[0].complies,
          'option': vm.datapoint_item.checkbox[0].options,
          'item_status': vm.datapoint_item.item_status,
          'alert': vm.datapoint_item.checkbox[0].alert,
          'sms_alert': vm.datapoint_item.checkbox[0].sms_alert,
          'sms_alert_number': vm.datapoint_item.checkbox[0].sms_alert_number,
          'idCLI': item.id,
          'idCON': $rootScope.showingUsers[userKey].idCON,
          'which': which,
          'item_type': type
        };
      }

      if (check === 'edit_textbox') {



        editPack = {
          'id': vm.item.id,
          'rid': vm.item.rid,
          'index': 0,
          'type': 'item',
          'info': vm.Item_info,
          'text': vm.Item_name,
          'link': vm.item.link,
          'token': token,
          'attachment': vm.checklist.attachment
        };
      }

      api.checklists.edit(editPack).error(function (res) {
        $rootScope.message("Error Editing Item", 'warning');
      }).success(function (res) {
        if (res === void 0 || res === null || res === '') {
          $rootScope.message("Error Editing Item", 'warning');
        } else if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {
          // $rootScope.createStats('item', 'created', vm.item.id);
          // vm.item.info = vm.Item_info;

          // if (check) {
          //   vm.items.forEach(function (item, index) {
          //     if (item.id === vm.datapoint_item.id) {

          //       item = vm.datapoint_item;

          // vm.datapoint_item.checkbox = item.checkbox;

          if (check === 'edit_yn_checkbox' || check === 'editFromToggle') {

            if (vm.ChnagedItem) {
              vm.ChnagedItem.item_type = vm.datapoint_item.item_type;
              vm.ChnagedItem.item_status = vm.datapoint_item.item_status;
              vm.ChnagedItem.name = vm.datapoint_item.name;
              vm.ChnagedItem.info = vm.datapoint_item.info;
              vm.ChnagedItem.type = vm.datapoint_item.type;
              vm.ChnagedItem.checkbox[0].item_alert = vm.datapoint_item.checkbox[0].alert;
              vm.ChnagedItem.checkbox[0].sms_alert = vm.datapoint_item.checkbox[0].sms_alert;
              vm.ChnagedItem.checkbox[0].sms_alert_number = vm.datapoint_item.checkbox[0].sms_alert_number;
            }




            if (item) {
              if (item.checkbox === void 0) {
                item.checkbox = [];
              }


              item.checkbox[userKey] = res.checkboxes[0];

            }

            $scope.getChecklinked();
            vm.evaluateConflicts(vm.datapoint_item, +1);
            // vm.evaluateConflicts( vm.datapoint_item, +1);
            // $scope.getChecklinked();
            // index 
          } else if (check === 'edit_textbox') {
            vm.item.info = vm.Item_info;
            vm.item.name = vm.Item_name;
          }
          //else  if (check === 'edit_yn_checkbox' || check === 'editFromToggle') {
          // if (item.checkbox === void 0) {
          //   item.checkbox = [];
          // }
          // $scope.getChecklinked();
          // vm.isLoader = false;
          // 
          // item
          // ////
          // $rootScope.createStats('checkbox', which == 'applies' ? 'checked' : 'uncheckd', vm.item.id);
          //  item.checkbox[userKey] = res.checkboxes[0];
          //  vm.datapoint_item.checkbox[userKey] = res.checkboxes[0];
          //  vm.labels.create.save(res.checkboxes[0], 'checked');



          //  vm.evaluateConflicts( vm.datapoint_item, +1);
          //   }


          // vm.datapoint_item. = item.item_status;
          // vm.datapoint_item. = item.name;
          // vm.datapoint_item. = item.info;
          // vm.datapoint_item. = item.type;
          // vm.datapoint_item. = item.id;
          // vm.datapoint_item.alert = item.alert ;
          // vm.datapoint_item.sms_alert = item.sms_alert ;
          // vm.datapoint_item.number = item.number ;


          //     }
          //   })
          // }

          $rootScope.message('Item has been changed successfully', 'success');

          vm.item.sending = false;

          vm.closeDialog();
        }
        vm.isLoader = false;
      });
    }



    vm.saveDataPoint = function (val) {



      vm.closeDialog();

      if (vm.datapoint_item.label) delete vm.datapoint_item.label;
      if (vm.datapoint_item.title) delete vm.datapoint_item.title;

      if (vm.datapoint_item.item_type == 'Req' || vm.datapoint_item.item_type == 'No') vm.datapoint_item.option = "applies";
      else vm.datapoint_item.option = "complies";




      // vm.datapoint_item.data_points_check = "no";


      vm.datapoint_item.key = 'update';


      api.datapoint.datapoint(vm.datapoint_item).then(function (d) {
        if (d && d.data == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } else {
            $rootScope.message(d.data.message, 'error')
          }
        }
        else {

          vm.item.name = vm.datapoint_item.name;
          vm.item.info = vm.datapoint_item.info;

          $rootScope.message('Updated successfully', 'success');

        }
      });

      // dataType: 3
      // info: "reference"
      // item_alert: true
      // item_type: "yn"
      // name: "ee"
      // option: "applies"
      // order: 68
      // parentID: "1002"
      // type: "item"
    }

    function openConversationDialog(producerType, id, name, $event) {
      ////// //////;
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
          producerType: producerType,
          userName: '',
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
          console.log('emitting data', packet);
          //////
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
      ////// //////;
      vm.title = 'Download ' + chkName + ' To PDF';
      vm.chkNameForPDF = chkName;

      //  vm.showAllHeadersForPdf( vm.sections.headings);
      vm.sections.forEach(function (section) {

        vm.showAllHeadersForPdf(section.headings);

        // section.headings.forEach(function (heading) {
        //   
        //   vm.showAllHeadersForPdf(heading);
        // });



      });
      // vm.showAllHeadersForPdf



      // section.headings.forEach(function sectionLoop(heading) {
      //   if (sectionLoop.stop) { return; }
      //   heading.items.forEach(function headingLoop(item) {
      //     if (headingLoop.stop) { return; }

      //     item.checkbox[0].applies
      //     item.checkbox[0].complies
      //     
      //     if (item.checkbox[0].applies || item.checkbox[0].complies) {
      //       $rootScope.message('Section cannot be marked N/A with inputs on the Line Item(s)', 'error');
      //       vm.sectionCanBeNA = false;
      //       headingLoop.stop = true;
      //     }
      //   });
      //   if (!vm.sectionCanBeNA) {
      //     sectionLoop.stop = true;
      //   }

      // });

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-dialog-pdf.html',
        parent: angular.element($document.find('#todo')),
        targetEvent: ev,
        clickOutsideToClose: false,
        locals: {
          idCHK: idCHK,
          chkName: chkName
        }
      });



    }

    vm.pdfDownloadDone = function () {
      var pdfName = vm.chkNameForPDF + '.pdf';

      kendo.drawing.drawDOM($("#pdfContent")).then(function (group) {

        return kendo.drawing.exportPDF(group, {
          paperSize: "auto",
          margin: { left: "1cm", top: "1cm", right: "1cm", bottom: "1cm" }
        })

      }).done(function (data) {
        // Save the PDF file
        kendo.saveAs({
          dataURI: data,
          fileName: pdfName

        });
      });

      vm.closeDialog();

    }


    function downloadXML(ev, idCHK, chkName) {

      $window.location.href = ('http://wdc1.acapqa.net:8081/dist/ajax/archive.php?idCHK=' + idCHK);
    }


    function downloadAttachment(ev, location) {
      // $window.location.href = (location);
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
                // vm.headings.push(res.headings[i]);
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
      // vm.showallheaders =  false;
      vm.isHeader = false;

      var id_parent = heading.id;
      var i;
      var x;

      console.log('heading', heading);
      console.log('id_parent', id_parent);

      if (!heading.items && !heading.items.length && id_parent) {

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

      if (!heading.items && !heading.items.length && id_parent) {

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
      vm.isDelete = false;
      vm.wizard.newFolder = false;
      vm.wizard.newGroup = false;
      vm.wizard.newChecklist = false;
      vm.wizard.switch = false;
      vm.upload = false;
      vm.editAttachment = false;
      $mdDialog.hide();
    }



    // Content sub menu
    vm.submenu = [
      { link: 'folders', title: 'Projects', active: false },
      { link: 'groups', title: 'Workflow', active: false },
      { link: 'checklist', title: 'Checklists', active: true },
      { link: 'templates', title: 'Templates', active: false },
      { link: 'other', title: 'Other', active: false },
      { link: 'archives', title: 'Archives', active: false }

    ];

    $scope.IsAttachment = true;
    vm.deleteFileConfirm = deleteFileConfirm;
    vm.deleteCancel = deleteCancel;
    vm.deleteToAsk = deleteToAsk;

    function deleteToAsk(attachment) {
      vm.isDelete = true;
      vm.deleteItem = attachment;
    }

    function deleteFileConfirm(attachment) {
      $scope.deleteAttachment(attachment);
      vm.isDelete = false;
      vm.spinner = true;

    }
    function deleteCancel() {
      vm.isDelete = false;
    }

    $scope.deleteAttachment = function (attachment) {


      $http.post(BASEURL + "destroy_attachment.php", { 'id': attachment.id, 'idCON': $rootScope.user.idCON })
        .success(function (res) {
          vm.spinner = false;
          if (res.type == 'success') {
            vm.SelectedAttachments.splice(vm.SelectedAttachments.indexOf(attachment), 1);
            getAttachments();;
            vm.upload = false;
            //////
            organizeData();
            $rootScope.message(res.message, 'success');


          } else {
            return $rootScope.message(res.message, 'warning');
          }

        }).error(function (err) {
          console.log('Error found password');
        })
    };

    $scope.editAttachment = function (attachment, index) {
      vm.isDelete = false;
      vm.editAttachment = true;
      vm.label = attachment.file.label;
      vm.filename = attachment.file.name;
      vm.upload = true;
      vm.attachment = attachment;
      vm.attachment.index = index;
    };

    $scope.UpdateAttachment = function (attachment) {

      $http.post(BASEURL + "edit_attachment.php", { 'idCON': $rootScope.user.idCON, 'id': attachment.id, 'label': vm.label })
        .success(function (res) {

          if (res.type == 'success') {
            vm.loading.attachments;
            vm.editAttachment = false;
            vm.SelectedAttachments.indexOf(attachment.index);
            vm.SelectedAttachments[attachment.index].file.label = res.item.data.file_label;
            vm.SelectedAttachments[attachment.index].storage.temporary = res.item.data.temporary_storage_url;
            vm.editAttachment = false;
            vm.upload = false;
            //   vm.loadChecklist($stateParams.id);
            // $mdDialog.hide();
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
    vm.coypDialog = coypDialog;

    function cutDialog(type, id, parent_id) {
      $scope.cutObj = { type: type, id: id, parent_destination_id: parent_id, action_type: 'cut' };
      localStorage.setItem('cutObj', JSON.stringify($scope.cutObj));
    };

    function coypDialog(type, id, parent_id) {

      $scope.cutObj = { type: type, id: id, parent_destination_id: parent_id, action_type: 'copy' };

      localStorage.setItem('cutObj', JSON.stringify($scope.cutObj));
    };


    if ($rootScope.id_CHK) {
      if ($stateParams.id && $stateParams.id == $rootScope.id_CHK) {
        vm.isCuted = true;
      }
    };


    function pasteDialog(item_type, item_id, parent_origin_id) {
      $scope.cutObj = JSON.parse(localStorage.getItem('cutObj'));
      switch (item_type) {
        case 'section':
          break;
        case 'heading':
          break;
        case 'item':
          $scope.parent_destination_id = $scope.cutObj.parent_destination_id
          break;
      }

      if (parent_origin_id == $scope.cutObj.parent_destination_id) {
        $rootScope.alertMessage('You can not paste ' + item_type + ' in the same location');
      }
      else if ($scope.cutObj.type !== item_type) {
        $rootScope.alertMessage('You paste item should be ' + item_type);
      }
      else {
        pateItem($scope.cutObj.parent_destination_id, item_id, $scope.cutObj.type, $scope.cutObj.action_type, $scope.cutObj.id);
      }
    };

    function pateItem(origin, destination, type, action_type, move_item_id) {
      api.item.paste(origin, destination, type, action_type, move_item_id).error(function (res) {
        return $rootScope.message("Error creating on paste item", 'warning');
      }).success(function (res) {
        $rootScope.alertMessage('Pasted successfully');
        if ($scope.cutObj.type == 'checklist') {
          getChecklistGroup()
        } else {
          loadChecklist($stateParams.id);
        }
      });

    };

    function undoDialog(id, type) {
      var type = '';
      api.item.undo(id).error(function (res) {
        return $rootScope.message("Error creating on undo item", 'warning');
      }).success(function (res) {
        $rootScope.alertMessage('Undo successfully');
        if (type == 'checklist') {
          getChecklistGroup()
        } else {
          loadChecklist($stateParams.id);

        }

      });
    };



    $rootScope.alertMessage = function (message) {
      var confirm = $mdDialog.confirm()
        .title(message)
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
    // create stats
    //vm.createStats = createStats;

    // function createStats(type, title, id){
    //    api.userstats.create(type, title, id, $cookies.get('useridCON')).success(function (res) {
    //     if (res) {
    //       vm.attachments = vm.attachments.concat(res.attachments);
    //     }

    //   });
    // };
    vm.FileName = {}
    vm.downloadFile = [];
    vm.removeFileHttp = removeFileHttp;
    function removeFileHttp(file, index) {

      var originalFile = file.replace(DOMAIN_NAME, '');
      vm.downloadFile[index] = originalFile;
      var re = /(?:\.([^.]+))?$/;
      var FileExt = re.exec(vm.downloadFile[index])[1];
      // $scope.FileName = []; 
      // // $scope.FileName[index]='MyFile.'+ FileExt ;
      // $scope.FileName.push('MyFile.'+ FileExt) ;

      // vm.downloadBaseURL = BASEURL + 'download.php?file=';


      vm.FileName[index] = 'MyFile.' + FileExt;
      // vm.FileName

      // //////
    }

    vm.downloadFleNow = function (url) {


      document.getElementById('my_iframe').src = url;

      //////
    }




    // vm.toggle('section',section); vm.fetchHeadingBlock(section, checklist.id)

    //vm.toggle('heading', heading); vm.fetchItemBlock(heading, checklist.id)

    function showAllHeaders(heading) {
      vm.toggle('section', heading);
      heading.forEach(function (heading_item) {
        vm.isHeader = vm.isExpanded('heading', heading_item);
        // alert( vm.isHeader);
        if (toggle('heading', heading_item)) {

        }

      });
      // vm.isExpanded('heading', headings);
      //vm.showallheaders = true;
    }

    vm.showAllHeadersForPdf = function (heading) {

      vm.toggleForPdf('section', heading);

      heading.forEach(function (heading_item) {
        vm.isHeader = vm.isExpandedForPdf('heading', heading_item);
        // alert( vm.isHeader);
        if (vm.toggleForPdf('heading', heading_item)) {

        }

      });
      // vm.isExpanded('heading', headings);
      //vm.showallheaders = true;
    }



    // //Subscription expired alert
    // $scope.subscriptionAlert = function (message) {
    //   vm.title = 'Alert';
    //   vm.message = message;
    //   $mdDialog.show({
    //     scope: $scope,
    //     preserveScope: true,
    //     templateUrl: 'app/main/teammembers/dialogs/subscription-alert.html',
    //     clickOutsideToClose: false
    //   });
    // }



    vm.uncheckLabel = uncheckLabel;
    function uncheckLabel(val) {
      alert(val);
      vm.newItem.dataTypes = false;

    }

    function getChecklistGroup() {
      vm.checklistFromGroup = true;
      vm.checklists = [];
      api.checklists.getGroup($stateParams.id, token).then(function (d) {

        if (d.data && d.data.code == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } else {
            // $scope.subscriptionAlert(d.data.message);
            $rootScope.message(d.data.message, 'error')
          }
          vm.showLoadingImage = false;
        } else {

          vm.checklists = d.data.checklists;

          vm.showLoadingImage = false;
        }

      });
    };

    function selectWorkflowById(id) {
      vm.folders = [];
      ftchFolder(id);
    }

    function checklistPasteDialog(type, id, parent_id) {

      ftchFolder('');
      vm.title = 'Paste Checklist in Workflow';
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-paste-dialog.html',
        parent: angular.element($document.find('#checklist')),
        clickOutsideToClose: true
      });
    }

    setTimeout(function () {
      $('.Process').addClass('opacity1');
    }, 800);


    function saveScheduler() {

      vm.Alreadyclicked = true;

      vm.newScheduler.item_type = 'checklist';
      vm.newScheduler.item_type_id = vm.idCHK;
      vm.newScheduler.checklist_name = vm.checklists[0].name;
      vm.newScheduler.workflow_name = vm.checklists[0].item_bread.folder_name;
      vm.newScheduler.project_name = vm.checklists[0].item_bread.project_name;
      vm.newScheduler.id = vm.single_item ? vm.single_item.id : '';

      vm.newScheduler.type = vm.single_item ? 'update' : 'save';

      console.log('vm.newScheduler save', vm.newScheduler)

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message(vm.single_item ? "Schedule updated successfully" : "New checklist schedule created successfully", 'success');
          $mdDialog.hide();
        }

        vm.Alreadyclicked = false;
      });

    };

    function getSchedulerByChek() {
      vm.newScheduler = {};
      vm.newScheduler.type = 'get';
      vm.newScheduler.item_type_id = vm.idCHK;
      vm.newScheduler.item_type = 'checklist';

      console.log('vm.newScheduler get single', vm.newScheduler)

      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          console.log('dddd', d)
          vm.single_item = d.data.data.item;
          //////

          console.log('vm.item getSchedulerByChek', vm.single_item)
          if (vm.single_item) {
            //////
            vm.newScheduler.from_date = new Date(vm.single_item.from_date);
            vm.newScheduler.to_date = new Date(vm.single_item.to_date);
            vm.newScheduler.gantt_row = vm.single_item.gantt_chat;
            vm.newScheduler.color = vm.single_item.color;
            vm.newScheduler.all_day = vm.single_item.all_day == 1 ? true : false;
            vm.newScheduler.repeat = vm.single_item.repeat;
            vm.newScheduler.start_time = new Date(vm.single_item.start_time);
            vm.newScheduler.end_time = new Date(vm.single_item.end_time);
            vm.newScheduler.end = vm.single_item.end;
            vm.newScheduler.id = vm.single_item.id;
          } else {

            vm.newScheduler.color = '#ffffff';
          }

        }
      })
    };

    getSchedulerByChek();

    function addschedule(ev) {
      getSchedulerByChek();

      vm.type.title = "Scheduler";

      $mdDialog.show({
        controller: function DialogController($scope, $mdDialog) {
          $scope.closeDialog = function () {
            $mdDialog.hide();
          }
        },
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-add-dialog-scheduler.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true
      });
    };

    function deleteScheduler(id) {
      vm.newScheduler = {};
      vm.newScheduler.type = 'delete';
      vm.newScheduler.item_id = id;
      vm.closeDialog();
      api.checklists.NewScheduler(vm.newScheduler).then(function (d) {
        if (d.data.type == 'success') {
          $rootScope.message("Schedule deleted successfully", 'success');

        }

      });

      console.log('newScheduler delete', vm.newScheduler)
    }

    function GetAllGanttRows() {
      console.log('GetAllRows');



      api.checklists.NewScheduler({ type: "getRow" }).then(function (res) {
        console.log('get rows res', res)
        //////
        if (res.data.type == 'success') {
          vm.AllGanttRows = res.data.data;

        }


      })

    }

    GetAllGanttRows();


    // all_spreadsheets code starts

    //vm.getAllSpreadsheets = getAllSpreadsheets;
    vm.view_data_upload = view_data_upload;

    function view_data_upload(ev) {

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-view-upload-data-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: false
      });


    }

    vm.excels = {
      view: function (excel) {

        if (vm.origColspanLength == undefined || vm.origColspanLength < excel.data.heading.length) {
          vm.origColspanLength = excel.data.heading.length;
          if (vm.colspanLength < 4) vm.colspanLength = 2;
          else vm.colspanLength = vm.origColspanLength - 1;
        }
        vm.excel_open_id = excel.id;

      }
    }



    // function getAllSpreadsheets() {
    //   api.organization.get_all_spreadsheets().then(function (d) {
    //     vm.isLoader = false;
    //     if (d.data.code == '-1') {
    //       if (d.data.message == 'unauthorized access') {
    //         $state.go('app.logout');
    //       } else {
    //       }
    //     } else {
    //       vm.all_spreadsheets = d.data.spreadsheets;

    //     }
    //   });
    // };
    // getAllSpreadsheets();

    function checklistAlert(item) {
      api.alert.save(item).then(function (d) {
        if (d.data.code != '-1') {
          console.log('new alert created');

          api.notifications.count_notifi();
        }


      });

    }

    /*********** */

    /**Data Table Function  Code Start Here ** */

    vm.col_data_update_str = [];
    vm.field = [];

    /*****Array check */
    $scope.checkEquality = function (param1, param2) {
      if (param2.length == 0) {
        return false;
      }
      // // //////;
      return angular.equals(param1, param2)
    }

    /**End Here */

    /*****Value Intialize********/

    vm.convertDate = function (value, heading, current_index) {
      // // //////;
      if (value != '' && value != null) {
        var newDate = new Date(value)
        vm.field['datatable_' + heading.id_parent + '_' + heading.id][current_index] = newDate;
      }


    };


    vm.finished = function (column, index, tbl_str, heading) {
      //// // //////;
      var $index = index;
      var $row_detail = [];
      var $row_arr = [];
      var $head_arr = [];
      var $head_arr_header = [];
      var $start = $index - column;
      var $start_index = $start;
      for (var i = 0; i < column; i++) {
        $row_arr.push($start);
        if (tbl_str[$start].type == 'Label' && tbl_str[$start].value != null) {

          var key = $start;
          var obj = {};
          obj[key] = tbl_str[$start].value;

          $head_arr.push(obj);
          $head_arr_header.push(tbl_str[$start].value);
          // // //////;
        }

        $start++;

      }

      $row_detail['row_arr'] = $row_arr;
      $row_detail['head_arr'] = $head_arr;
      $row_detail['head_arr_header'] = $head_arr_header;



      //// // //////;
      return $row_detail;


    };







    $scope.init = function (index, table_str, heading) {
      // ////
      var section_id = heading.id_parent;
      var heading_id = heading.id;

      var new_field = "datatable_" + section_id + "_" + heading_id;
      var col_data_update = {};


      if (!vm.field[new_field]) {
        vm.field[new_field] = [];
      }
      if (!vm.col_data_update_str[new_field]) {
        vm.col_data_update_str[new_field] = [];
      }
      // SadaNand

      if (table_str.cell_value != undefined) {
        vm.field[new_field][index] = table_str.cell_value;

      }
      else {
        // vm.field.push('');
        vm.field[new_field].push('');
      }


      vm.col_data_update_str[new_field][table_str.cell_no] = table_str; // may need to fixed this as well
      //// //////;

    };



    $scope.autoTrimWord = function (index, table_str) {
      var length = table_str[index].value;
      //var text_len = vm.field[index].length;
      //// //////;
    };

    $scope.autoFixedPoint = function (index, table_str) {

    };




    $scope.isNumberKey = function (evt, index, precision, heading, cell_type) {
      //// //////;

      var cell_type = cell_type != undefined ? cell_type : '';
      if (cell_type != '') {
        precision = 2;
      }


      var section_id = heading.id_parent;
      var heading_id = heading.id;

      var new_field = "datatable_" + section_id + "_" + heading_id;


      var precision = precision != '' ? parseInt(precision) : 0;

      var charCode = (evt.which) ? evt.which : evt.keyCode
      var value = vm.field[new_field][index];

      console.log('type of', typeof (value));

      if (typeof (value) == 'number') value = value.toString();

      // //////;
      var dotcontains = value.indexOf(".") != -1;
      if (precision > 0) {
        if (dotcontains)
          if (charCode == 46) evt.preventDefault();
        if (charCode == 46) return true;
      }
      else {
        if (charCode == 46) evt.preventDefault();;
      }

      if (dotcontains) {
        var index_pos = value.indexOf('.');

        var precision_chk = value.length - index_pos;
        if (precision_chk > precision) {
          evt.preventDefault();
        }

      }

      if (charCode > 31 && (charCode < 48 || charCode > 57))
        evt.preventDefault();
      return true;
    };




    $scope.autoCalculate = function (index, table_str, heading) {
      //
      var section_id = heading.id_parent;
      var heading_id = heading.id;

      var new_field = "datatable_" + section_id + "_" + heading_id;

      vm.field
      vm.col_data_update_str



      if (table_str[index].type == 'Number' && table_str[index].is_percentage == 1) {
        var index_value = vm.field[new_field][index];

      }


      vm.result = $filter('filter')(table_str, { 'type': 'Formula' });


      var chkCell = table_str[index].cell_no;
      var reLen = vm.result.length;

      for (var i = 0; i < reLen; i++) {
        vm.value_status = true;
        vm.myString = '';
        var value = vm.result[i].value;
        var index = vm.result[i].index; // vm.field 11
        // if( value.indexOf(chkCell) >= 0){ // A3

        // var cell_index = vm.col_data_update_str[chkCell].index;
        // var cell_current_value =  vm.field[cell_index];
        var split_val = value.split('=');
        if (split_val[1] == undefined) {
          return;
        }

        var yourstring = split_val[1];

        vm.myString = yourstring;
        vm.myString = vm.myString.toUpperCase();

        var pattrnList = ['SUM', 'AVG'];
        var patValChk = '';

        if (vm.myString != '' && vm.myString != undefined) {

          for (var l = 0; l < pattrnList.length; l++) {
            var patVal = pattrnList[l];
            if (vm.myString.indexOf(patVal) != -1) {
              patValChk = patVal;
              break;
            }

          }

          var pattType = false;
          if (patValChk != '') {

            vm.myString = vm.myString.replace(patValChk, '');

            var total_element;

            if (vm.myString.indexOf(',') != -1) {
              vm.myString = vm.myString.replace(',', '+');
              total_element = vm.myString.split(',').length;
              // 
            }
            else if (vm.myString.indexOf(':') != -1) {
              var arr_cell_range = [];

              var arr_cell_exist = [];
              var arr_cell_remove = [];
              var row = heading.datatable[0].row;

              // 
              var table_column = heading.datatable[0].column;
              var spl = vm.myString.replace('(', '');
              spl = spl.replace(')', '');
              spl = spl.trim();
              var spl = spl.split(':');


              var max_charName = String.fromCharCode(65 + table_column - 1); // D
              var firstval = spl[0];
              var lastval = spl[1];


              var startIndex = parseInt(firstval.replace(/[^0-9\.]/g, ''), 10);
              var lastIndex = parseInt(lastval.replace(/[^0-9\.]/g, ''), 10);


              /***Auto Checked Start Here */
              // 

              arr_cell_exist.push(firstval.replace(startIndex, ''));
              arr_cell_exist.push(lastval.replace(lastIndex, ''));


              var arr_cell_exist = Array.from(new Set(arr_cell_exist));

              for (var x = 0; x < table_column; x++) {
                var cellName = String.fromCharCode(65 + x);

                if (arr_cell_exist.indexOf(cellName) == -1 && (cellName < arr_cell_exist[0] || cellName > arr_cell_exist[1])) {
                  arr_cell_remove.push(cellName)
                }

              }

              for (var p = 0; p < row; p++) {


                for (var k = 1; k <= table_column; k++) {
                  var a = String.fromCharCode(65 + k - 1);

                  if (arr_cell_remove.indexOf(a) != -1) {
                    continue;
                  }

                  console.log(a + (p + 1));
                  arr_cell_range.push(a + (p + 1))

                }

              }



              var startPos = arr_cell_range.indexOf(firstval);
              var endPos = arr_cell_range.indexOf(lastval);

              var arr_cell_range = arr_cell_range.slice(startPos, endPos + 1);
              // 

              /******* */


              var replaceStrPtrn = firstval + ":" + lastval
              var newMyString = '';
              var k = 1;
              for (var p = 0; p < arr_cell_range.length; p++) {
                if (k == 1) {
                  newMyString = arr_cell_range[p];
                }
                else {
                  newMyString += "+" + arr_cell_range[p];
                }

                // 
                total_element = k;
                k++;


              }

              vm.myString = vm.myString.replace(replaceStrPtrn, newMyString);

              pattType = true;

              //
            }


          }
        }
        else {
          return;
        }
        //  

        /***///
        vm.myString = vm.myString.trim();
        vm.spl_arr = vm.myString.split(/[*,/,+,-]+/);

        var replace_chr = ['(', ')'];
        var chr_len = replace_chr.length;
        for (var k = 0; k < chr_len; k++) {

          vm.spl_arr = vm.spl_arr.map(function (item, index) {
            return item.replace(replace_chr[k].trim(), '')
          })

        }


        var spl_arr_len = vm.spl_arr.length;


        for (var j = 0; j < spl_arr_len; j++) {

          if (!vm.col_data_update_str[new_field].hasOwnProperty(vm.spl_arr[j].trim())) {
            continue;
          }
          var cell_index = vm.col_data_update_str[new_field][vm.spl_arr[j].trim()].index;



          var cell_current_value = parseFloat(vm.field[new_field][cell_index]);

          if (isNaN(cell_current_value) && pattType == true) {
            if (vm.field[new_field][cell_index] == '' || (vm.field[new_field][cell_index] != '' && typeof cell_current_value === 'string')) {
              vm.myString = vm.myString.replace(vm.spl_arr[j].trim(), '0');
            }
            else {
              vm.myString = vm.myString.replace(vm.spl_arr[j].trim(), '');
            }

            vm.myString = vm.myString.replace("++", '+');
            console.log('not a number');

          }
          if (cell_current_value == '' || typeof cell_current_value === 'string') {

            vm.value_status = false;
          }
          if (table_str[cell_index].type == 'Number' && table_str[cell_index].is_percentage == 1) {
            // 
            if (cell_current_value == 0 || cell_current_value == '' || cell_current_value == undefined || isNaN(cell_current_value)) {
              cell_current_value = 0;
            }
            else {

              cell_current_value = cell_current_value / 100;


            }


            // 
          }
          vm.myString = vm.myString.replace(vm.spl_arr[j].trim(), cell_current_value);
          vm.value_status = true;
        }


        /**** */
        if (vm.value_status) {
          vm.myString;
          //

          if (patValChk == 'AVG') {
            if (total_element != undefined) {
              vm.myString = vm.myString + "/" + total_element;

            }

          }

          var formula_value = eval(vm.myString).toFixed(2);
          if (!isNaN(formula_value)) {
            vm.field[new_field][index] = eval(vm.myString).toFixed(2);
          }
          else {
            vm.field[new_field][index] = '';
          }


        }
        vm.myString;


      }


      // // 
    };


    function createDataTableSegment(what, name, to, type, info, item_type, alert, columns, rows, ev, table_id, table_str_data, heading) {


      /******************* */
      vm.table_id = table_id != undefined ? table_id : '';
      vm.editDataTable = [];
      vm.editHeadingTable = [];
      var heading_data = heading != undefined ? heading : '';
      if (heading_data != '' || heading_data != undefined) {
        vm.editHeadingTable = heading_data;
        var etSectionId = heading_data.parent_id;
        var etHeadingId = heading_data.id;
        var new_field = 'edit_' + etSectionId + '_' + etHeadingId;
        vm.new_field = 'edit_' + etSectionId + '_' + etHeadingId;
        vm.editDataTable[new_field] = [];

        vm.editDataTable[new_field]['table_str_data'] = table_str_data != undefined ? table_str_data : '';

      }


      /******** */
      vm.newDataTableItem = {
        type: what,
        to: to,
        name: name,
        column: columns,
        row: rows,
        submitting: false
      };

      /***************** */

      console.log(what, name, to, type, info, item_type, alert, columns, rows, 'ev', table_id, table_str_data, heading)

      vm.section_id = to;
      vm.dataTableName = name;
      vm.data_table_structure = [];

      $scope.cell_format = dataTable.getValue('cell_format');
      // [{ "name": "None" }, { "name": "Date" }, { "name": "Label" }, { "name": "Text" }, { "name": "Number" }, { "name": "Currency" }, { "name": "Formula" }]


      vm.model = $scope.cell_format[0].name;
      //// //////;


      $scope.decimal = dataTable.getValue('decimal');



      // //////;
      // $scope.decimal = [
      //   { "value": 0 }, { "value": 1 }, { "value": 2 }

      // ]

      $rootScope.DataTableFields.number_type = $scope.decimal[0].value;

      $scope.currency = dataTable.getValue('currency');

      $scope.datapoint_functions = dataTable.getValue('datapoint_functions');


      // $scope.currency = [ { "name": "$", "sign ": "Dollars" }, { "name": "€", "sign ": "Euros" }, { "name": "£", "sign ": "Pounds" }, { "name": "￥", "sign ": "Yen/Yuan" }];


      $rootScope.DataTableFields.currency_type = $scope.currency[0].name;


      $scope.alignTextVal = dataTable.getValue('alignTextVal');

      // [{ "name": "center" }, { "name": "left" }, { "name": "right" }]

      vm.alignTextStatus = $scope.alignTextVal[0].name;

      $scope.TextPostition = dataTable.getValue('TextPostition');
      // [ { "name": "bottom", "pos": "fa-long-arrow-down" }, { "name": "middle", "pos": "fa-arrows-v" }, { "name": "top", "pos": "fa-long-arrow-up" }]

      vm.TextPostitionStatus = $scope.TextPostition[0].name;




      // $scope.decimal = [
      //   { "value": 0 }, { "value": 1 }, { "value": 2 }

      // ]

      $rootScope.DataTableFields.number_type = $scope.decimal[0].value;

      vm.formats = $scope.cell_format

      var data_table_row = rows;
      var data_table_col = columns;

      dataTable.toExcelHeader(data_table_col)

      vm.header_names = dataTable.toExcelHeaderArray(data_table_col + 1)
      vm.header_names.shift()
      //////;

      $scope.rows = [];
      $scope.columns = [];
      for (var i = 0; i < data_table_row; i++) {
        $scope.rows.push(String.fromCharCode(65 + i));
      }


      var col_data = {};

      for (var j = 0; j < data_table_col; j++) {
        $scope.columns.push(j + 1)
      }

      vm.rows = $scope.rows.length;
      vm.columns = $scope.columns.length;



      vm.rowIndex = [];
      vm.myrecords = [];
      var col_data_update = {};

      /**  Based on table id and table structure update vm.table_id,vm.table_str_data  data table variable    */

      $scope.init = function (row, key, column, index, current_index, heading) {
        col_data_update = {};
        vm.table_id;
        // var etSectionId = heading_data.parent_id;
        //     var etHeadingId = heading_data.id;
        //     var new_field = 'edit_'+etSectionId+'_'+etHeadingId;

        if (vm.editDataTable[vm.new_field]['table_str_data'] != '') {
          var tbd = vm.editDataTable[new_field]['table_str_data'][current_index];
          if (tbd == undefined) {
            return;
            // // //////;
          }

          var new_val = tbd.value;

          col_data_update[row + column] = '';
          vm.myrecords.push(col_data_update);
          //// // //////;


          // $rootScope.DataTableFields.cell_stucture = { 'index': parseInt(tbd.index), 'cell_no': tbd.row_no + parseInt(tbd.col_no), 'type': tbd.type, 'row': tbd.row_no, 'column': parseInt(tbd.col_no), 'value': tbd.value, 'text_align': tbd.text_align, 'text_position': tbd.text_position }

          $rootScope.DataTableFields.cell_stucture = { 'index': parseInt(tbd.index), 'cell_no': tbd.col_no + parseInt(tbd.row_no), 'type': tbd.type, 'row': tbd.col_no, 'column': parseInt(tbd.row_no), 'value': tbd.value, 'text_align': tbd.text_align, 'text_position': tbd.text_position }

          if (tbd.type == 'Number') {
            if (tbd.is_percentage == 1) {
              $rootScope.DataTableFields.cell_stucture['percentage'] = true;
            }
            else {
              $rootScope.DataTableFields.cell_stucture['percentage'] = false;
            }
          }
          var tbd_value = tbd.value;

          if (tbd.value != 'n-def') {
            if (tbd.type != 'Label') {

              tbd_value = '';
              // // //////;
            }

            vm.myrecords[current_index][row + column] = tbd_value;


          }

          //// // //////;
          //vm.myrecords.push(col_data_update);
          vm.data_table_structure[current_index] = $rootScope.DataTableFields.cell_stucture;

        }
        else {
          col_data_update[row + column] = '';
          vm.myrecords.push(col_data_update)

          vm.data_table_structure.push({})
        }



      };

      $scope.initRow = function (key_row) {
        vm.rowIndex.push(key_row + 1)

      };


      $rootScope.DataTableFields = {
        lable_show: false,
        formula_show: false,
        currency_show: false,
        number_show: false,
        percentage: false,
        textShow: false,
        data_point_show: false
      }
      // vm. = false;
      // vm. = false;


      // vm. = false;
      // vm. = false;

      // vm. = false;

      // vm. = false;

      /*****New Updated **********/
      vm.selectedRow = undefined;
      vm.selectedColumn = undefined;
      vm.selectedIndex = undefined;


      vm.selectedHeaderName = undefined;
      vm.selectedHeaderIndex = undefined;
      /*****End New Updated **********/




      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/data-table-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: true,
        autoWrap: false
      });


    };

    /*** Start Data Table Function */

    // vm.toExcelHeaderArray = toExcelHeaderArray;

    // function toExcelHeaderArray(rows) {
    //   return  dataTable.toExcelHeaderArray(rows);
    // }
    // //////
    // vm.toExcelHeaderArray = function (rows) {
    //   var excelHeaderArr = [];
    //   for (var index = 1; index <= rows; index++) {
    //     excelHeaderArr.push(vm.toExcelHeader(index));
    //   }

    //   return excelHeaderArr;
    // }

    // vm.toExcelHeader = function (index) {
    //   if (index <= 0) {
    //     alert("row must be 1 or greater");
    //   }
    //   index--;
    //   var charCodeOfA = ("a").charCodeAt(0); // you could hard code to 97
    //   var charCodeOfZ = ("z").charCodeAt(0); // you could hard code to 122
    //   var excelStr = "";
    //   var base24Str = (index).toString(charCodeOfZ - charCodeOfA + 1);
    //   for (var base24StrIndex = 0; base24StrIndex < base24Str.length; base24StrIndex++) {
    //     var base24Char = base24Str[base24StrIndex];
    //     var alphabetIndex = (base24Char * 1 == base24Char) ? base24Char : (base24Char.charCodeAt(0) - charCodeOfA + 10);
    //     // bizarre thing, A==1 in first digit, A==0 in other digits
    //     if (base24StrIndex == 0) {
    //       alphabetIndex -= 1;
    //     }
    //     excelStr += String.fromCharCode(charCodeOfA * 1 + alphabetIndex * 1);
    //   }
    //   return excelStr.toUpperCase();
    // }



    /***** New Updated **********/

    vm.select = function (row, column, index, header_name, header_index) {


      vm.label_name = ''


      $rootScope.DataTableFields = {
        lable_show: false,
        formula_show: false,
        currency_show: false,
        text_show: false,
        number_show: false,
        percentage: false,
        textShow: false,
        cellSelected: false,
        data_point_show: false
      }




      vm.model = $scope.cell_format[0].name;

      if (vm.selectedRow === row && vm.selectedColumn === column) {
        vm.selectedRow = undefined;
        vm.selectedColumn = undefined;
        vm.selectedIndex = undefined;


        vm.selectedHeaderName = undefined;
        vm.selectedHeaderIndex = undefined;


      } else {
        vm.selectedRow = row;
        vm.selectedColumn = column;

        vm.selectedHeaderName = header_name;
        vm.selectedHeaderIndex = header_index;


        vm.selectedIndex = index;
        $rootScope.DataTableFields.cellSelected = true;



        vm.data_table_structure
        if (vm.data_table_structure[index] == undefined) {
          // 
        }
        var getfcell_no = vm.data_table_structure[index].cell_no;
        //// 
        if (getfcell_no != undefined && getfcell_no == vm.selectedHeaderName + vm.selectedHeaderIndex) {
          //// 
          var getformat_type = vm.data_table_structure[index].type


          var text_align = vm.data_table_structure[index].text_align
          var text_position = vm.data_table_structure[index].text_position

          var cell_structure = vm.data_table_structure[index];
          var cell_value = cell_structure.value
          vm.model = getformat_type
          $rootScope.DataTableFields.selected_value = vm.model;
          //// 
          $rootScope.DataTableFields.textShow = true;
          vm.alignTextStatus = text_align;
          vm.TextPostitionStatus = text_position;
          // 
          switch (getformat_type) {
            case 'None':
            case 'n-def':

              vm.model = $scope.cell_format[0].name;
              vm.alignTextStatus = $scope.alignTextVal[0].name;
              vm.TextPostitionStatus = $scope.TextPostition[0].name;
              break;
            case 'Date':
              break;
            case 'Label':
              $rootScope.DataTableFields.lable_show = true;
              $rootScope.DataTableFields.label_name = cell_value;

              break;
            case 'Number':
              $rootScope.DataTableFields.number_show = true;
              $rootScope.DataTableFields.number_type = cell_value;

              $rootScope.DataTableFields.percentage = cell_structure.percentage;

              break;
            case 'Formula':
              $rootScope.DataTableFields.formula_show = true;
              $rootScope.DataTableFields.formula = cell_value;
              break;
            case 'Currency':
              $rootScope.DataTableFields.currency_show = true;
              $rootScope.DataTableFields.currency_type = cell_value;
              break;
            case 'Text':
              $rootScope.DataTableFields.text_show = true;
              $rootScope.DataTableFields.text = parseInt(cell_value);
              break;
            case 'Data Point':
              $rootScope.DataTableFields.data_point_show = true;
              $rootScope.DataTableFields.data_point_function = cell_value;
              break;


            default:
              break;
          }
        }
        // //// 
      }



    };




    // vm.getdetails = function(){
    //   console.log('here get details');
    //   dataTable.getdetails(vm.model );
    // }



    // function () {

    //   $rootScope.DataTableFields = {
    //     lable_show : false,
    //     formula_show : false,
    //     currency_show : false,
    //     textShow : true,
    //     text_show : false,
    //     number_show : false,
    //   }
    //   // vm.lable_show = false;
    //   // vm.formula_show = false;
    //   // vm.currency_show = false;

    //   // vm.textShow = true;
    //   // vm.text_show = false;

    //   // vm.number_show = false;

    //   vm.selected_value = vm.model;



    //   if (vm.selected_value == 'None') {
    //     $rootScope.DataTableFields.textShow = false;
    //   }
    //   else if (vm.selected_value == 'Date') {

    //   }

    //   else if (vm.selected_value == 'Formula') {
    //     $rootScope.DataTableFields.formula_show = true;
    //   }

    //   else if (vm.selected_value == 'Currency') {
    //     $rootScope.DataTableFields.currency_show = true;
    //     $rootScope.DataTableFields.number_show = false;
    //   }

    //   else if (vm.selected_value == 'Text') {
    //     $rootScope.DataTableFields.text_show = true;
    //   }

    //   else if (vm.selected_value == 'Number') {
    //     $rootScope.DataTableFields.currency_show = false;
    //     $rootScope.DataTableFields.number_show = true;
    //   }

    //   else if (vm.selected_value == 'Label') {
    //     $rootScope.DataTableFields.lable_show = true;
    //   }

    //   $rootScope.DataTableFields.cellSelected = true;


    // }





    // vm.getdetails = function () {
    //   vm.lable_show = false;
    //   vm.formula_show = false;
    //   vm.currency_show = false;
    //   vm.selected_value = vm.model;
    //   vm.textShow = true;
    //   vm.text_show = false;

    //   vm.number_show = false;



    //   if (vm.selected_value == 'None') {
    //     vm.textShow = false;
    //   }
    //   else if (vm.selected_value == 'Date') {

    //   }

    //   else if (vm.selected_value == 'Formula') {
    //     vm.formula_show = true;
    //   }

    //   else if (vm.selected_value == 'Currency') {
    //     vm.currency_show = true;
    //     vm.number_show = false;
    //   }

    //   else if (vm.selected_value == 'Text') {
    //     vm.text_show = true;
    //   }

    //   else if (vm.selected_value == 'Number') {
    //     vm.currency_show = false;
    //     vm.number_show = true;
    //   }

    //   else if (vm.selected_value == 'Label') {
    //     vm.lable_show = true;
    //   }
    //   ////// // //////;

    // }

    /****Duplicate Row and Delete Row*******/

    vm.changeRow = function (ev, table_str, index, column, table_id, request_type, rowIndex, headArr, heading) {

      if (request_type == 'header') {

        headArr = [];

        for (var i = 0; i < rowIndex.length; i++) {
          var cell_type = table_str[i].type;
          if (cell_type == 'Label') {
            var cell_value = table_str[i].value;
            var key = i;
            var obj = {};
            obj[key] = cell_value;
            headArr.push(obj);

          }


        }

        if (headArr.length == 0) {
          $rootScope.message('Table Row cannot set as Header.', 'error');
          return false;
        }
      }
      /*********** */
      var new_tbl_str_data = table_str;
      var table_str_len = new_tbl_str_data.length;
      var prev_row_data = '';
      var next_row_data = '';
      if (index != 0) {
        prev_row_data = new_tbl_str_data.slice(0, index * column);
      }

      if (index < table_str_len - 1) {
        next_row_data = new_tbl_str_data.slice(index * column, table_str_len);
      }


      var duplicate_row = new_tbl_str_data.slice(index * column - column, index * column);

      // var  new_duplicate_row22 =  updateRow(duplicate_row,index,column);
      /******************** */
      /********************* */


      var currentTableData = vm.field['datatable_' + heading.id_parent + '_' + heading.id];




      var tab_id_update = table_id;

      vm.isLoader = true;
      var section_id = vm.section_id;
      var row_no = vm.rows;
      var columns_no = vm.columns;
      vm.checklist_id = $stateParams.id_CHK;

      // // //////
      api.dataTable.changeTableRow(index, column, table_str, tab_id_update, request_type, rowIndex, headArr, currentTableData).success(function (res) {
        vm.isLoader = false;
        ////// // //////;
        if (res.type == 'success') {
          var currentId = res.heading.id;
          // var pos = vm.headings.findIndex((obj, hib) => {obj.rid  ==currentId});
          var pos = vm.headings.findIndex(function (obj) {
            return obj.rid == currentId;
          });
          if (pos > -1) {
            if (res.heading.datatable[0].table_str) {

              /******************** */
              update_database_table_cell_values(res);


              //// // //////;
              /******************** */

              // vm['headings'][pos] = res.heading;
              vm['headings'][pos]['datatable'][0].header = res.heading.datatable[0].header
              vm['headings'][pos]['datatable'][0].header = res.heading.datatable[0].header
              vm['headings'][pos]['datatable'][0].column = parseInt(res.heading.datatable[0].column);
              vm['headings'][pos]['datatable'][0].row = parseInt(res.heading.datatable[0].row);

              vm['headings'][pos]['datatable'][0].table_str = res.heading.datatable[0].table_str;

              //// // //////;

            }

          }
          ////// // //////;

          console.log(" vm.dataTableArr=", res.heading);
          ////// // //////;
          vm.closeDialog();


        }
        else {
          console.log("Error on request");


        }

      })


      /******** */
      //// //////;

    };

    function updateRow(arr, index, column) {
      arr.length;
      //// //////;
      var myArr = [];
      for (var i = 0; i < arr.length; i++) {
        var index_no = arr[i].index;
        var new_index_no = parseInt(index_no) + column;

        myArr[new_index_no] = arr[i];

        var col_no = myArr[new_index_no].col_no;
        var row_no = myArr[new_index_no].row_no;

        var row_type = myArr[new_index_no].type;
        var new_col = parseInt(col_no) + 1;


        if (row_type == 'Formula') {
          var row_value = myArr[new_index_no].value;
          var find = col_no;
          var re = new RegExp(find, 'g');
          myArr[new_index_no].value = row_value.replace(re, new_col);
          //// // //////;          
        }

        myArr[new_index_no].cell_no = row_no + new_col;

        myArr[new_index_no].col_no = new_col.toString();
        myArr[new_index_no].index = new_index_no.toString();

      }
      //// // //////;
      return myArr;

    }

    /***End ***** */

    vm.saveFormat = function () {



      // giving error if submiting empty values
      if (vm.model === "Formula") {
        if (!$rootScope.DataTableFields.formula) {
          $rootScope.message('Plese enter the Formula to continue', 'error');
          return 0;
        }

      } else if (vm.model === "Text") {

        if ($rootScope.DataTableFields.text === undefined || $rootScope.DataTableFields.text === false) {

          $rootScope.message('Plese enter the Text characters to continue', 'error');
          return 0;
        }
      } else if (vm.model === "Number") {

        if ($rootScope.DataTableFields.number_type === undefined || $rootScope.DataTableFields.number_type === false) {

          $rootScope.message('Plese enter the Decimals to continue', 'error');
          return 0;
        }

      } else if (vm.model === "Currency") {

        if (!$rootScope.DataTableFields.currency_type) {

          $rootScope.message('Plese enter the Currency Type to continue', 'error');
          return 0;
        }
      } else if (vm.model === "Data Point") {

        if (!$rootScope.DataTableFields.data_point_function) {

          $rootScope.message('Plese select the function to continue', 'error');
          return 0;
        }
      }

      var rootScopeDatafields = $rootScope.DataTableFields;



      rootScopeDatafields.value = ''
      rootScopeDatafields.cell_stucture = '';

      var table_key = vm.selectedHeaderName + vm.selectedHeaderIndex

      var d_len = vm.myrecords.length

      for (i = 0; i < d_len; i++) {

        var recArr = vm.myrecords[i]
        var chkKey = table_key in recArr;
        if (chkKey) {
          vm.indexPos = i

        }
      }


      ////// // //////;
      vm.selColIndex = vm.selectedHeaderIndex - 1

      dataTable.savingCellStructure(vm.selectedIndex, vm.selectedHeaderName, vm.selectedHeaderIndex, vm.alignTextStatus, vm.TextPostitionStatus)

      // rootScopeDatafields.cell_stucture = { 'index': vm.selectedIndex, 'cell_no': vm.selectedHeaderName + vm.selectedHeaderIndex, 'type': selected_value, 'row': vm.selectedHeaderName, 'column': vm.selectedHeaderIndex, 'text_position': vm.TextPostitionStatus, 'text_align': vm.alignTextStatus }

      // if (selected_value == 'None') {
      //   rootScopeDatafields.cell_stucture.value = '';
      // }
      // else if (selected_value == 'Formula') {

      //   rootScopeDatafields.value = rootScopeDatafields.formula
      //   rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value ;

      //   vm.value = ''

      // }
      // else if (selected_value == 'Currency') {
      //   rootScopeDatafields.value = rootScopeDatafields.currency_type;

      //   rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value ;

      //   vm.value = '';

      // }
      // else if (selected_value == 'Date') {
      //   rootScopeDatafields.value = ''

      //   rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value ;

      // }

      // else if (selected_value == 'Text') {
      //   rootScopeDatafields.value = rootScopeDatafields.text
      //   rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value;
      //   rootScopeDatafields.value = ''
      // }

      // else if (selected_value == 'Number') {
      //   vm.value = rootScopeDatafields.number_type
      //   rootScopeDatafields.cell_stucture.value =  vm.value;
      //   rootScopeDatafields.cell_stucture.percentage = rootScopeDatafields.percentage;
      //   rootScopeDatafields.value = ''
      // }

      // else {
      //   rootScopeDatafields.value = rootScopeDatafields.label_name
      //   rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value;

      // }

      console.log('rootScopeDatafields.cell_stucture', rootScopeDatafields.cell_stucture);
      console.log('rootScopeDatafields.value', rootScopeDatafields.value);

      //////;
      vm.myrecords[vm.indexPos][vm.selectedHeaderName + vm.selectedHeaderIndex] = rootScopeDatafields.value;
      vm.data_table_structure[vm.indexPos] = rootScopeDatafields.cell_stucture



      // rootScopeDatafields.label_name = ''


      // rootScopeDatafields = {
      //   lable_show : false,
      //   text_show : false,
      //   formula_show : false,
      //   number_show : false,
      //   textShow : false,
      //   cellSelected : false,
      //   label_name : ''
      // }



      vm.model = $scope.cell_format[0].name;
      vm.alignTextStatus = $scope.alignTextVal[0].name;
      vm.TextPostitionStatus = $scope.TextPostition[0].name;

    }



    // vm.selectPercentage = function () {

    //   dataTable.selectPercentage();

    // if ($rootScope.DataTableFields.percentage) {
    //   $rootScope.DataTableFields.percentage = false;
    // }
    // else {
    //   $rootScope.DataTableFields.percentage = true;
    // }

    ////// // //////;
    // };


    /***** New Updated **********/
    vm.saveDone = function (tbl_id) {

      var tab_id_update = tbl_id != '' ? tbl_id : '';

      vm.isLoader = true;
      var section_id = vm.section_id;
      var row_no = vm.rows;
      var columns_no = vm.columns;
      vm.checklist_id = $stateParams.id_CHK;

      api.dataTable.add(vm.dataTableName, row_no, columns_no, section_id, vm.data_table_structure, tab_id_update).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          if (tab_id_update != '') {

            var currentId = res.heading.id;
            var pos = vm.headings.findIndex(function (obj) {
              return obj.rid == currentId;
            });
            if (pos > -1) {
              if (res.heading.datatable[0].table_str) {
                var section_id = res.heading.id_parent;
                var heading_id = res.heading.id;

                var new_field = "datatable_" + section_id + "_" + heading_id;

                update_database_table_cell_values(res);


                vm['headings'][pos]['datatable'][0].header = res.heading.datatable[0].header
                vm['headings'][pos]['datatable'][0].table_str = res.heading.datatable[0].table_str;
              }

            }
          }
          else {
            var getHeadingIndex = vm['headings'].length;
            vm['headings'].push(res.heading);
            window.location.reload();
          }

          console.log(" vm.dataTableArr=", res.heading);

          vm.closeDialog();

        }
        else {
          // Display error
        }

      })

    };
    /*****End New Updated **********/

    vm.saveTableData = function ($event, id, datatable_id, heading) {
      var currentTableData = vm.field['datatable_' + heading.id_parent + '_' + heading.id];
      // // //////;   


      var $proceed = false;
      for (var i = 0; i < currentTableData.length; i++) {
        if (currentTableData[i] !== null && currentTableData[i] != "") {
          $proceed = true;
          break;
        }

      }
      if (!$proceed) {
        $rootScope.message('Empty Table Cannot saved.', 'warning');
        return false;
      }



      api.dataTable.saveTable(id, datatable_id, currentTableData).success(function (res) {
        vm.isLoader = false;
        ////// // //////;
        if (res.type == 'success') {
          //// // //////;

          var currentId = res.heading.id;
          var pos = vm.headings.findIndex(function (obj) {
            return obj.rid == currentId;
          });
          if (pos > -1) {
            if (res.heading.datatable[0].table_str) {
              /******************** */
              /******************** */

              update_database_table_cell_values(res);


              /******************** */

              vm['headings'][pos]['datatable'][0].header = res.heading.datatable[0].header
              vm['headings'][pos]['datatable'][0].column = parseInt(res.heading.datatable[0].column);
              vm['headings'][pos]['datatable'][0].row = parseInt(res.heading.datatable[0].row);
              vm['headings'][pos]['datatable'][0].table_str = res.heading.datatable[0].table_str;
            }

          }

          ////// // //////;

          console.log(" vm.dataTableArr=", res.heading);
          ////// // //////;
          vm.closeDialog();


        }
        else {
          // Display error
        }

      })

      ////// // //////;



    }

    /*****To Update Cell values******* */

    function update_database_table_cell_values(res) {

      var section_id = res.heading.id_parent;
      var heading_id = res.heading.id;

      var new_field = "datatable_" + section_id + "_" + heading_id;

      //// // //////;
      if (vm.field[new_field]) {
        //// // //////;
        for (var key in res.heading.datatable[0].table_str) {
          if (res.heading.datatable[0].table_str[key].cell_value) {
            //// // //////;
            var cell_new_val = res.heading.datatable[0].table_str[key].cell_value;
            vm.field[new_field][key] = cell_new_val;
          }
          else {
            vm.field[new_field][key] = null
          }

        }
      }
    }

    /****************** */


    /***** all_spreadsheets code starts ******/

    vm.getAllSpreadsheets = getAllSpreadsheets;
    vm.add_from_database_table = add_from_database_table;
    vm.getSpreadsheetSingleRow = getSpreadsheetSingleRow;


    function add_from_database_table(ev, checklist, heading, rowIndex, rowHeader) {

      if (rowHeader.length == 0) {
        $rootScope.message('Please set as Header.', 'error');
        return false;

      }


      vm.currentHeading = heading;
      vm.add_from_db_rowIndex = rowIndex;
      vm.add_from_db_rowHeader = rowHeader;

      //// // //////;

      // console.log(rowIndex, rowHeader);
      // console.log(vm.add_from_db_rowIndex, vm.add_from_db_rowHeader);

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-add-from-database-dialog.html',
        parent: angular.element($document.find('#checklist')),
        targetEvent: ev,
        clickOutsideToClose: false
      });


    }

    vm.excels = {

      view: function (excel, index) {

        if (vm.origColspanLength == undefined || vm.origColspanLength < excel.data.heading.length) {
          vm.origColspanLength = excel.data.heading.length;
          if (vm.colspanLength < 4) vm.colspanLength = 2;
          else vm.colspanLength = vm.origColspanLength - 1;
        }
        vm.excel_open_id = excel.id;

      }

    }

    function getAllSpreadsheets() {
      api.organization.get_all_spreadsheets().then(function (d) {
        vm.isLoader = false;
        if (d.data.code == '-1') {
          if (d.data.message == 'unauthorized access') {
            $state.go('app.logout');
          } else {
          }
        } else {
          vm.all_spreadsheets = d.data.spreadsheets;

          // vm.excels.progress = false;

        }
      });
    };
    getAllSpreadsheets();



    function getSpreadsheetSingleRow(record) {

      vm.closeDialog();

      var section_id = vm.currentHeading.id_parent;
      var heading_id = vm.currentHeading.id;

      var new_field = "datatable_" + section_id + "_" + heading_id;





      console.log('getSpreadsheetSingleRow', record);
      vm.currentHeading;
      vm.add_from_db_rowIndex;
      vm.add_from_db_rowHeader;




      var head_len = vm.add_from_db_rowHeader.length;
      if (head_len > 0) {
        for (var i = 0; i < head_len; i++) {

          var key = vm.add_from_db_rowHeader[i];
          var key_find = key.toLowerCase();
          //// // //////;
          if (key_find in record) {

            var getIndex = vm.add_from_db_rowIndex[i];

            var type = vm.currentHeading.datatable[0].table_str[getIndex].type;
            if (type != 'Formula') {
              vm.field[new_field][getIndex] = record[key_find];

              $scope.autoCalculate(getIndex, vm.currentHeading.datatable[0].table_str, vm.currentHeading);
            }

          }


        }
      }

      console.log('add_from_db_rowIndex', vm.add_from_db_rowIndex);
      console.log(' vm.add_from_db_rowHeader', vm.add_from_db_rowHeader);

    }


    function createTableFromTemplate(section_id) {

      vm.table_section_id = section_id;
      console.log('createTableFromTemplate');
      // //////;
      api.dataTable.getDataTableTemplate().error(function (res) {
        return $rootScope.message('Unknown error creating Table from selected Template.', 'warning');
      }).success(function (res) {
        vm.isLoader = false;
        if (res.code) {
          return $rootScope.message("Error creating Table from Template: (" + res.code + "): " + res.message, 'warning');
        } else {

          vm.datatable_templates = res.datatable_templates;
          $mdDialog.show({
            scope: $scope,
            preserveScope: true,
            templateUrl: 'app/main/checklist/dialogs/checklist/checklist-create-table-from-template.html',
            parent: angular.element($document.find('#checklist')),

            clickOutsideToClose: false
          });


          // vm.closeDialog();
        }
      })

    }

    vm.downloadTable = function (temp_id) {

      //// // //////;

      vm.isLoader = true;

      api.dataTable.downloadTable(vm.table_section_id, temp_id).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          //// // //////;
          var current_section_id = res.heading.id_parent;
          var pos = vm.sections.findIndex(function (obj) {
            return obj.rid == current_section_id;
          });

          vm['sections'][pos].headings.push(res.heading);
          vm.closeDialog();


        }
        else {
          // Display error
        }

      })

    };

    vm.openTableFromTemplateDialog = function (temp_id) {

      vm.table_template_name = '';
      vm.table_template_description = '';
      vm.table_id = temp_id;
      vm.title = 'Create New Data Table Template';

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/checklist/dialogs/checklist/checklist-add-table-template-dialog.html',
        parent: angular.element($document.find('#checklist')),

        clickOutsideToClose: false
      });

    }

    vm.saveTableAsTemplate = function () {
      vm.table_template_name;
      vm.table_template_description;
      //// // //////;
      vm.isLoader = true;
      api.dataTable.saveTableAsTemplate(vm.table_id, vm.table_template_name, vm.table_template_description).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          //// // //////;
          vm.closeDialog();
        }

      })

    };

    /*****Add from database ends******/
    /*** End Data Table Function */


    function changeUppercase(input) {
      console.log('$rootScope.DataTableFields.formula', $rootScope.DataTableFields.formula);
      $rootScope.DataTableFields.formula = $rootScope.DataTableFields.formula.toUpperCase();
    }




    // reports starts

    //   $rootScope.$on("createReportDataTableSegment", function(event, what, name, to, type, info, item_type, alert, column, row, ev){

    //     console.log('createReportDataTableSegment check',what, name, to, type, info, item_type, alert, column, row, ev)
    //     // vm.type.title = 'Create/Edit Table';
    //     // vm.type.label = 'Add Name and Number of Columns and Rows';
    //     // vm.type.rows = 'Rows';
    //     // vm.type.columns = 'Columns';
    //     // vm.type.type = '';

    //     $scope.createDataTableSegment();
    //  });
    // reports ends

  }


})();
