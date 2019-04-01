Array.prototype.remove = function (e) {
  var ref, t;
  if ((t = this.indexOf(e)) > -1) {
    return ([].splice.apply(this, [t, t - t + 1].concat(ref = [])), ref);
  }
};


Array.prototype.diff = function (a) {
  return this.filter(function (i) {
    return a.indexOf(i) < 0;
  });
};



//var BASEURL = 'http://wdc1.acapqa.net:8081/dist/ajax/';
// Azure
var DOMAIN_NAME = 'https://checklinked.azurewebsites.net';
var BASEURL = 'https://checklinked.azurewebsites.net/api_security/ajax/';
var APIURL = 'https://checklinkedapp.azurewebsites.net/api/';

//var BASEURL = 'http://localhost:8081/dist/ajax/';


(function () {
  'use strict';
  angular
    .module('checklinked')
    .run(runBlock);
  /** @ngInject */
  function runBlock($rootScope, $timeout, $state, $cookies, $mdDialog, $location, $http, toastr, api, $filter) {
    // Activate loading indicator
    var silent;
    if (!$cookies.get("token") || $cookies.get("token") == 'undefined' || $cookies.get("token") == '') {
      $state.go('app.login');
    }
    // Authinication
    $rootScope.checkLogin = function (event, toState) {
      //console.log('checkLogin', toState);
      var check, module, path;

      path = toState.url;

      module = toState.name.split('.');

      check = function (path) {
        //Bad Session => redirect to login
        if (!$rootScope.userAuthenticated() || $rootScope.user === null || $rootScope.user === '') {
          console.log('checking 1');
          if (path != null) {
            api.cache.local.put('navTo', toState.name);
          }
          $state.go('app.login');
        } else if (!$rootScope.userSignupComplete() && module[1] !== 'user') {
          console.log('attempted to navigate to', module, path);
          if (path != null) {
            api.cache.local.put('navTo', toState.name);
          }
          console.log('success');
          /* for new changes db */
          /*  return $state.go(module.path); */

          return $state.go(toState.name);
        }
        /*
         else if (!$rootScope.userSubscribed() && module[1] !== 'user' && module[1] !== 'organization' && module[1] !== 'subscriptions' && module[1] !== 'teammembers') {
         console.log('WTF');
         if (path != null) {
         api.cache.local.put('navTo', toState.name);
         }
         $state.go('app.login');
         //return $state.go('app.user');
         }
         */

        else {
          api.cache.local.remove('navTo');
          return true;
        }
      }


      //console.log('module[1]', module[1]);
      switch (module[1]) {
        case 'login':
          console.log('navigating to login.  return true');
          return true;
          break;
        case 'account':
          console.log('navigating to account for confirm.  return true');
          return true;
          break;
        case 'create':
          console.log('navigating to create.  return true');
          return true;
          break;
        case 'confirm':
          console.log('navigating to confirm.  return true');
          return true;
          break;
        case 'term':
          console.log('navigating to term');
          return true;
          break;
        case 'supports':
          console.log('navigating to supports');
          return true;
          break;
        case 'reset':
          console.log('navigating to term');
          return true;
          break;
        case 'invite':
          console.log('navigating to invite.  return true');
          return true;
         break;
        case 'feed':
        case 'user':
        case 'checklist':
        case 'invitations':
        case 'organization':
        case 'notification':
        case 'subscriptions':
        case 'folders':
        case 'archives':
        case 'groups':
        case 'usersetting':
        case 'teammembers':
        case 'templates':
        case 'contacts':
        case 'other':
        case 'chat':
        case 'eee':
        case 'mail':
        case 'queue':
        case 'summary':
        case 'alerts':
        case 'dashboard':
        case 'checkout':
        case 'schedule':
        case 'invite':
        case 'to-do':
        case 'revoke':
          //case 'file-manager':

          if (module[1] === 'organization' && module[2] === 'invite' && module[3] === 'accept') {
            console.log('organization invite accept does not require login');
            return true;
          } else if ($rootScope.user === void 0) {
            console.log('user not defined, pulling now');
            //return $http.get(BASEURL + 'login-authCheck.php', {
            return $http.get(BASEURL + 'login-authCheck.php', {
              cache: false
            }).then(
              function (d) { //success
                var res;
                console.log('success on user pull', d);
                if (d === void 0 || d == null || d == '') {
                  //console.log('server did not send response');
                } else {
                  res = d.data;

                  if (typeof res == 'string') {
                    res = JSON.parse(d.data, 1);
                  }
                }
                if (res === void 0 || res == null || res == '') {
                  console.log('not logged in (no res)');
                  $rootScope.user = void 0;
                  return check(path);
                } else {
                  console.log('res has content', typeof res, res);

                  $rootScope.user = res.user;
                  if ($rootScope.user !== void 0 && $rootScope.user != null && res.viewAs !== void 0 && res.viewAs != null) {
                    //console.log('WTF', viewAs);
                    $rootScope.viewAs.set(res.viewAs);
                  }
                  console.log('about to check path again after user load successful');
                  return check(path);
                }

              },
              function (err) { //error
                console.log('error on user pull', err);
                var ref;
                if (!((ref = $rootScope.user) != null ? ref.authenticated : void 0)) {
                  console.log('user not authenticated already after error on user pull, checking path now');
                  return check(path);
                }
              }
            );
          } else {
            console.log('user already loaded, checking path');
            return check(path);
          }
          break;
        case 'logout':
          return check();
      }
    };

    $rootScope.userAuthenticated = function () {
      var ref;
      if ((ref = $rootScope.user) != null ? ref.authenticated : void 0) {
        return true;
      }
    };

    $rootScope.userSignupComplete = function () {
      if ($rootScope.user === void 0) {
        return false;
      }
      if ($rootScope.user.organizationError === null) {
        return true;
      }
      return false;
    };

    $rootScope.userSubscribed = function () {
      var ref, ref1;
      if (((ref = $rootScope.user) != null ? (ref1 = ref.roles) != null ? ref1.indexOf('basic') : void 0 : void 0) !== -1) {
        return true;
      }
    };

    $rootScope.showReturnToLogin = function () {
      if (!$rootScope.userAuthenticated() && $location.path() !== '/login') {
        return false;
      }
    };

    $rootScope.loading = {
      folders: true,
      groups: true,
      checklists: true,
      invites: false
    };

    $rootScope.loaded = {
      folders: false,
      groups: false,
      checklists: false,
      invites: false
    };

    $rootScope.folders = [];
    $rootScope.groups = [];
    $rootScope.checklists = [];

    $rootScope.expanded = {
      folders: [],
      groups: []
    };

    $rootScope.inviteCounts = {
      checklists: 0,
      friendships: 0
    };

    $rootScope.showingUsers = [];

    $rootScope.userCheckboxesAreShowing = function (usr) {
      var usrShowing;
      usrShowing = $filter('filter')($rootScope.showingUsers, {
        idCON: usr.idCON
      }, true);
      if (usrShowing[0] !== void 0) {
        return true;
      }
      return false;
    };

    $rootScope.children = function (whats, parentID) {

      //console.log('whats', whats);
      //console.log('parentID', parentID);

      //console.log('$rootScope[whats]', $rootScope[whats]);
      return $filter('orderBy')($filter('filter')($rootScope[whats], {
        id_parent: parentID
      }, true), 'order');
    };

    $rootScope.organizeData = function () {
      console.log('$rootScope.organizeData');
      var folder, group, j, k, len, len1, ref, ref1;

      //Check to see if checklists/folders/groups are loading into models
      if ($rootScope.loading.folders || $rootScope.loading.groups || $rootScope.loading.checklists) {
        return false;
      }

      ref = $rootScope.groups;
      console.log('$rootScope.groups', $rootScope.groups);
      for (j = 0, len = ref.length; j < len; j++) {
        group = ref[j];
        group.checklists = $rootScope.children('checklists', group.id);
        console.log('group.checklists', group.checklists);
      }
      ref1 = $rootScope.folders;
      console.log('$rootScope.folders', $rootScope.folders);
      for (k = 0, len1 = ref1.length; k < len1; k++) {
        folder = ref1[k];
        folder.groups = $rootScope.children('groups', folder.id);
      }
      console.log('event:dataOrganized');
      return $rootScope.$broadcast('event:dataOrganized');
    };

    silent = true;

    $rootScope.$on('coe:pleaseCache', function () {
      return CacheLocalUser.put('coe', JSON.stringify($rootScope.items));
    });

    //activate toastr for $rootScope
    $rootScope.message = function (text, type, duration) {
      if (type == null) {
        type = 'success';
      }
      if (duration == null) {
        duration = 4000;
      }
      return toastr[type](text, {
        timeOut: duration
      });
    };

    $rootScope.notify = function (notifications) {
      console.log('about to sent notify event', notifications);
      if (!Array.isArray(notifications)) {
        notifications = [notifications];
      }
      return $rootScope.socketio.emit('notify', notifications);
    };

    $rootScope.showSection = function (section) {
      if ($rootScope.section === section) {
        return true;
      }
    };

    $rootScope.showSectionImg = function (section) {
      if (section === 'login') {
        return true;
      }
    };

    // Cleanup
    $rootScope.$on('$destroy', function () {
      stateChangeStartEvent();
      stateChangeSuccessEvent();
    });

    //SEARCH BAR
    $rootScope.globalSearch = {
      active: false,
      toggle: function () {
        $rootScope.globalSearch.active = !$rootScope.globalSearch.active;
        if (!$rootScope.globalSearch.active) {
          $rootScope.globalSearch.searchTerm = '';
        }
        return false;
      },
      searchTerm: ''
    };

    $rootScope.globalSearchCollapse = true;

    $rootScope.viewAs = {
      loading: false,
      user: {},
      allowed: false,
      available: [],
      notMe: false,
      getAvailable: function () {
        var self;
        self = this;
        return $http.get(BASEURL + 'organization_members-get.php').then(function (d) {
          var res;
          if (typeof d !== 'object') {
            return false;
          }
          res = d.data;
          if (typeof res !== 'object') {
            return false;
          }
          if (res.code) {
            return false;
          }
          self.available = res.members;
          //return console.log('loaded available members for view as', res.members);
        });
      },
      change: function () {
        return true;
      },
      restore: function () {
        console.log('restoring view to logged in user');
        this.select($rootScope.user);
        return true;
      },
      set: function (user) {
        var ref;
        $rootScope.folders = [];
        $rootScope.groups = [];
        $rootScope.checklists = [];
        $rootScope.$broadcast('event:userSelected');
        console.log('broadcast event:userSelected');
        this.user = user;
        console.log('viewAs.user set', user);
        this.notMe = (user != null ? user.idCON : void 0) !== ((ref = $rootScope.user) != null ? ref.idCON : void 0) ? true : false;
        console.log('viewAs.notMe set', this.notMe);
        $rootScope.$broadcast('event:userLoaded');
        console.log('broadcast event:userLoaded');
        this.loading = false;
        return true;
      },
      select: function (contact) {
        var self;
        if (contact.idCON === this.user.idCON) {
          return false;
        }
        this.loading = contact.idCON;
        self = this;
        return $http.get(BASEURL + "userByID-get.php?idCON=" + contact.idCON + "&viewAs=1").then(function (d) {
          var res;
          if (typeof d !== 'object') {
            return $rootScope.message("Server not responding properly.", 'warning');
          } else {
            res = d.data;
            if (typeof res !== 'object') {
              return $rootScope.message("Server not responding properly.", 'warning');
            } else if (res.code) {
              return $rootScope.message(res.message, 'warning');
            } else {
              return self.set(res.user);
            }
          }
        }, function (err) {
          return $rootScope.message("Server not responding.", 'warning');
        }).then(function () {
          return self.loading = false;
        });
      }
    };

    $rootScope.resetFeed = function () {

      return $rootScope.feed = {
        modal: {
          eventsSet: false,
          showing: false
        },
        loading: true,
        items: [],
        show: [],
        next: {
          start: 0,
          qty: 20
        },
        unread: [],
        marking: [],
        unmarking: [],
        marked: [],
        mark: function (itemIDs) {
          console.log('mark:', itemIDs);
          $rootScope.feed.marking.concat(itemIDs);
          $rootScope.feed.unread = $rootScope.feed.unread.diff(itemIDs);
          console.log('$rootScope.feed.unread', $rootScope.feed.unread);
          $rootScope.socketio.emit('mark_feed_items_read', $rootScope.user.idCON, itemIDs);
        },
        unmark: function (itemIDs) {
          $rootScope.feed.unmarking.concat(itemIDs);
          return $rootScope.socketio.emit('mark_feed_items_unread', $rootScope.user.idCON, itemIDs);
        },
        isUnread: function (item) {
          var f, id;
          f = $rootScope.feed;
          id = item.id;
          if (!item.unread) {
            return false;
          }
          if (!f.marked.indexOf(id) < 0) {
            return false;
          }
          if (!f.marking.indexOf(id) < 0) {
            return false;
          }
          return true;
        }
      };
    };

    $rootScope.resetFeed();

    $rootScope.addUserData = function (type, data) {
      return $http.post(BASEURL + 'realtime-adjustUser-post.php', {
        w: type,
        d: data
      }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        });
    };


    $rootScope.permissions = {
      canChange: false,
      hasAny: function (features, data) {
        var has;
        if (data == null) {
          data = null;
        }
        has = false;
        features.forEach(function (feature) {
          return has = has || $rootScope.permissions.has(feature, data);
        });
        return has;
      },
      has: function (feature, data) {
        var basic;
        if (data == null) {
          data = null;
        }
        switch (feature) {
          case 'viewTeamMembers':
          case 'viewTemplates':
            if ($rootScope.userSubscribed()) {
              return true;
            }
            break;
          case 'viewFolders':
          case 'viewChecklist':
            if ($rootScope.userSignupComplete()) {
              return true;
            }
            break;
          case 'viewAs':
            if ($rootScope.user.roles.indexOf('manager') !== -1) {
              return true;
            }
            break;
          case 'deleteTemplate':
            if ($rootScope.user.roles.indexOf('basic') !== -1) {
              return true;
            }
            break;
          case 'offboardMember':
            if (+data.idCON === +$rootScope.user.idCON) {
              return true;
            }
            if ($rootScope.user.roles.indexOf('corporate') !== -1) {
              return true;
            }
            if ($rootScope.user.roles.indexOf('leader') !== -1) {
              return true;
            }
            if ($rootScope.user.roles.indexOf('manager') !== -1) {
              return true;
            }
            break;
          case 'linkToChecklist':
            if ($rootScope.userSubscribed() && $rootScope.user.roles.indexOf('manager') !== -1) {
              return true;
            }
            break;
          case 'changePermissions':
            if ($rootScope.user.roles.indexOf('leader') !== -1) {
              return true;
            }
            break;
          case 'subscriptionManagement':
            if ($rootScope.viewAs.user.organization.colleagueCount === 0) {
              return true;
            }
            if ($rootScope.viewAs.user.roles.indexOf('financial') !== -1) {
              return true;
            }
            break;
          case 'incomingChecklists':
            if ($rootScope.viewAs.user.roles.indexOf('queue') !== -1) {
              return true;
            }
            break;
          case 'editOrgInfo':
            if ($rootScope.user.roles.indexOf('leader') !== -1) {
              return true;
            }
            if ($rootScope.user.roles.indexOf('financial') !== -1) {
              return true;
            }
            break;
          case 'saveChecklist':
          case 'restoreChecklist':
          case 'downloadTemplate':
          case 'publishTemplate':
          case 'inviteToChecklist':
            if ($rootScope.user && $rootScope.user.roles.indexOf('basic') !== -1) {
              return true;
            }
            break;
          case 'modifyChecklist':
            if ($rootScope.user.roles.indexOf('basic') !== -1) {
              return true;
            }
            if (data.CHK.inviterDetails.idCON === $rootScope.user.idCON) {
              return true;
            }
            break;
          case 'inviteToOrg':
            basic = $filter('filter')($rootScope.user.organization.rolePool, {
              web_name: 'basic'
            }, true);
            if (typeof basic[0] === 'object') {
              if (+basic[0].available) {
                return true;
              }
            }
            break;
          default:
            return false;
        }
      },
      set: function () {
        var has;
        has = this.has('viewAs');
        $rootScope.viewAs.allowed = has;
        has = this.has('changePermissions');
        return $rootScope.permissions.canChange = has;
      }
    };

    $rootScope.socketio = false;


    //USER LOADED

    $rootScope.$on('event:userLoaded', function (e, data) {
      var realtime, show;
      $rootScope.resetFeed();
      $rootScope.viewAs.getAvailable();
      $rootScope.permissions.set();
      show = {
        idCON: $rootScope.viewAs.user.idCON,
        name: $rootScope.viewAs.user.name.first
      };
      $rootScope.showingUsers = [show];
      console.log('set showing users', $rootScope.showingUsers);
      api.folders.get().success(function (res) {
        var ref;
        if ((ref = res.folders) != null ? ref.length : void 0) {
          return $rootScope.folders = res.folders;
        }
      })["finally"](function () {
        $rootScope.loading.folders = false;
        return $rootScope.organizeData();
      });
      api.groups.get().success(function (res) {
        var ref;
        if ((ref = res.groups) != null ? ref.length : void 0) {
          return $rootScope.groups = res.groups;
        }
      })["finally"](function () {
        $rootScope.loading.groups = false;
        return $rootScope.organizeData();
      });
      api.checklists.get().success(function (res) {
        var ref;
        if ((ref = res.checklists) != null ? ref.length : void 0) {
          $rootScope.checklists = res.checklists;
        }
        $rootScope.loaded.checklists = true;
        return $rootScope.$broadcast('event:checklistsLoaded');
      })["finally"](function () {
        $rootScope.loading.checklists = false;

        console.log('rootScopeChecklists', $rootScope.checklists);

        return $rootScope.organizeData();
      });
      console.log('received event:userLoaded', $rootScope.user);
      if ($location.search().devMode === true) {
        realtime = 'https://socket.checklinked.com/';
        // realtime = 'http://168.61.165.204:8085/';

      } else {
        realtime = 'https://socket.checklinked.com/';
      }
      $rootScope.socketio = io(realtime, {
        transports: ['websocket', 'polling', 'flashsocket'],
        secure: true
      });
      return $rootScope.socketio.on('connect', function () {
        var ids, sock, subs, subscriptionDetails, u;
        sock = $rootScope.socketio;
        u = $rootScope.user;
        subs = u.subscriptions;
        console.log('broadcasted event:socketConnected');
        $rootScope.$broadcast('event:socketConnected');
        console.log('subscriptions', subs);
        ids = subs.contacts || [];
        ids = ids.concat(subs.checklists || []);
        ids = ids.concat(subs.sections || []);
        ids = ids.concat(subs.headings || []);
        ids = ids.concat(subs.items || []);
        //console.log('ids', ids);
        subscriptionDetails = {
          idCON: u.idCON,
          ids: ids
        };

        sock.emit('join', "/feed/" + $rootScope.user.idCON);

        //console.log('sending total subscription', subscriptionDetails);
        sock.emit('feed_total_subscription_update', subscriptionDetails);

        sock.on('notification', function (notes) {
          console.log('received notes: ', notes);
          notes.forEach(function (note) {
            //console.log('note', note);
            var existing, f;
            if (note.user.id !== u.idCON || note.type === 'invite_answered') {
              f = $rootScope.feed;
              note.timestamp = new Date(note.timestamp);

              switch (note.type) {
                case 'invited':
                  note.labels = [3];
                  break;
                case 'notification':
                  note.labels = [5];
                  break;
                case 'invite':
                  note.labels = [2];
                  break;
                case 'accepted':
                  note.labels = [2];
                  break;
                case 'message':
                  note.labels = [4];
                  break;
                case 'post':
                  note.labels = [6];
                  break;
                default:
                  note.labels = [0];
                  break;
              }
              switch (note.item.type) {
                case 'checklist':
                  note.labels.push(7);
                  break;
                case 'group':
                  note.labels.push(9);
                  break;
                case 'section':
                  note.labels.push(11);
                  break;
                case 'heading':
                  note.labels.push(10);
                  break;
                case 'item':
                  note.labels.push(12);
                  break;
                case 'post':
                  note.labels.push(6);
                  break;
                default:
                  note.labels.push(0);
                  break;
              }

              existing = {
                unread: $filter('filter')(f.unread, {
                  id: note.id
                }).length > 0,
                items: $filter('filter')(f.items, {
                  id: note.id
                }).length > 0,
                show: $filter('filter')(f.show, {
                  id: note.id
                }).length > 0
              };
              console.log('existing.unread', existing.unread);
              if (f.isUnread(note) && !existing.unread) {
                f.unread.push(note.id);
              }
              if (!existing.items) {
                f.items.push(note);
              }
              if (f.modal.showing && !existing.show) {
                f.show.push(note);
                return f.mark([note.id]);
              }
            }

          });
          $rootScope.feed.loading = false;
          $rootScope.$broadcast('event:feedNotificationsReceived');
          return $rootScope.$apply();
        });


        if ($rootScope.socketio._callbacks['$checklist_invite_count'] === void 0) {
          console.log('socket checklist_invite_count callback is not defined; defining now');
          $rootScope.socketio.on('checklist_invite_count', function (count) {
            console.log('received checklist invite count', count);
            if ($rootScope.inviteCounts.checklists !== count) {
              console.log('broadcasting event:checklistInviteCountChanged');
              $rootScope.$broadcast('event:checklistInviteCountChanged');
            }
            $rootScope.inviteCounts.checklists = count;
            return $rootScope.$apply();
          });
        }

        if ($rootScope.socketio._callbacks['$labels_changed'] === void 0) {
          console.log('socket labels_changed callback is not defined; defining now');
          $rootScope.socketio.on('labels_changed', function () {
            console.log('received labels_changed');
            return $rootScope.addUserData('labels-reset').then(function (d) {
              var res;
              if (typeof d !== 'object') {
                return false;
              }
              res = d.data;
              if (typeof res !== 'object') {
                return false;
              }
              if (res.code) {
                return false;
              }
              $rootScope.user = res.user;
              return $rootScope.$broadcast('event:labelsUpdated');
            });
          });
        }

        if ($rootScope.socketio._callbacks['$friendship_invite_count'] === void 0) {
          console.log('socket friendship_invite_count callback is not defined; defining now');
          $rootScope.socketio.on('friendship_invite_count', function (count) {
            var update;
            console.log('received friendship invite count', count);
            if (count !== $rootScope.inviteCounts.friendships) {
              update = true;
            }
            $rootScope.inviteCounts.friendships = count;
            $rootScope.$apply();
            if (update) {
              return $rootScope.$broadcast('event:friendshipInviteCountUpdated');
            }
          });
        }

        if ($rootScope.socketio._callbacks['$error_marking_feed_items_read'] === void 0) {
          //console.log('socket error_marking_feed_items_read callback is not defined; defining now');
          $rootScope.socketio.on('error_marking_feed_items_read', function (itemIDs) {
            //console.log('received error marking feed items read', itemIDs, err);
            $rootScope.feed.marking = $rootScope.feed.marking.diff(itemIDs);
            return $rootScope.feed.unread = $rootScope.feed.unread.concat(itemIDs);
          });
        }

        if ($rootScope.socketio._callbacks['$feed_items_marked_read'] === void 0) {
          console.log('socket feed_items_marked_read callback is not defined; defining now');
          $rootScope.socketio.on('feed_items_marked_read', function (itemIDs) {
            console.log('received feed items marked read', itemIDs);


            $rootScope.feed.marking = $rootScope.feed.marking.diff(itemIDs);
            $rootScope.feed.marked = $rootScope.feed.marked.concat(itemIDs);

            /*
             $rootScope.feed.items.forEach(function (item) {
             if ($rootScope.feed.unread.indexOf(item.id) < 0) {

             return item.unread = false;
             }
             });
             */
            return $rootScope.$apply();
          });
        }

        if ($rootScope.socketio._callbacks['$invite_count_update_ping'] === void 0) {
          //console.log('socket invite_count_update_ping callback is not defined; defining now');
          $rootScope.socketio.on('invite_count_update_ping', function (type) {
            return $rootScope.socketio.emit('get_' + type + '_invite_count', $rootScope.user.idCON);
          });
        }

        sock.emit('join', "/feed/" + $rootScope.user.idCON);
        var ref;

        if ((ref = $rootScope.user.organization) != null ? ref.idACC : void 0) {
          sock.emit('join', "/organization/" + $rootScope.user.organization.idACC);
        }

        //console.log('sending total subscription', subscriptionDetails);
        sock.emit('feed_total_subscription_update', subscriptionDetails);
        sock.emit('feed_load', u.idCON);
        sock.emit('get_checklist_invite_count', u.idCON);
        sock.emit('get_friendship_invite_count', u.idCON);

        return $rootScope.sendInviteCountUpdatePing = function (idCON, type) {
          //console.log('sending invite count update ping', idCON, type);
          sock.emit('ping_invite_count', idCON, type);
          return true;
        };

      });
    });


    $rootScope.sendInviteCountUpdatePing = function (idCON, type) {
    };

    $rootScope.currentPaymentMethod = null;
    $rootScope.enterPaymentMethodValues = {};

    $rootScope.subscriptions = {
      agreeToTerms: false,
      finalizing: false,
      selected: null,
      doSelect: function (sub) {
        $rootScope.subscriptions.selected = sub;
        return api.subscriptions.getInvites($rootScope.subscriptions.selected.idSUB).success(function (res) {
          var ref;
          if (res != null ? (ref = res.invites) != null ? ref.length : void 0 : void 0) {
            return $rootScope.subscriptions.selected.invites = res.invites;
          } else {
            return $rootScope.subscriptions.selected.invites = [];
          }
        });
      },
      select: function (offer) {
        console.log('select', offer);
        $rootScope.subscriptions.doSelect(offer);
        $rootScope.enterPaymentMethodValues = {
          submit: function () {
            console.log('method form submitted');
            return false;
          },
          submitText: 'Enter Method'
        };
        return false;
      },
      finalize: function () {
        $rootScope.subscriptions.finalizing = true;
        console.log('finalizing with values', $rootScope.subscriptions, $rootScope.currentPaymentMethod);
        if (!$rootScope.subscriptions.agreeToTerms) {
          $rootScope.message('You cannot subscribe if you do not agree to Checklink\'s Terms and Conditions!', 'warning');
          return false;
        }
        api.subscriptions.finalize($rootScope.subscriptions.selected, $rootScope.currentPaymentMethod).error(function (res) {
          return $rootScope.message('Error talking to server.', 'warning');
        }).success(function (res) {
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('No response from server.', 'warning');
          } else if (res.code) {
            $rootScope.currentPaymentMethod = null;
            $rootScope.subscriptions.agreeToTerms = false;
            return $rootScope.message(res.message, 'warning');
          } else {
            $rootScope.subscriptions.selected = null;
            $rootScope.subscriptions.success = true;
            $rootScope.message('Subscription Success.', 'success');
            $rootScope.user = res.user;
            return $rootScope.$broadcast('event:membersUpdated');
          }
        })["finally"](function () {
          return $rootScope.subscriptions.finalizing = false;
        });
        return false;
      }
    };


    var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

      $rootScope.loadingProgress = true;
      //console.log('checking route for permissions');

      var mod, loginCheck;
      $rootScope.module = mod = toState.name.split('.');

      $rootScope.section = '';
      $rootScope.section = mod[1] === 'login' && !mod[2] ? 'login' : mod[1];
      if ($rootScope.section !== 'feed') {
        //console.log('is not the feed');
        $rootScope.backTo = '#' + toState.url;
      }
      if (mod[1] === 'login') {
        //console.log('is the login');
      } else if (mod[1] === 'logout') {
        var token = { token: $rootScope.token };
        $http.post(BASEURL + 'logout.php', token).then(
          function (d) { //success
            //$rootScope.socketio.disconnect();
            $rootScope.user = void 0;
            $cookies.remove("username");
            $cookies.remove("useridCON");
            $cookies.remove("token");
            var loginTime = '';
            loginCheck = $rootScope.checkLogin(event, toState);
            if (!loginCheck) {
              console.log('preventing logout', toState);
              event.preventDefault();
              $state.go('app.login');
            } else {
              //console.log('logout good');
            }
          }
          , function (err) {
            $rootScope.message('Error logging out.', 'warning');
            event.preventDefault();
          }
        );
      } else {
        //console.log('no special condition');
        loginCheck = $rootScope.checkLogin(event, toState);
        //console.log('login check result:',loginCheck);
        if (!loginCheck) {
          //console.log('preventing navigation',toState);
          event.preventDefault();
          $state.go('app.login');
        }
      }
    });


    // Update Checklists Load

    $rootScope.$on('event:updateModels', function (e, data) {
      console.log('e', e);
      console.log('data', data);

      $rootScope.folders = [];
      $rootScope.groups = [];
      $rootScope.checklists = [];

      //console.log('set showing users', $rootScope.showingUsers);
      api.folders.get().success(function (res) {
        var ref;
        if ((ref = res.folders) != null ? ref.length : void 0) {
          return $rootScope.folders = res.folders;
        }
      })["finally"](function () {
        $rootScope.loading.folders = false;
        return $rootScope.organizeData();
      });
      api.groups.get().success(function (res) {
        var ref;
        if ((ref = res.groups) != null ? ref.length : void 0) {
          return $rootScope.groups = res.groups;
        }
      })["finally"](function () {
        $rootScope.loading.groups = false;
        return $rootScope.organizeData();
      });
      api.checklists.get().success(function (res) {
        var ref;
        if ((ref = res.checklists) != null ? ref.length : void 0) {
          $rootScope.checklists = res.checklists;
        }
        $rootScope.loaded.checklists = true;
      })["finally"](function () {
        $rootScope.loading.checklists = false;
      });

    });


    // De-activate loading indicator
    var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
      $timeout(function () {
        $rootScope.loadingProgress = false;
      });
    });

    // Store state in the root scope for easy access
    $rootScope.state = $state;


    $rootScope.$broadcast('event:startDoomsDayDevice', $rootScope);

    //console.log('$rootScope.feed', $rootScope.feed);

    //   window.onunload = function () {
    //     alert("Window is closed");

    // }
    window.onunload = function (event) {
      alert('onunload');
      // $cookies.remove("username");
      // $cookies.remove("useridCON");
      // $cookies.remove("token");
      $state.go('app.login');

    };
    // window.onbeforeunload = function(event) {
    //   $state.go('app.login');
    //   };
    $rootScope.removeDuplicates = function (originalArray, prop) {
      var newArray = [];
      var lookupObject = {};

      for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
      }

      for (i in lookupObject) {
        newArray.push(lookupObject[i]);
      }
      return newArray;
    }
    // var  useridCON = $cookies.get("useridCON");
    // setInterval(function() {
    //   $rootScope.getUserPermission = function(useridCON){
    //     if($cookies.get("useridCON")) {
    //     $http.post(BASEURL + 'role-permission.php', {
    //       item_type: 'roleType',
    //       id: $cookies.get("useridCON"),
    //       type: 'getuserrole'
    //     }).success(function (res) {
    //       var empArray = [];
    //       angular.forEach(res.roles, function (item) {
    //         Object.assign(empArray, item);
    //       });
    //      $cookies.put("userpermission",JSON.stringify(empArray.permissions));
    //      console.log('userpermission', empArray.permissions);
    //     });
    //   }
    // }
    // },15000);






  }
})();
