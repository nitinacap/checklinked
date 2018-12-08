(function () {
  'use strict';

  angular
    .module('app.teammembers')
    .controller('TeamMembersController', TeamMembersController);

  /** @ngInject */
  function TeamMembersController($rootScope, $http, $scope, api, $mdSidenav) {

    var vm = this;

    vm.toggleSidenav = toggleSidenav;
    vm.members = [];
    //$scope.members = [];

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
                console.log('Error loading team members: ', res);
                return vm.members.load.error = 'Error loading Team Members! (Server not responding properly.)';
              } else if (res.code) {
                return vm.members.load.error = "Error loading Team Members: (" + res.code + ") " + res.message;
              } else {
                vm.members.roles = res.roles;
                return vm.members.list = res.members.map(process);
              }
            }).error(function (err) {
              console.log('Error loading team members: ', err);
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
        execute: function (member) {
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
            console.log('offboard member', member);
            $http.post(BASEURL + 'organization_member_offboard-post.php', {
              idCON: member.idCON
            }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            }).error(function (res) {
              console.log('member offboard error', member, res);
              return $rootScope.message('Error offboarding member.', 'warning');
            }).success(function (res) {
              if (res === void 0 || res === null || res === '') {
                console.log('member offboard error', member, res);
                return $rootScope.message('Invalid response.', 'warning');
              } else if (res.code) {
                console.log('member offboard error', member, res);
                return $rootScope.message(res.message, 'warning');
              } else {
                vm.members.list.remove(member);
                if (member.idCON === $rootScope.user.idCON) {

                  console.log('offboarded logged in user', res.user);
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
              console.log('Error loading invites: ', res);
              return vm.templates.load.error = 'Error loading Invites! (Server not responding properly.)';
            } else if (res.code) {
              return vm.queue.load.error = "Error loading Invites: (" + res.code + ") " + res.message;
            } else if (res.invites !== void 0 && res.invites.length) {
              return vm.queue.list = res.invites.map(process);
            }
          }).error(function (err) {
            console.log('Error loading team members: ', err);
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
          execute: function () {
            var self;
            self = vm.memberInvites.invite.send;
            if (self.email === $rootScope.user.email) {
              return $rootScope.message('You cannot invite yourself!', 'warning');
            }
            self.inProgress = true;
            console.log('invite', self.email);
            api.subscriptions.invite(self.email).error(function (res) {
              return $rootScope.message('Error inviting.', 'warning');
            }).success(function (res) {
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
            var self;
            self = vm.memberInvites.invite.withdraw;
            self.inProgress.push(invite.id);
            console.log('withdraw invite', invite);
            api.subscriptions.withdrawInvite(invite).error(function (res) {
              console.log('invite withdraw error', invite, res);
              $rootScope.message('Error withdrawing invitation.', 'warning');
            }).success(function (res) {
              if (res === void 0 || res === null || res === '') {
                console.log('invite withdraw error', invite, res);
                return $rootScope.message('Invalid response.', 'warning');
              } else if (res.code) {
                console.log('invite withdraw error', invite, res);
                return $rootScope.message(res.message, 'warning');
              } else {
                $rootScope.message('Invitation withdrawn.', 'success');
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
      console.log('userLoaded Triggered');

      console.log('vm.members.load.inProgress', vm.members.load.inProgress);
      console.log('vm.members.list', vm.members.list);


      if (!vm.members.load.inProgress && !vm.members.list) {

        console.log('Try to load TEAM MEMBERS again');
        vm.members.load.start();
        console.log('vm members', vm.members.list);
      }
    });

    console.log('vm.members', vm.members);
  }

})();
