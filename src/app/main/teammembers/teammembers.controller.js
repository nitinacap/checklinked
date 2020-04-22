(function () {
  'use strict';

  angular
    .module('app.teammembers')
    .controller('TeamMembersController', TeamMembersController);

  /** @ngInject */
  function TeamMembersController($rootScope, $http, $scope, api, $mdSidenav, $mdDialog, $stateParams, $cookies) {

    var vm = this;

    vm.toggleSidenav = toggleSidenav;
    vm.openSubscriptionDialog = openSubscriptionDialog;
    vm.openRoleTypeDialog = openRoleTypeDialog;
    vm.saveRoleType = saveRoleType;
    vm.ConfirmDeleteRoleType = ConfirmDeleteRoleType;
    vm.EditRoleType = EditRoleType;
    vm.closeDialog = closeDialog;
    vm.addLicence = addLicence;
    vm.members = [];
    vm.cancelSubscription = cancelSubscription;
    vm.openSubscriptionListDialog = openSubscriptionListDialog;
    vm.addManagerTeam = addManagerTeam;
    vm.addTeam = addTeam;
    vm.changeManager = changeManager;
    vm.ScreenLocked = true;




    // function to change the tab from the top menu vertical options starts
    $scope.$watch(function () {
      return $rootScope.curreManuItem;
    }, function () {
      if ($rootScope.curreManuItemName === 'teammembers') {
        vm.currentItem = parseInt($rootScope.curreManuItem);
        if (vm.currentItem == 1) {
          vm.myvalue = true;
        }
      }
    }, true);

    // function to change the tab from the top menu vertical options ends


    vm.isLoader = true;

    var userpermission = $cookies.get("userpermission");
    vm.checkIsPermission = userpermission ? JSON.parse(userpermission) : '';


    //Toggle Left Side Nav
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }


    $scope.$on('event:rolesUpdated', function () {
    });

    $scope.$on('event:membersUpdated', function () {
      return vm.members.load.start();
    });

    vm.members = {
      list: [],
      roles: [],
      load: {
        inProgress: false,
        error: '',
        start: function (idCON) {
          var process;
          if (idCON == null) {
            idCON = null;
          }
          if (idCON === null) {
            this.inProgress = true;
            this.error = '';
         
            process = this.processMember;
           
            return $http.get(BASEURL + "organization_members-get.php").success(function (res) {
              if (res === void 0 || res === null || res === '') {
                return vm.members.load.error = 'Error loading Team Members! (Server not responding properly.)';
              } else if (res.code) {
                return vm.members.load.error = "Error loading Team Members: (" + res.code + ") " + res.message;
              } else {
                vm.members.roles = res.roles;
                return vm.members.list = res.members.map(process);
              }
            }).error(function (err) {
              vm.members.load.inProgress = false;
              return vm.members.load.error = 'Error loading Team Members! (Sever not responding.)';
            })["finally"](function () {
              return vm.members.load.inProgress = false;
            });
          } else {

          }
        },
        processMember: function (raw) {
          var processed, roles;
          roles = $.extend({}, raw.roles, {
            setting: [],
            set: function (role, willHave) {
              var self;
              this.setting.push(role);
              self = this;
              return $http.post(BASEURL + "organization_member_role_set-post.php", {
                idCON: raw.idCON,
                role: role,
                setTo: willHave
              }, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache: false
              }).success(function (res) {
                var ref3, ref4;
                self.setting.remove(role);
                if (res === void 0 || res === null || res === '') {
                  $rootScope.message('Error updating Team Member role. Server not responding properly.', 'warning');
                } else if (res.code) {
                  $rootScope.message("Error updating Team Member role. (" + res.code + ") " + res.message, 'warning');
                } else if (willHave) {
                  self.has.push(role);
                } else {
                  self.has.remove(role);
                }
                $rootScope.socketio.emit('roles_updated', raw.idCON);
                if ((ref3 = $rootScope.user.organization) != null ? (ref4 = ref3.idACC) != null ? ref4.length : void 0 : void 0) {
                  return $rootScope.socketio.emit('members_updated', $rootScope.user.organization.idACC);
                }
              }).error(function (err) {
                self.setting.remove(role);
                return $rootScope.message('Error updating Team Member role.  Server not responding.', 'warning');
              })["finally"](function () {
                return self.setting.remove(role);
              });
            }
          });
          processed = raw;
          processed.roles = roles;
          return processed;
        }
      },
      offboard: {
        inProgress: [],
        execute: function (member, index) {
          var confMsg, self;
          confMsg = "You cannot undo this action.";
          if (member.idCON === $rootScope.user.idCON) {
            confMsg += " You";
          } else {
            confMsg += " The selected Team Member";
          }
          confMsg += " will lose access to all checklists, templates, and posts for this Organization.  Are you sure you wish to do this?";
          if (confirm(confMsg)) {
            self = vm.members.offboard;
            self.inProgress.push(member.idCON);

            $http.post(BASEURL + 'organization_member_offboard-post.php', {
              idCON: member.idCON
            }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            }).error(function (res) {
              return $rootScope.message('Error offboarding member.', 'warning');
            }).success(function (res) {
              if (res === void 0 || res === null || res === '') {
                return $rootScope.message('Invalid response.', 'warning');
              } else if (res.code) {
                return $rootScope.message(res.message, 'warning');
              } else {

                vm.memberRoles.list.splice(index, 1)
                $rootScope.message('"' + member.name.first + ' ' + member.name.last + '" is successfully removed.', 'success');


                if (member.idCON === $rootScope.user.idCON) {

                  $rootScope.user = res.user;
                  if ($rootScope.viewAs.user.idCON !== $rootScope.user.idCON) {

                    $rootScope.viewAs.set(res.user);
                  }
                  return $location.path('/teammembers');
                }
              }
            })["finally"](function () {
              return self.inProgress.remove(member.idCON);
            });
          }
          return false;
        }
      }
    };
    vm.members.load.start();

    vm.queue = {
      list: [],
      load: {
        inProgress: false,
        error: '',
        start: function () {
          var process;
          this.inProgress = true;
          this.error = '';
          process = this.processInvite;
          return $http.get(BASEURL + "checklist_invites-get.php?queue=1").success(function (res) {
            if (res === void 0 || res === null || res === '') {
              return vm.templates.load.error = 'Error loading Invites! (Server not responding properly.)';
            } else if (res.code) {
              return vm.queue.load.error = "Error loading Invites: (" + res.code + ") " + res.message;
            } else if (res.invites !== void 0 && res.invites.length) {
              return vm.queue.list = res.invites.map(process);
            }
          }).error(function (err) {
            return vm.queue.load.error = 'Error loading Templates! (Sever not responding.)';
          })["finally"](function () {
            return vm.queue.load.inProgress = false;
          });
        },
        processInvite: function (raw) {
          var processed;
          processed = $.extend({}, raw, {
            accepting: false,
            rejecting: false,
            accept: function () {
              return $rootScope.message('This function is under construction.');
            },
            reject: function () {
              var invite;
              if (this.rejecting) {
                return false;
              }
              this.rejecting = true;
              invite = this;
              return $http.post(BASEURL + "checklist_invite-destroy.php", {
                idCFC: invite.id
              }, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache: false
              }).success(function (res) {
                if (res === void 0 || res === null || res === '') {
                  return $rootScope.message('Error rejecting Checklist. Server not responding properly.', 'warning');
                } else if (res.code) {
                  return $rootScope.message("Error deleting Checklist: (" + res.code + "): " + res.message, 'warning');
                } else {
                  vm.queue.list.remove(invite);
                  return $rootScope.message('Invite Rejected');
                }
              }).error(function (err) {
                return $rootScope.message('Error rejecting Checklist. Server not responding.', 'warning');
              })["finally"](function () {
                return invite.deleting = false;
              });
            }
          });
          return processed;
        }
      }
    };
    vm.queue.load.start();
    vm.memberInvites = {
      load: {
        inProgress: true,
        error: '',
        execute: function () {
          var self;
          self = vm.memberInvites.load;
          self.error = '';
          return $http.get(BASEURL + 'subscription_invites-get.php').then(function (d) {
            var res;
            if (typeof d !== 'object') {
              return self.error = "Server not responding properly.";
            } else {
              res = d.data;
              if (typeof res !== 'object') {
                return self.error = "Server response not understood.";
              } else {
                return vm.memberInvites.invites = res.invites;
              }
            }
          }, function (err) {
            return self.error = "Error talking to server.";
          }).then(function () {
            return self.inProgress = false;
          });
        }
      },
      invites: [],
      invite: {
        send: {
          inProgress: false,
          email: '',
          role_type: '',
          phone: '',
          first_name: '',
          last_name: '',

          execute: function () {
            var self;
            vm.inviting = true;

            $mdDialog.hide();
            vm.isLoader = true;

            self = vm.memberInvites.invite.send;
            if (self.email === $rootScope.user.email) {
              vm.isLoader = false;
              return $rootScope.message('You cannot invite yourself!', 'warning');
            }
            self.inProgress = true;

            api.subscriptions.invite(self.email, self.role_type, self.phone, self.first_name, self.last_name).error(function (res) {
              vm.isLoader = false;
              return $rootScope.message('Error inviting.', 'warning');
            }).success(function (res) {
              vm.isLoader = false;
              vm.inviting = false;
              if (res === void 0 || res === null || res === '') {
                return $rootScope.message('Invalid response.', 'warning');
              } else if (res.code) {
                return $rootScope.message(res.message, 'warning');
              } else {
                $rootScope.message('Invitation sent.', 'success');
                return vm.memberInvites.invites.push(res.invite);
              }
            })["finally"](function () {
              return self.inProgress = false;
            });
            return false;
          }
        },
        withdraw: {
          inProgress: [],
          execute: function (invite) {
            vm.inviting = true;
            var self;
            self = vm.memberInvites.invite.withdraw;
            self.inProgress.push(invite.id);

            api.subscriptions.withdrawInvite(invite).error(function (res) {
              $rootScope.message('Error withdrawing invitation.', 'warning');
            }).success(function (res) {
              vm.inviting = false;;
              if (res === void 0 || res === null || res === '') {
                return $rootScope.message('Invalid response.', 'warning');
              } else if (res.code) {
                return $rootScope.message(res.message, 'warning');
              } else {
                $rootScope.message('Invitation withdrawn.', 'success');
                $mdDialog.hide();
                return vm.memberInvites.invites.remove(invite);
              }
            })["finally"](function () {
              return self.inProgress.remove(invite.id);
            });
            return false;
          }
        }
      }
    };
    vm.memberInvites.load.execute();


    $scope.$on('event:userLoaded', function () {

      if (!vm.members.load.inProgress && !vm.members.list) {

        vm.members.load.start();
      }
    });




    function openSubscriptionDialog(item) {
      vm.item = item;
      vm.title = 'Add Licenses';
      vm.alreadyclicked = false;
      vm.plan = '';
      vm.stepSeconds = false;

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/teammembers/dialogs/subscription-dialog.html',
        clickOutsideToClose: false
      });
    };

    function openRoleTypeDialog(item) {
      vm.item = item;
      vm.title = 'Role Type';

      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/teammembers/dialogs/roletype-dialog.html',
        clickOutsideToClose: false
      });

    };

    function closeDialog() {
      $mdDialog.hide();
      vm.stepFirst = true;


    }

    function saveRoleType(update, id) {

      return $http.post(BASEURL + 'role-permission.php',
        {
          name: vm.name,
          item_type: 'roleType',
          type: update ? 'update' : (id ? 'delete' : 'create'),
          id: update ? update.id : (id ? id : '')
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).success(function (res) {
          if (res.type == 'success') {
            vm.roleTypes = res.roleType;

            vm.name = update ? vm.name : '';
            $rootScope.message("New role type has been" + update ? 'updated' : 'created' + "successfully", 'success');
          }
          else {
            $rootScope.message(res.type, 'warning');

          }

        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        });

    }

    vm.getRoleType = getRoleType;
    function getRoleType() {
      $http.post(BASEURL + 'role-permission.php', {
        item_type: 'roleType',
        type: 'get'
      })
        .success(function (res) {
          vm.roleTypes = res.roleType;

        });
    };
    getRoleType();

    function ConfirmDeleteRoleType(id) {
      saveRoleType('', id);

    }
    vm.roledata = false;
    function EditRoleType(item) {
      vm.cancelButton = true;
      vm.roledata = item;
      vm.name = item.name;
    }
    vm.cancelButton = false;
    vm.cancelSave = cancelSave;
    function cancelSave() {
      vm.roledata = null;
      vm.name = null;
      vm.cancelButton = false;
    }


    ///get Plans

    vm.getAllPlans = getAllPlans;

    function getAllPlans() {
      return $http.post(BASEURL + 'role-permission.php', {
        item_type: 'plan',
        type: 'getplan'
      }).success(function (res) {
        if (res.type == 'success') {
          vm.plans = res.plan;

        }
      })
    };

    getAllPlans();

    vm.getSinglePlanDetail = getSinglePlanDetail;
    vm.stepFirst = true;
    function getSinglePlanDetail() {
      vm.alreadyclicked = true;



      return $http.post(BASEURL + 'role-permission.php', {
        item_type: 'plan',
        type: 'getPlanBySlug',
        id: vm.plan
      }).success(function (res) {
        if (res.type == 'success') {
          vm.stepFirst = false;
          vm.stepSeconds = true;
          vm.planDetail = res.plan[0];
          var token = res.token;

          braintree.setup(token, 'dropin', {
            container: 'dropin-container',
            onReady: function () {
              jQuery('#payment-button').removeClass('d-none')
            }
          });

        }
      })

    };

    vm.getUserRoles = getUserRoles;

    function getUserRoles() {
      $http.post(BASEURL + 'role-permission.php', {
        item_type: 'plan',
        type: 'getroles'
      }).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          vm.memberRoles = res.plan;
          vm.rolevalues = Object.values(vm.memberRoles.roles);
          vm.rolekeys = Object.keys(vm.memberRoles.roles);

          vm.logged_user_roles = $cookies.get('logged_user_roles');
          vm.logged_user_id = $cookies.get('logged_user_id');

        }
      })
    }
    getUserRoles();

    vm.alreadyclicked = false;

    function addLicence(item) {

      localStorage.setItem('payment_detail', JSON.stringify(item));
      $scope.payment_detail = item;

    }

  
    $scope.payment_method_nonce = function () {

      if ($stateParams.payment_method_nonce && JSON.parse(localStorage.payment_detail)) {

        var item = JSON.parse(localStorage.payment_detail);
        $http.post(BASEURL + 'role-permission.php', {
          item_type: 'plan',
          type: 'payment',
          id: item.id,
          payment_method_nonce: $stateParams.payment_method_nonce,
          braintree_plan: item.braintree_plan,

        }).success(function (res) {
          if (res.type == 'success') {
            $scope.payment_detail = '';
            vm.currentItem = 1;
            getUserRoles();
          }
        })

      }

    };
    $scope.payment_method_nonce();

    vm.changeRole = changeRole;
    function changeRole(id, role_id, toggle, roles) {
      var user_roles = $cookies.get('logged_user_roles');
      var $role_selected = '';
      for (var k in roles) {
        if (role_id == roles[k])
          $role_selected = k;

      }

      if ($role_selected != '') {
        if ($role_selected == 'Account Owner' || $role_selected == 'Controller') {
          if ($role_selected == 'Controller') {
            $role_selected = 'Account Owner';
          }
          if (user_roles.indexOf($role_selected) == -1) {
            $rootScope.message('You do not have permission', 'warning');
            return;
          }
        }
      }



      vm.isLoader = true;
      $http.post(BASEURL + 'role-permission.php', {
        item_type: 'plan',
        type: 'asignroles',
        user_id: id,
        role_id: role_id,
        toggle: toggle == '-1' ? 'add' : 'remove'
      }).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {

          getSubUser();

          vm.logged_user_roles = $cookies.get('logged_user_roles');



          var logged_user_id = $cookies.get("logged_user_id");

          if (id == logged_user_id) {
            if (toggle == '-1') {

              if (vm.logged_user_roles.indexOf($role_selected) == -1) {
                vm.logged_user_roles = vm.logged_user_roles + ',' + $role_selected;
                $cookies.put('logged_user_roles', vm.logged_user_roles);
              }

            }
            else {
              if (vm.logged_user_roles.indexOf($role_selected) != -1) {
                vm.logged_user_roles = vm.logged_user_roles.replace($role_selected, "");
                vm.logged_user_roles = vm.logged_user_roles.replace(/(.+),$/, '$1');
                var role_array = vm.logged_user_roles.split(',');
                var unique_role = role_array.filter(function (e) { return e });
                vm.logged_user_roles = unique_role.toString();
                $cookies.put('logged_user_roles', vm.logged_user_roles);

              }
            }
          }

          getUserRoles();
        } else {
          $rootScope.message(res.message, 'warning');
        }
      })

    };

    vm.changeTab = function (tabName) {
      if (tabName == 'Subscription') vm.myvalue = true;
      else vm.myvalue = false;

    }

    vm.addUser = addUser;

    function addUser(item) {
      if (item !== 'subscribed') {
        $mdDialog.show({
          scope: $scope,
          preserveScope: true,
          templateUrl: 'app/main/teammembers/dialogs/licence-dialog.html',
          clickOutsideToClose: false
        });
      } else {
        vm.title = 'Add User';
        $mdDialog.show({
          scope: $scope,
          preserveScope: true,
          templateUrl: 'app/main/teammembers/dialogs/adduser-dialog.html',
          clickOutsideToClose: false
        });
      }
    };

    vm.checkRole = checkRole;
    vm.permission_to_add_subscription = [];
    function checkRole(item) {
      vm.permission_to_add_subscription.push(item.includes("Controller"));
    }
    $scope.IsVisible = [];
    function cancelSubscription(id, index) {
      vm.isLoader = true;
      $http.post(BASEURL + 'role-permission.php', {
        item_type: 'plan',
        type: 'cancelsubscription',
        id: id,
      }).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          $scope.IsVisible[index] = true;
          $scope.delete_plain = true;
          $rootScope.message('Plan has been deleted successfully', 'success');
        } else {
          $rootScope.message(res.message, 'warning');
        }
      })
    };

    function getSubscriptions() {
      return $http.post(BASEURL + 'role-permission.php', {
        item_type: 'plan',
        type: 'getsubscription'
      }).success(function (res) {
        vm.isLoader = false;
        if (res.type == 'success') {
          vm.getsubscriptions = res.plan;
        } else {
          $rootScope.message(res.message, 'warning');
        }
      })
    };

    getSubscriptions();





    ///get Plans

    (
      function getBillings() {

        return $http.get(BASEURL + "coe-get.php?t=billing").success(function (res) {
          if (res.type == 'success') {

            vm.billings = res.billings;

          }
        })
      }()
    );




    function openSubscriptionListDialog(items) {
      vm.isLoader = false;
      vm.items = items;
      vm.title = 'Subscription List';
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/teammembers/dialogs/subscription-list-dialog.html',
        clickOutsideToClose: false
      });
    }


    vm.submenu = [
      { link: 'user', title: 'My Profile', active: false },
      { link: 'contacts', title: 'Contacts', active: false },
      { link: 'organization', title: 'Organization', active: false },
      { link: 'teammembers', title: 'Account', active: true }
    ];




    function addManagerTeam(item) {
      vm.title = 'Edit Manager Permissions';
      $mdDialog.show({
        scope: $scope,
        preserveScope: true,
        templateUrl: 'app/main/teammembers/dialogs/addManagerUser.html',
        clickOutsideToClose: false
      });

    };

    function getSubUser() {

      return $http.post(BASEURL + 'role-permission.php',
        {
          item_type: 'plan',
          type: 'getmanagerlist'

        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).success(function (res) {
          if (res.type == 'success') {
            vm.managers_teamusers = res.plan;

          }

        })
    };

    getSubUser();

    $scope.changeIncludeAll = function (value) {

      if (!value) {
        vm.manager_include_all = false;
        vm.manager.include_all = false;

      }
      else {
        vm.manager_include_all = true;
        vm.manager.include_all = true;

      }

      if (value) var SendValue = 'true';
      else var SendValue = 'false';

      var teamusers = Object.keys(vm.managers_teamusers.team_users);

      teamusers.forEach(function (role) {

        $scope.getManagerTeamUser_id('role', vm.managers_teamusers.team_users[role][0].role_type_id, vm.managers_teamusers.team_users[role][0].role_type_name, SendValue)
      });

    }


    $scope.getManagerTeamUser_id = function (type, id, roleName, value) {



      if (type === 'user') {

        if (value) {
          console.log('true value')

          if (vm.manager_include_all) vm.manager.include_all = "1";

          vm.managers_teamusers.team_users[roleName].forEach(function (users) {

            if (users.user_id == id) {

              users.selected = true;
              var index = users.manger_ids.indexOf(vm.manager_id)
              if (index === -1) {

                users.manger_ids.push(vm.manager_id);
              }

            }

          })


          PushSpliceArray('push', $scope.selectedUserList, id)


        } else {

          // to deselct the include all option
          vm.manager_include_all = false;
          vm.manager.include_all = "0";

          vm.managers_teamusers.team_users[roleName].forEach(function (users) {
            if (users.user_id == id) {

              var index = users.manger_ids.indexOf(vm.manager_id)
              if (index != -1) {
                users.manger_ids.splice(index, 1);
              }

              vm.RoleIdToDeselect = users.role_type_id;
              users.selected = false;

            }
          })


          PushSpliceArray('splice', $scope.selectedUserList, id)


          //managing the id of role  of selected user in managers array
          vm.managers_teamusers.managers.forEach(function (managers) {
            if (managers.user_id === vm.manager_id) {

              var RoleTypeIndex = managers.role_type_ids.indexOf(vm.RoleIdToDeselect);

              if (RoleTypeIndex != -1) {

                managers.role_type_ids.splice(RoleTypeIndex, 1);
              }

            }

          })

        }

      } else if (type === 'role') {


        vm.managers_teamusers.team_users[roleName].forEach(function (users) {

          if (value == 'true') {

            if (vm.manager_include_all) vm.manager.include_all = "1";

            var IdExists = users.manger_ids.includes(vm.manager_id)
            var index = users.manger_ids.indexOf(vm.manager_id)

            if (index === -1) {
              users.manger_ids.push(vm.manager_id);

            }
            PushSpliceArray('push', $scope.selectedUserList, users.user_id);
            users.selected = true;

            //managing the id of selected role in managers array
            vm.managers_teamusers.managers.forEach(function (managers) {
              if (managers.user_id === vm.manager_id) {

                var RoleTypeIndex = managers.role_type_ids.indexOf(id);

                if (RoleTypeIndex === -1) {
                  managers.role_type_ids.push(id)
                }


              }

            })


            // managing the selectedRoleList array to form the request
            var selectedRoleListIndex = $scope.selectedRoleList.indexOf(id);

            if (selectedRoleListIndex === -1) {
              $scope.selectedRoleList.push(id)
            }

          } else {

            var IdExists = users.manger_ids.includes(vm.manager_id)
            var index = users.manger_ids.indexOf(vm.manager_id)

            if (index !== -1) {
              users.manger_ids.splice(index, 1);
              users.selected = false;

            }

            // to deselct the include all option
            vm.manager_include_all = false;
            vm.manager.include_all = "0";


            PushSpliceArray('splice', $scope.selectedUserList, users.user_id);
            users.selected = false;

            //managing the id of selected role in managers array

            vm.managers_teamusers.managers.forEach(function (managers) {
              if (managers.user_id === vm.manager_id) {
                var RoleTypeIndex = managers.role_type_ids.indexOf(id);
                if (RoleTypeIndex != -1) {
                  managers.role_type_ids.splice(RoleTypeIndex, 1);
                }
              }
            })


            // managing the selectedRoleList array to form the request
            var selectedRoleListIndex = $scope.selectedRoleList.indexOf(id);

            if (selectedRoleListIndex != -1) {
              $scope.selectedRoleList.splice(selectedRoleListIndex, 1);
            }

          }
        })
      }

    }

    function PushSpliceArray(type, array, element) {

      var index = array.indexOf(element);

      if (type === 'push') {

        if (index === -1) {
          array.push(element)
        }

      } else if (type === 'splice') {
        if (index != -1) {
          array.splice(index, 1);
        }
      }

    }


    function changeManager(manager) {

      vm.manager = manager;
      vm.manager_id = manager.user_id;
      vm.role_type_ids = manager.role_type_ids;

      if (manager.include_all === "1") vm.manager_include_all = true;
      else vm.manager_include_all = false;

      $scope.selectedUserList = [];
      $scope.selectedRoleList = [];

      for (var role in vm.managers_teamusers.team_users) {

        var RoleId = '';
        vm.managers_teamusers.team_users[role].forEach(function (users) {

          var IdExists = users.manger_ids.includes(vm.manager_id)
          if (IdExists) {
            $scope.selectedUserList.push(users.user_id);
            users.selected = true;
          } else {
            users.selected = false;
          }

          RoleId = users.role_type_id;

        })


        vm.managers_teamusers.managers.forEach(function (manager) {

          if (manager.user_id === vm.manager_id) {
            if (manager.role_type_ids.includes(RoleId)) {
              PushSpliceArray('push', $scope.selectedRoleList, RoleId)
            }
          }

        })

      }

    }


    function addTeam() {

      var data = {
        item_type: 'plan',
        type: 'savemanagerlist',
        manager_id: vm.manager_id,
        user_ids: $scope.selectedUserList,
        role_ids: $scope.selectedRoleList,
        include_all: vm.manager_include_all
      };


      return $http.post(BASEURL + 'role-permission.php', data,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }).success(function (res) {
          if (res.type == 'success') {
            $mdDialog.hide();
            vm.manager_id = false;
            $rootScope.message('Data Submitted successfully', 'success');
          }
        })
    };

    $scope.ScreenLockManage = function (action) {
      if (action === 'unlock') vm.ScreenLocked = false;
      else if (action === 'lock') vm.ScreenLocked = true;

    }

  }

})();