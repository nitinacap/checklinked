(function ()
{
    'use strict';

    angular
        .module('app.queue')
        .controller('QueueController', QueueController);

    /** @ngInject */
    function QueueController($rootScope, $http, $scope, api, $mdSidenav, $mdDialog, $document)
    {

    var vm = this;

	vm.toggleSidenav = toggleSidenav;
	vm.closeDialog = closeDialog;
	vm.openAcceptLinkRequestDialog = openAcceptLinkRequestDialog;
	vm.queue = [];

	function closeDialog() {
    	$mdDialog.hide();
    }

	function toggleSidenav(sidenavId) {
		$mdSidenav(sidenavId).toggle();
    }

	function openAcceptLinkRequestDialog(ev)	{

            $mdDialog.show({
                scope			   : $scope,
				preserveScope	   : true,
                templateUrl        : 'app/main/queue/dialogs/queue/accept-link-request-dialog.html',
                parent             : angular.element($document.find('#queue')),
                targetEvent        : ev,
                clickOutsideToClose: true
            });
        }


	$scope.$on('event:rolesUpdated', function() {});

    $scope.$on('event:membersUpdated', function() {
      return vm.members.load.start();
    });
    vm.members = {
      list: [],
      roles: [],
      load: {
        inProgress: false,
        error: '',
        start: function(idCON) {
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
            }).error(function(err) {
              console.log('Error loading team members: ', err);
              return vm.members.load.error = 'Error loading Team Members! (Sever not responding.)';
            })["finally"](function() {
              return vm.members.load.inProgress = false;
            });
          } else {

          }
        },
        processMember: function(raw) {
          var processed, roles;
          roles = $.extend({}, raw.roles, {
            setting: [],
            set: function(role, willHave) {
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
              }).success(function(res) {
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
              }).error(function(err) {
                self.setting.remove(role);
                return $rootScope.message('Error updating Team Member role.  Server not responding.', 'warning');
              })["finally"](function() {
                return self.setting.remove(role);
              });
            }
          });
          processed = raw;
          processed.roles = roles;
          return processed;
        }
      }
    };
    vm.members.load.start();
    vm.templates = {
      list: [],
      load: {
        inProgress: false,
        error: '',
        start: function() {
          var process;
          this.inProgress = true;
          this.error = '';
          process = this.processTemplate;
					return $http.get(BASEURL + "templates-get.php?org=1&noXML=1").success(function (res) {
            if (res === void 0 || res === null || res === '') {
              console.log('Error loading templates: ', res);
              return vm.templates.load.error = 'Error loading Templates! (Server not responding properly.)';
            } else if (res.code) {
              return vm.templates.load.error = "Error loading Templates: (" + res.code + ") " + res.message;
            } else if (res.templates !== void 0 && res.templates.length) {
              return vm.templates.list = res.templates.map(process);
            }
          }).error(function(err) {
            console.log('Error loading team members: ', err);
            return vm.templates.load.error = 'Error loading Templates! (Sever not responding.)';
          })["finally"](function() {
            return vm.templates.load.inProgress = false;
          });
        },
        processTemplate: function(raw) {
          var processed;
          processed = $.extend({}, raw, {
            revising: false,
            deleting: false,
            revise: function() {
              return $rootScope.message('This function is under construction.');
            },
            remove: function() {
              var template;
              if (this.deleting) {
                return false;
              }
              console.log('deleting template', template);
              this.deleting = true;
              template = this;
							return $http.post(BASEURL + "template_delete-post.php", {
                template: template
              }, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache: false
              }).success(function(res) {
                if (res === void 0 || res === null || res === '') {
                  return $rootScope.message('Error deleting Template. Server not responding properly.', 'warning');
                } else if (res.code) {
                  return $rootScope.message("Error deleting Template: (" + res.code + "): " + res.message, 'warning');
                } else {
                  vm.templates.list.remove(template);
                  console.log('template deleted', template, vm.templates.list);
                  return $rootScope.message('Template Deleted');
                }
              }).error(function(err) {
                return $rootScope.message('Error deleting Template. Server not responding.', 'warning');
              })["finally"](function() {
                return template.deleting = false;
              });
            }
          });
          return processed;
        }
      }
    };
    vm.templates.load.start();
    vm.queue = {
      list: [],
      load: {
        inProgress: false,
        error: '',
        start: function() {
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
          }).error(function(err) {
            console.log('Error loading team members: ', err);
            return vm.queue.load.error = 'Error loading Templates! (Sever not responding.)';
          })["finally"](function() {
            return vm.queue.load.inProgress = false;
          });
        },
        processInvite: function(raw) {
          var processed;
          processed = $.extend({}, raw, {
            accepting: false,
            rejecting: false,
            accept: function() {
              vm.queue.assign.invite = this;
              //$('#select-org-contact-modal').modal('show');
             vm.openAcceptLinkRequestDialog();
              return false;
            },
            reject: function() {
              var invite;
              if (this.rejecting) {
                return false;
              }
              this.rejecting = true;
              invite = this;
							return $http.post(BASEURL + "checklist_invite-destroy.php", {
                idINVITE: invite.id,
                type: invite.type
              }, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache: false
              }).success(function(res) {
                if (res === void 0 || res === null || res === '') {
                  return $rootScope.message('Error rejecting Checklist. Server not responding properly.', 'warning');
                } else if (res.code) {
                  return $rootScope.message("Error deleting Checklist: (" + res.code + "): " + res.message, 'warning');
                } else {
                  vm.queue.list.remove(invite);
                  return $rootScope.message('Invite Rejected');
                }
              }).error(function(err) {
                return $rootScope.message('Error rejecting Checklist. Server not responding.', 'warning');
              })["finally"](function() {
                return invite.rejecting = false;
              });
            }
          });
          return processed;
        }
      },
      assign: {
        inProgress: false,
        contact: null,
        invite: null,
        assign: function(contact) {
          var self;
          this.contact = contact;
          this.inProgress = true;
          console.log('assigning', this);
          self = this;
					return $http.post(BASEURL + "checklist_invite-assign.php", {
            idCON: self.contact.idCON,
            idINVITE: self.invite.id,
            type: self.invite.type
          }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          }).success(function(res) {
            if (res === void 0 || res === null || res === '') {
              return $rootScope.message('Error assigning Invite. Server not responding properly.', 'warning');
            } else if (res.code) {
              return $rootScope.message("Error assigning Invite: (" + res.code + "): " + res.message, 'warning');
            } else {
              vm.queue.list.remove(self.invite);
              self.invite = null;
              vm.closeDialog();
              return $rootScope.message('Invite Assigned');
            }
          }).error(function(err) {
            return $rootScope.message('Error assigning Invite. Server not responding.', 'warning');
          })["finally"](function() {
            self.inProgress = false;
            return self.contact = null;
          });
        }
      }
    };
    vm.queue.load.start();
    }

})();
