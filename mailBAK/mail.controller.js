(function ()
{
    'use strict';

    angular
        .module('app.mail')
        .controller('MailController', MailController);

    /** @ngInject */
    function MailController($scope, $rootScope, $filter, $document, $mdDialog, $mdMedia, $mdSidenav, $state, msApi, Folders, Labels)
    {

    	//$rootScope.resetFeed();
		$rootScope.$on('event:socketConnected',function(){
			$rootScope.socketio.emit('feed_load', $rootScope.user.idCON);
		});

    	var vm = this;

        // Data
        //vm.colors = ['blue-bg', 'blue-grey-bg', 'orange-bg', 'pink-bg', 'purple-bg'];
        vm.colors = ['blue-bg'];
        vm.selectedAccount = 'creapond';

		    vm.user = $rootScope.user;
        vm.folders = Folders.data;
        vm.labels = Labels.data;


        vm.loadingThreads = true;

        vm.currentFilter = {
            type  : $state.params.type,
            filter: $state.params.filter
        };
        vm.currentThread = null;
        vm.selectedThreads = [];

        vm.views = {
            outlook: 'app/main/mail/views/outlook/outlook-view.html'
        };
        vm.defaultView = 'outlook';
        vm.currentView = 'outlook';

        // Methods
        vm.loadFolder = loadFolder;
        vm.loadLabel = loadLabel;
        vm.isFolderActive = isFolderActive;
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
        vm.filterInbox = filterInbox;

        //.co methods
        vm.submitPost = submitPost;


		//Feed data
		vm.threads = $rootScope.feed.items;
    	console.log('vm.threads', vm.threads);
		$rootScope.$on('event:feedNotificationsReceived',function(){
			vm.threads = $rootScope.feed.items;
			console.log('vm.threads loaded',vm.threads);
		});

        init();

        /**
         * Initialize
         */

        function init()
        {

        	/*
            // Figure out the api name
            var apiName = 'mail.' + ($state.params.type || 'folder') + '.' + $state.params.filter + '@get';

            // Request the mails
            msApi.request(apiName).then(
                // Success

                function (response)
                {
                    // Load new threads
                    vm.threads = response.data;

                    // Hide the loading screen
                    vm.loadingThreads = false;

                    // Open the thread if needed
                    if ( $state.params.threadId )
                    {
                        for ( var i = 0; i < vm.threads.length; i++ )
                        {
                            if ( vm.threads[i].id === $state.params.threadId )
                            {
                                vm.openThread(vm.threads[i]);
                                break;
                            }
                        }
                    }
                }
            );
            */

}

		console.log('vm.threads', vm.threads);

		function filterThreads(labelId) {
			vm.threads = $rootScope.feed.items;
				vm.threads = $filter('filter')(
		      	vm.threads,{labels:labelId}
		      	);
			return vm.threads;
		}

		function filterInbox(unread) {
			vm.threads = $rootScope.feed.items;
				if(unread !== 'all'){
				vm.threads = $filter('filter')(
		      	vm.threads,{unread:unread}
		      	);
      	}

			return vm.threads;
		}


        // Watch screen size to change view modes
        $scope.$watch(function ()
        {
            return $mdMedia('xs');
        }, function (current, old)
        {
            if ( angular.equals(current, old) )
            {
                return;
            }

            if ( current )
            {
                vm.currentView = 'classic';
            }
        });

        $scope.$watch(function ()
        {
            return $mdMedia('gt-xs');
        }, function (current, old)
        {
            if ( angular.equals(current, old) )
            {
                return;
            }

            if ( current )
            {
                if ( vm.defaultView === 'outlook' )
                {
                    vm.currentView = 'outlook';
                }
            }
        });

        /**
         * Load folder
         *
         * @param name
         */
        function loadFolder(name)
        {
            // If we are already in the selected folder and
            // there is an open thread just close it
            if ( vm.isFolderActive(name) )
            {
                // Close the current thread if open
                if ( vm.currentThread )
                {
                    vm.closeThread();
                }

                return;
            }

            // Show loader
            $rootScope.loadingProgress = true;

            // Update the state without reloading the controller
            $state.go('app.mail.threads', {
                type  : null,
                filter: name
            }, {notify: false});

            // Build the API name
            var apiName = 'mail.folder.' + name + '@get';

            // Make the call
            msApi.request(apiName).then(
                // Success
                function (response)
                {
                    // Load new threads
                    vm.threads = response.data;

                    // Set the current filter
                    vm.currentFilter = {
                        type  : null,
                        filter: name
                    };

                    // Close the current thread if open
                    if ( vm.currentThread )
                    {
                        vm.closeThread();
                    }

                    // Hide loader
                    $rootScope.loadingProgress = false;
                }
            );
        }

        /**
         * Load label
         *
         * @param name
         */

        function loadLabel(name) {
            // Update the state without reloading the controller
            $state.go('app.mail.threads', {
                type  : 'label',
                filter: name
            }, {notify: false});

            // If we are already in the selected folder and
            // there is an open thread just close it
            if ( vm.isLabelActive(name) )
            {
                // Close the current thread if open
                if ( vm.currentThread )
                {
                    vm.closeThread();
                }
                return;
            }

            // Show loader
            $rootScope.loadingProgress = true;

            // Build the API name
            var apiName = 'mail.label.' + name + '@get';

            // Make the call
            msApi.request(apiName).then(
                // Success
                function (response)
                {
                    // Load new threads
                    vm.threads = response.data;

                    // Set the current filter
                    vm.currentFilter = {
                        type  : 'label',
                        filter: name
                    };

                    // Close the current thread if open
                    if ( vm.currentThread )
                    {
                        vm.closeThread();
                    }

                    // Hide loader
                    $rootScope.loadingProgress = false;
                }
            );
        }

        /**
         * Is the folder with the given name active?
         *
         * @param name
         * @returns {boolean}
         */
        function isFolderActive(name)
        {
            return (vm.currentFilter.type === null && vm.currentFilter.filter === name);
        }

        /**
         * Is the label with the given name active?
         *
         * @param name
         * @returns {boolean}
         */
        function isLabelActive(name)
        {
            return (vm.currentFilter.type === 'label' && vm.currentFilter.filter === name);
        }

        /**
         * Open thread
         *
         * @param thread
         */
        function openThread(thread)
        {
        	var threadId = [thread.id];

			console.log('thread', thread);


        	if(thread.unread===true){
        	$rootScope.feed.mark(threadId);
            }

            vm.threads = $rootScope.feed.items;

            console.log('vm.threads', vm.threads);

            // Assign thread as the current thread
            vm.currentThread = thread;

            // Update the state without reloading the controller
            $state.go('app.mail.threads.thread', {threadId: thread.id}, {notify: false});
        }

        /**
         * Close thread
         */
        function closeThread()
        {
            vm.currentThread = null;

            // Update the state without reloading the controller
            $state.go('app.mail.threads', {
                type  : vm.currentFilter.type,
                filter: vm.currentFilter.filter
            }, {notify: false});
        }

        /**
         * Return selected status of the thread
         *
         * @param thread
         * @returns {boolean}
         */
        function isSelected(thread)
        {
            return vm.selectedThreads.indexOf(thread) > -1;
        }

        /**
         * Toggle selected status of the thread
         *
         * @param thread
         * @param event
         */
        function toggleSelectThread(thread, event)
        {

        	console.log('toggleSelectThread', thread, event);

            if ( event ) {
                event.stopPropagation();
            }
            if ( vm.selectedThreads.indexOf(thread) > -1 ) {
                vm.selectedThreads.splice(vm.selectedThreads.indexOf(thread), 1);
            }
            else {
                vm.selectedThreads.push(thread);
            }

            console.log('vm.selectedThreads', vm.selectedThreads);

        }

        /**
         * Select threads. If key/value pair given,
         * threads will be tested against them.
         *
         * @param [key]
         * @param [value]
         */
        function selectThreads(key, value)
        {
        	console.log('selected thread', key, value);


            // Make sure the current selection is cleared
            // before trying to select new threads
            vm.selectedThreads = [];

            for ( var i = 0; i < vm.threads.length; i++ )
            {
                if ( angular.isUndefined(key) && angular.isUndefined(value) )
                {
                    vm.selectedThreads.push(vm.threads[i]);
                    continue;
                }

                if ( angular.isDefined(key) && angular.isDefined(value) && vm.threads[i][key] === value )
                {
                    vm.selectedThreads.push(vm.threads[i]);
                }
            }

            console.log('vm.selectedThreads', vm.selectedThreads);
        }

        /**
         * Deselect threads
         */
        function deselectThreads()
        {
            vm.selectedThreads = [];
        }

        /**
         * Toggle select threads
         */
        function toggleSelectThreads()
        {
            if ( vm.selectedThreads.length > 0 )
            {
                vm.deselectThreads();
            }
            else
            {
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
        function setThreadStatus(key, value, thread, event)
        {
        	var updateThreads = [];

        	console.log('value', key, value);

        	console.log('vm.selectedThreads', vm.selectedThreads);



            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks
            if ( event )
            {
                event.stopPropagation();
            }

            // If the thread provided, do the changes on that
            // particular thread
            if ( thread )
            {
                thread[key] = value;
                return;
            }

            // If the current thread is available, do the
            // changes on that one
            if ( vm.currentThread )
            {
                vm.currentThread[key] = value;
                return;
            }

            // Otherwise do the status update on selected threads
            for ( var x = 0; x < vm.selectedThreads.length; x++ )
            {
                vm.selectedThreads[x][key] = value;

                updateThreads.push(vm.selectedThreads[x].id);
                vm.threads[x]
            }

                if(value===true){
                	console.log('update read');
        		$rootScope.feed.mark(updateThreads);
        		}

        		if(value===false){
        			console.log('update unread');
        		$rootScope.feed.unmark(updateThreads);
        		}

            console.log('updateThreads', updateThreads);

        }

        /**
         * Toggle the value of the given key on given thread, current
         * thread or selected threads. Given key value must be boolean.
         *
         * @param key
         * @param thread
         * @param event
         */
        function toggleThreadStatus(key, thread, event)
        {
            // Stop the propagation if event provided
            // This will stop unwanted actions on button clicks
            if ( event )
            {
                event.stopPropagation();
            }

            // If the thread provided, do the changes on that
            // particular thread
            if ( thread )
            {
                if ( typeof(thread[key]) !== 'boolean' )
                {
                    return;
                }

                thread[key] = !thread[key];
                return;
            }

            // If the current thread is available, do the
            // changes on that one
            if ( vm.currentThread )
            {
                if ( typeof(vm.currentThread[key]) !== 'boolean' )
                {
                    return;
                }

                vm.currentThread[key] = !vm.currentThread[key];
                return;
            }

            // Otherwise do the status update on selected threads
            for ( var x = 0; x < vm.selectedThreads.length; x++ )
            {
                if ( typeof(vm.selectedThreads[x][key]) !== 'boolean' )
                {
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
        function getLabel(id)
        {
        	//console.log('labels length', vm.labels.length);
            for ( var i = 0; i < vm.labels.length; i++ )
            {
                if ( vm.labels[i].id === id )
                {
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
        function getLabelColor(id)
        {

        	//var color_id = +id;
            return vm.getLabel(id).color;
        }

        /**
         * Get label title from label object
         *
         * @param id
         * @returns {*}
         */

        function getLabelTitle(id)
        {
            return vm.getLabel(id).title;
        }

        /**
         * Toggle label
         *
         * @param label
         */
        function toggleLabel(label)
        {
            // Toggle label on the currently open thread
            if ( vm.currentThread )
            {
                if ( vm.currentThread.labels.indexOf(label.id) > -1 )
                {
                    vm.currentThread.labels.splice(vm.currentThread.labels.indexOf(label.id), 1);
                }
                else
                {
                    vm.currentThread.labels.push(label.id);
                }

                return;
            }

            // Toggle labels on selected threads
            // Toggle action will be determined by the first thread from the selection.
            if ( vm.selectedThreads.length > 0 )
            {
                // Decide if we are going to remove or add labels
                var removeLabels = (vm.selectedThreads[0].labels.indexOf(label.id) > -1);

                for ( var i = 0; i < vm.selectedThreads.length; i++ )
                {
                    if ( !removeLabels )
                    {
                        vm.selectedThreads[i].labels.push(label.id);
                        continue;
                    }

                    if ( vm.selectedThreads[i].labels.indexOf(label.id) > -1 )
                    {
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
        function isLabelExist(label)
        {
            if ( vm.currentThread && vm.currentThread.labels )
            {
                return (vm.currentThread.labels.indexOf(label.id) > -1);
            }
        }

        /**
         * Change the view
         *
         * @param view
         */
        function changeView(view)
        {
            if ( vm.views[view] )
            {
                vm.defaultView = view;
                vm.currentView = view;
            }
        }

        /**
         * Open compose dialog
         *
         * @param ev
         */

        function composeDialog(ev)
        {
            $mdDialog.show({
                controller         : 'ComposeDialogController',
                controllerAs       : 'vm',
                locals             : {
                    selectedMail: undefined
                },
                templateUrl        : 'app/main/mail/dialogs/compose/compose-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : ev,
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
                controller         : 'ComposeDialogController',
                controllerAs       : 'vm',
                locals             : {
                      selectedMail : currentThread,
                    		  type : type
                					 },
                templateUrl        : 'app/main/mail/dialogs/compose/compose-dialog.html',
                parent             : angular.element($document.body),
                targetEvent        : ev,
                clickOutsideToClose: true
            });
        }


	function submitPost() {
      vm.newPost.submitting = true;
      //console.log('submitting convo entry', .id, .text, .type);
      return api.conversations.add($scope.conversation.id, $scope.newPost.text, $rootScope.viewingConversation.type).error(function(res) {
         $rootScope.message('Error posting.', 'warning');
      }).success(function(res) {
        if (res.code) {
          $rootScope.message(res.message, 'warning');
        } else {
          $rootScope.socketio.emit('message', res.posts[0]);
        }
      })["finally"](function() {
        vm.newPost = {
          text: '',
          submitting: false
        };
      });
    };

        /**
         * Toggle sidenav
         *
         * @param sidenavId
         */

        function toggleSidenav(sidenavId)
        {
            $mdSidenav(sidenavId).toggle();
        }
    }
})();
