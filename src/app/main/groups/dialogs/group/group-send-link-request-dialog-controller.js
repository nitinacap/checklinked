(function ()
{
    'use strict';

    angular
        .module('app.groups')
        .controller('GroupSendLinkRequestDialogController', GroupSendLinkRequestDialogController);

    /** @ngInject */
    function GroupSendLinkRequestDialogController($mdDialog, api, GROUP, $document, $filter, $mdSidenav, $rootScope, $scope, $http)
    {

     var vm = this;
	// Data
    vm.group = GROUP;

	console.log('vm.group', vm.group);

    vm.closeDialog = closeDialog;

	vm.user = $rootScope.user;

	vm.find = {
      inProgress: false,
      showError: function(msg, code) {
        if (code == null) {
          code = 0;
        }
        this.error.code = code;
        this.error.message = msg;
        return this.error.show = true;
      },
      error: {
        code: 0,
        message: '',
        show: false
      },
      criteria: '',
      status: function(link) {
        var idCON, invites, result, status, type;
        status = '';
        idCON = link.id;
        if (idCON === 0) {
          type = 'organization';
          invites = $filter('filter')($scope.invites, {
            users: {
              recipient: {
                id: 0,
                idACC: link.id
              }
            }
          }, true);
          if (invites.length) {
            status = 'Sent';
          } else {
            status = 'Stranger';
          }
        } else {
          type = 'contact';
          invites = $filter('filter')(vm.invites, {
            users: {
              recipient: {
                id: idCON
              }
            }
          }, true);
          if (invites.length) {
            if (invites[0].m_accepted === '') {
              status = 'Sent';
            } else {
              status = 'Linked';
            }
          } else {
            status = 'Stranger';
          }
        }
        result = {
          status: status,
          invites: invites,
          type: type
        };
        return result;
      },
      processLink: function(raw) {
        var info, processed, item;
        info = vm.find.status(raw);
        item = vm.group;

        processed = $.extend({}, raw, {
          requesting: false,
          type: info.type,
          status: info.status,
          invite: info.invites[0],
          request: function() {
            var itemID, link;
            link = this;
            link.requesting = true;
            itemID = item;
            return api.checklists.invite.send(raw.id, itemID, true, raw.idACC, 'group').success(function(res) {
              var id, invite, status;
              if (res === void 0 || res === null || res === '') {
                return $rootScope.message('Error sending Link Request.  Server not responding properly.', 'warning');
              } else if (res.code) {
                return $rootScope.message("Error sending Link Request. (" + res.code + "): " + res.message, 'warning');
              } else {
                invite = res.invites[0];
                id = invite.id;

                $rootScope.socketio.emit('feed_subscribe', {
                  idCON: invite.users.recipient.id,
                  ids: [id]
                });
                $rootScope.notify({
                  idFDI: invite.notifications.received,
                  id: id,
                  type: 'invite'
                });
                vm.invites.push(res.invites[0]);
                status = vm.find.status(link);
                link.status = status.status;
                return link.invite = status.invites[0];
              }
            }).error(function(res) {
              return $rootScope.message('Error sending Link Request.  Server not responding.', 'warning');
            })["finally"](function() {
              return link.requesting = false;
            });
          },
          withdraw: function() {
            return $rootScope.message('This feature is under development.');
          }
        });
        return processed;
      },
      submit: function() {
        var criteria;
        criteria  = vm.find.criteria;


        if (criteria === '') {
          return $rootScope.message('No find criteria provided!');
        }
        criteria = encodeURI(criteria);

        console.log('encodeURI(criteria)', criteria);
        vm.inProgress = true;
				return $http.post("https://checklinked.com/ajax/links_find-post.php", {
          criteria: criteria,
          idCHK: null
        }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).success(function(res) {
          var found;
          if (res === void 0 || res === null || res === '') {
            return $rootScope.message('Server not responding properly.');
          } else if (res.code) {
            vm.found = [];
            return vm.find.showError(res.message, res.code);
          } else {
            console.log('server response: ', res);
            vm.find.error.show = false;
            vm.invites = res.invites;
            found = {
              organizations: res.organizations.map(vm.find.processLink),
              contacts: res.contacts.map(vm.find.processLink)
            };
            console.log('find result: ', found);
            vm.found = found.organizations.concat(found.contacts);
          }
        }).error(function(res) {
          return $rootScope.message('Server not responding.');
        })["finally"](function() {
          vm.find.inProgress = false;
        });
      }
    };
    vm.found = [];
    vm.invites = [];

       function closeDialog()
        {
        	console.log('close me');
           	$mdDialog.hide();
        }



    }
})();
