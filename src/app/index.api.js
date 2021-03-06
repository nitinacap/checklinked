(function () {
  'use strict';

  angular
    .module('checklinked')
    .factory('api', apiService);

  /** @ngInject */
  function apiService($rootScope, $cacheFactory, $resource, $http, $location, $cookies) {

    var api = {};
    // Base Url
    api.baseUrl = 'app/data/';

    var BASEURL = 'https://checklinked.azurewebsites.net/api_security/ajax/';

    //var BASEURL = 'http://wdc1.acapqa.net:8081/api_security/ajax/';

    //var BASEURL = 'http://localhost:8081/dist/ajax/';

    // api.sample = $resource(api.baseUrl + 'sample/sample.json');
    api.generateCacheLocal = function () {
      

      var PREFIX, USERNAME, cache;

      cache = $cacheFactory('someCache', {});

      PREFIX = 'Cacher::';

      cache.get = function (key) {
        var lruEntry;
        lruEntry = localStorage.getItem(PREFIX + key);
        if (!lruEntry) {
          return;
        }
        lruEntry = JSON.parse(lruEntry);
        if (lruEntry.data === void 0) {
          return lruEntry;
        }
        return lruEntry.data;
      };
      cache.put = function (key, value) {
        if (typeof value.then === 'function') {
          return value.then(function (value) {
            return localStorage.setItem(PREFIX + key, JSON.stringify(value));
          });
        } else {
          return localStorage.setItem(PREFIX + key, JSON.stringify(value));
        }
      };
      cache.remove = function (key) {
        return localStorage.removeItem(PREFIX + key);
      };
      cache.removeAll = function () {
        var i, j, key, len, results;
        results = [];
        for (key = j = 0, len = localStorage.length; j < len; key = ++j) {
          i = localStorage[key];
          if (key.indexOf(PREFIX === 0)) {
            results.push(localStorage.removeItem(key));
          } else {
            results.push(void 0);
          }
        }
        return results;
      };
      cache.nuke = function () {
        return localStorage.clear();
      };
      return cache;
    };

    api.cache = {
      local: api.generateCacheLocal()
    };
    

    ////////////////////// USER (rootScope.user)
    api.user = {

      get: function ($rootScope) {
        return {
          user: function () {
            return $rootScope.user;
          }
        };
      }
    };


    ////////////////////// LOGIN
    api.login = {
     

      doAuth: function (creds) {
         
        return $http.post(BASEURL + 'login-doAuth.php', creds, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).error(function (resp) {
          return $rootScope.message("Unknown error communicating with server. " + resp, 'warning');
        }).success(function (resp) {

          var loginTime, path;
          if (resp.code || resp.type === 'error') {
            return $rootScope.message(resp.message, 'warning');
          } else {
            $rootScope.user = resp.user;
        // // 
            $rootScope.viewAs.set(resp.viewAs);
            $rootScope.orderThanksData = '';
            //path = CacheLocal.get('navTo');
            loginTime = new Date();
            if (path) {
              return $location.path(path);
            } else {
              return $location.path('/user');
            }
          }
        });
      }
    }

    ////////////////////// CREATE
    api.create = {

      register: function (reg) {

        var rdata = {
          email: reg.email,
          phone: reg.phone,
          notification: reg.notifications,
          password: reg.password,
          c_password: reg.password2,
          first_name: reg.type ? reg.first : reg.name.first,
          last_name: reg.type ? reg.last : reg.name.last,
          role_type: (reg.type) ? reg.role_type : '',
          organization_id: (reg.type && reg.organization_id) ? reg.organization_id : '',
          invitee_user_id: (reg.type && reg.invitee_user_id) ? reg.invitee_user_id : '',
          base_url: reg.baseURL
        };
        return $http.post(BASEURL + 'account-create.php', rdata, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
          },
          withCredentials: false
        })
      }
    };


    ////////////////////// CONFIRM
    api.confirm = {

      validate: function (validateId) {
        return $http.post(BASEURL + 'account-create-confirm.php', {
          key: validateId
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }
    };

    ////////////////////// ACCOUNT
    api.account = {

      update: function (info) {
        return $http.post(BASEURL + "account-update-post.php", {
          info: info,

        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return res;
          }).success(function (res) {
            return res;
          });
      },
      setting: function (value, type) {
        return $http.post(BASEURL + "account-setting.php", {
          value: value,
          type: type
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return res;
          }).success(function (res) {
            return res;
          });
      }

    };


    ////////////////////// FOLDERS
    api.folders = {

      get: function (token) {
        return $http.get(BASEURL + 'coe-get.php?t=folder&token=' + token);
      },
      add: function (name, description, link, attachment, order, folder_id) {
        //return $http.post(BASEURL+'coe-post.php', {
   
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'folder',
          name: name,
          description: description,
          link: link,
          attachment: attachment,
          order: order,
          id: folder_id,
          sub_type: folder_id ? 'duplicate' : ''
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      edit: function (editPack, token) {
        return $http.post(BASEURL + 'coe-edit.php', {
          pack: editPack,
          token: token
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      destroy: function (id, token) {
        return $http.post(BASEURL + 'coe-destroy.php', {
          type: 'folder',
          id: id,
          token: token
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }
    };


    ////////////////////// GROUPS
    api.groups = {

      get: function (idCFC, token) {
        return $http.get(BASEURL + "coe-get.php?t=group&p=" + idCFC, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.groups;
        });
      },
      add: function (name, order, to, description, link, duplicate, attachment) {
         
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'group',
          name: name,
          order: order,
          parentID: to,
          description: description,
          link: link,
          id: duplicate ? duplicate : '',
          sub_type: duplicate ? 'duplicate' : '',
          attachment : attachment
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      edit: function (editPack, token) {
        return $http.post(BASEURL + 'coe-edit.php', {
          pack: editPack,
          token: token
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      destroy: function (id, token) {
        return $http.post(BASEURL + 'coe-destroy.php', {
          type: 'group',
          id: id,
          token: token
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }

    };

    ////////////////////// CHECKLISTS
    api.checklists = {

      get: function (idCHK) {
        if (idCHK == null) {
          idCHK = '';
        }
        return $http.get(BASEURL + "coe-get.php?t=checklist&idCHK=" + idCHK, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.checklists;
        });
      },
      getGroup: function (idGROUP, token) {
        if (idGROUP == null) {
          idGROUP = '';
        }
        return $http.get(BASEURL + "coe-get.php?t=checklist&p=" + idGROUP + "&token=" + token, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.checklists;
        });
      },
      add: function (name, order, to, token, description, checklist_id, sub_type, attachment, link) {
        
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'checklist',
          name: name,
          order: order,
          parentID: to,
          token: token,
          description: description,
          id: checklist_id,
          sub_type: sub_type,
          attachment: attachment,
          link : link
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      edit: function (editPack) {
        return $http.post(BASEURL + "coe-edit.php", {
          pack: editPack
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      destroy: function (id) {
        console.log('destroy checklist')
        return $http.post(BASEURL + 'coe-destroy.php', {
          type: 'checklist',
          id: id
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      publish: function (id, name, description, type, pvt, attachment) {

         
        if (pvt == null) {
          pvt = false;
        }
        return $http.post(BASEURL + 'checklist-publish.php', {
          id: id,
          name: name,
          description: description,
          type: type,
          pvt: pvt,
          attachment: attachment
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      searchForTemplates: function (criteria) {
        return $http.get(BASEURL + "templates-get.php?n=" + criteria.name + "&o=" + criteria.organization + "&a=" + criteria.author + "&v=" + criteria.version + "&t=" + criteria.type, {
          cache: false
        });
      },
      createFromTemplate: function (idCTMPL, idGRP, type, attachmnts) {
        
        return $http.post(BASEURL + 'checklist-post-fromTemplate.php', {
          idPARENT: idGRP,
          idCTMPL: idCTMPL,
          type: type, 
          attachments: attachmnts
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      toggleComplete: function (idCFC, complete) {
        if (complete == null) {
          complete = 'toggle';
        }
        return $http.post(BASEURL + 'checklist-toggle_complete-post.php', {
          idCFC: idCFC,
          complete: complete
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      getOrgChecklists: function () {
        return $http.get(BASEURL + 'checklists_org-get.php').then(function (d) {
          var res;
          if (d === void 0 || d === null || d === '') {
            res = {
              code: -1,
              message: "Server not responding properly."
            };
          } else {
            res = d.data;
          }
          return res;
        });
      },
      getLinkedUsers: function (idCHK, token) {
        return $http.get(BASEURL + "checklist_linkedUsers-get.php?idCHK=" + idCHK + "&token=" + token).then(function (d) {
          var res;
          if (d === void 0 || d === null || d === '') {
            res = {
              code: -1,
              message: "Server not responding properly."
            };
          } else {
            res = d.data;
          }
          return res;
        });
      },
      invite: {
        send: function (idCON, idCHK, findLink, idACC, type, user_id, token) {
          var pack;
          if (findLink == null) {
            findLink = false;
          }
          if (idACC == null) {
            idACC = '';
          }
          if (type == null) {
            type = '';
          }
          if (type === 'group') {
            pack = {
              type: type,
              group: idCHK,
              idCON: idCON,
              idACC: idACC,
              findLink: true,
              user_id: user_id,
              token: token
            };
          } else {
            pack = {
              idCON: idCON,
              idACC: idACC,
              idCHK: idCHK,
              findLink: findLink,
              type: type,
              user_id: user_id,
              token: token
            };
          }
          return $http.post(BASEURL + 'checklist_invite-post.php', pack, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
              // 'Access-Control-Allow-Headers': 'Cache-Control, Pragma, Origin, Authorization, Content-Type, X-Requested-With',
              // 'Access-Control-Allow-Origin': '*',
              // 'Access-Control-Allow-Credentials': 'true',
              // 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
            },
            cache: false
          }).success(function (res) {
            if (res === void 0 || res === null || res === '') {

            } else if (res.code) {

            } else {
              $rootScope.sendInviteCountUpdatePing(idCON, 'checklist');
              return res;
            }
          });
        },
        accept: function (invite, idPARENT, name, order) {
          var id;
          id = invite.type === 'group' ? invite.id : invite.checklist.id;
          return $http.post(BASEURL + 'checklist_accept-post.php', {
            id: id,
            idPARENT: idPARENT,
            name: name,
            order: order,
            type: invite.type
          }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            }).success(function (res) {
              if (res === void 0 || res === null || res === '') {

              } else if (res.code) {

              } else {
                $rootScope.sendInviteCountUpdatePing($rootScope.user.idCON, invite.type);
                return res;
              }
            });
        },
        get: function (idCHK) {
          if (idCHK == null) {
            idCHK = '';
          }
          return $http.get(BASEURL + "checklist_invites-get.php?idCHK=" + idCHK, {
            cache: false
          }).success(function (res) {
            return res;
          });
        },
        destroy: function (invite) {
          return $http.post(BASEURL + "checklist_invite-destroy.php", {
            idINVITE: invite.id,
            type: invite.type,
            rid: invite.rid
          }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            }).success(function (res) {
              if (res === void 0 || res === null || res === '') {

              } else if (res.code) {

              } else {
                $rootScope.sendInviteCountUpdatePing(invite.users.recipient.id, 'checklist');
                return res;
              }
            });
        }
      },
      
      NewScheduler: function (data) {

        return $http.post(BASEURL + "schedule.php", data, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        }).success(function (res) {
          if (res === void 0 || res === null || res === '') {

          } else if (res.code) {

          } else {
            // $rootScope.sendInviteCountUpdatePing(invite.users.recipient.id, 'checklist');
            return res;
          }
        });
      },
      // ?type=structure
      getAddRowStructure: function (data) {

        return $http.get(BASEURL + "schedule.php?type=structure").then(function (d) {
          var res;
          if (d === void 0 || d === null || d === '') {
            res = {
              code: -1,
              message: "Server not responding properly."
            };
          } else {
            res = d.data;
          }
          return res;
        });
      },
    };

    ////////////////////// SECTIONS
    api.sections = {

      get: function (idCHK) {
        return $http.get(BASEURL + "coe-get.php?t=section&idCHK=" + idCHK, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.sections;
        });
      },
      add: function (name, order, to) {
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'section',
          name: name,
          order: order,
          parentID: to
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      destroy: function (id) {
        return $http.post(BASEURL + 'coe-destroy.php', {
          type: 'section',
          id: id
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }

    };

    ////////////////////// HEADINGS
    api.headings = {

      get: function (idCHK) {
        return $http.get(BASEURL + "coe-get.php?t=heading&idCHK=" + idCHK, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.headings;
        });
      },
      getParent: function (id_parent, token) {
        return $http.get(BASEURL + "coe-get.php?t=heading&p=" + id_parent + "&token=" + token, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.headings;
        });
      },
      add: function (name, order, to) {
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'heading',
          name: name,
          order: order,
          parentID: to
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      destroy: function (id) {
        return $http.post(BASEURL + 'coe-destroy.php', {
          type: 'heading',
          id: id
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }
    };


    ////////////////////// ITEMS
    api.items = {

      get: function (idCHK) {
        return $http.get(BASEURL + "coe-get.php?t=item&idCHK=" + idCHK, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          var i, item, items, key, len, ref, results;
          items = [];
          ref = res.items;
          results = [];
          for (item = i = 0, len = ref ? ref.length : 0; i < len; item = ++i) {
            key = ref[item];
            results.push(items.push($.extend({}, item, {
              checkbox: {
                applies: 0,
                complies: 0,
                conflicts: 0
              }
            })));
          }
          return results;
        });
      },
      getParent: function (id_parent, token) {
        return $http.get(BASEURL + "coe-get.php?t=item&p=" + id_parent + "&token=" + token, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          var i, item, items, key, len, ref, results;
          items = [];
          ref = res.items;
          results = [];
          for (item = i = 0, len = ref ? ref.length : 0; i < len; item = ++i) {
            key = ref[item];
            results.push(items.push($.extend({}, item, {
              checkbox: {
                applies: 0,
                complies: 0,
                conflicts: 0
              }
            })));
          }
          return results;
        });
      },
      add: function (name, order, to, type, info, item_type, alert, option, alert_sms,mobile) {
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
        if (option == null) {
          option = '';
        }
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'item',
          name: name,
          info: info,
          order: order,
          dataType: option,
          item_type: item_type,
          item_alert: alert,
          parentID: to,
          option: type,
          alert_sms: alert_sms,
          mobile : mobile
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      destroy: function (id) {
        return $http.post(BASEURL + 'coe-destroy.php', {
          type: 'item',
          id: id
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      hasConflict: function (applies, complies) {
        if (applies === true && complies === !true) {
          return true;
        }
      },
      reorder: function (id, dropPosition, type, parentID, arrayNextOrder, arrayNextId, arrayMovedOrder, arrayMovedId, arrayPreviousOrder, arrayPreviousId) {
        return $http.post(BASEURL + 'coe-reorder.php', {
          id: id,
          dropPosition: dropPosition,
          type: type,
          parentID: parentID,
          nextOrder: arrayNextOrder,
          nextId: arrayNextId,
          movedOrder: arrayMovedOrder,
          movedId: arrayMovedId,
          previousOrder: arrayPreviousOrder,
          previousId: arrayPreviousId

        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }

    };


    ////////////////////// CHECKBOX
    api.checkbox = {

      get: function (idCHK, idCON) {
        if (idCON == null) {
          idCON = '';
        }
        return $http.get(BASEURL + "checkboxes-get.php?idCHK=" + idCHK + "&u=" + idCON, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          // // 
          return res.checkboxes;
        });
      },
      toggle: function (idCLI, idCON, which, type) {
        return $http.post(BASEURL + 'checkbox-toggle.php', {
          idCLI: idCLI,
          idCON: idCON,
          which: which,
          item_type: type
        }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message("Couldn't update checkbox. Unknown error", 'warning');
          }).success(function (res) {
            if (res.code) {
             
             
              $rootScope.message("Couldn't update checkbox. Error: (" + res.code + "): " + res.message, 'warning');
            
            }
            return res;
          });
      }

    };

    ////////////////////// CONTACTS
    api.contacts = {

      get: function () {
        return $http.get(BASEURL + 'friendships-get.php', {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.contacts;
        });
      },
      getdirectmessage: function (data) {
        return $http.post(BASEURL + 'contact-message.php', data, {
          cache: false
        }).error(function (res) {
          // $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.contacts;
        });
      },
      find: function (q) {
        if (q == null) {
          q = '';
        }
        return $http.post(BASEURL + "contacts-find.php", q, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res;
        });
      },
      add: function (name, order, to) {
        return $http.post(BASEURL + '', {
          type: 'group',
          name: name,
          order: order,
          parentID: to
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      destroy: function (idCON) {
        return $http.post(BASEURL + 'friendship_invite-destroy.php', {
          idCON: idCON
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Error removiong contact.  Unknown.', 'warning');
          }).success(function (res) {
            if (res.code) {
              return $rootScope.message(res.message, 'warning');
            } else {
              return $rootScope.message('Contact Deleted');
              return res;
            }
          });
      },
      invite: {
        accept: function (idCON) {
          return $http.post(BASEURL + 'friendship_accept-post.php', {
            idCON: idCON
          }, {
              headers: {
                'Content-Type': 'applicatio/x-www-form-urlencoded'
              },
              cache: false
            }).error(function (res) {
              return $rootScope.message('Error accepting invite.  Unknown.', 'warning');
            }).success(function (res) {
              if (res.code) {
                return $rootScope.message(res.message, 'warning');
              } else {
                $rootScope.sendInviteCountUpdatePing($rootScope.user.idCON, 'friendship');
                $rootScope.message('Contact Invitation Accepted');
                return res;
              }
            });
        },
        send: function (idCON, message) {
          return $http.post(BASEURL + 'friendship_invite-post.php', {
            idCON: idCON,
            message: message
          }, {
              headers: {
                'Content-Type': 'applicatio/x-www-form-urlencoded'
              },
              cache: false
            }).error(function (res) {
              return $rootScope.message('Error sending invite.  Unknown.', 'warning');
            }).success(function (res) {
              if (res.code) {
                return $rootScope.message(res.message, 'warning');
              } else {
                $rootScope.message('Contact Invitation Sent');
                return res;
              }
            });
        },
        remove: function (idCON, type) {
          return $http.post(BASEURL + 'friendship_invite-destroy.php', {
            idCON: idCON,
            'action': type
          }, {
              headers: {
                'Content-Type': 'applicatio/x-www-form-urlencoded'
              },
              cache: false
            }).error(function (res) {
              return $rootScope.message('Error removing invite.  Unknown.', 'warning');
            }).success(function (res) {
              if (res.code) {
                return $rootScope.message(res.message, 'warning');
              } else {
                $rootScope.sendInviteCountUpdatePing($rootScope.user.idCON, 'friendship');
                $rootScope.message('Invitation Withdrawn');
                return res;
              }
            });
        },
        reject: function (idCON) {
          return $http.post(BASEURL + 'friendship_invite-destroy.php', {
            idCON: idCON
          }, {
              headers: {
                'Content-Type': 'applicatio/x-www-form-urlencoded'
              },
              cache: false
            }).error(function (res) {
              return $rootScope.message('Error removing invite.  Unknown.', 'warning');
            }).success(function (res) {
              if (res.code) {
                return $rootScope.message(res.message, 'warning');
              } else {
                $rootScope.sendInviteCountUpdatePing($rootScope.user.idCON, 'friendship');
                return $rootScope.message('Invitation Rejected');
                return res;
              }
            });

        }
      }

    };

    ////////////////////// FEEDS
    api.feed = {

      get: function (chunk) {
        if (chunk == null) {
          chunk = null;
        }
        return $http.get(BASEURL + "feed-get.php", {
          cache: false
        }).success(function (res) {
          return res;
        });
      },
      destroy: function (idFDI) {
        return $http.post(BASEURL + 'fdi-destroy.php', {
          idFDI: idFDI
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Error removing notification.  Unknown.', 'warning');
          }).success(function (res) {
            if (res.code) {
              return $rootScope.message(res.message, 'warning');
            } else {
              return $rootScope.message('Notification Deleted');
              return res;
            }
          });
      }

    }

    ////////////////////// CONVERSATIONS
    api.conversations = {

      getMocks: function () {
        return $http.get("https://checklinked.com/mocks/conversationPosts.json", {
          cache: false
        }).success(function (res) {
          return res;
        });
      },
      get: function (id, skip, type) {
        if (skip == null) {
          skip = 0;
        }
        return $http.get(BASEURL + "posts-get.php?id=" + id + "&s=" + skip + "&type=" + type, {
          cache: false
        }).error(function (res) {
          return $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res;
        });
      },
      getnew: function (id) {
        return $http.get(BASEURL + "message-get.php?id=" + id, {
          cache: false
        }).error(function (res) {
          return $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res;
        });
      },
      add: function (id, text, itemType, producerType) {
        return $http.post(BASEURL + 'posts-post.php', {
          id: id,
          text: text,
          itemType: itemType,
          producerType: producerType
        }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not send message. Unknown error.', 'warning');
          }).success(function (res) {
            $rootScope.message('Message Sent.', 'success');
            return res;
          });
      },
      reply: function (idVIEW, text, producerType, itemType) {
        return $http.post(BASEURL + 'posts-post.php', {
          id: idVIEW,
          text: text,
          itemType: itemType,
          producerType: producerType
        }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not send message. Unknown error.', 'warning');
          }).success(function (res) {
            $rootScope.message('Message Sent.', 'success');
            return res;
          });
      },
      sent: function (id, skip) {
        if (skip == null) {
          skip = 0;
        }
        return $http.get(BASEURL + "posts-sent-get.php?id=" + id + "&s=" + skip, {
          cache: false
        }).error(function (res) {
          return $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res;
        });
      }
    }

    ////////////////////////DASHBOARD
    api.dashboard = {

      labels: {
        hide: function (idLBL) {
          return $http.post(BASEURL + 'dashboard_label_hide-post.php', {
            idLBL: idLBL
          }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            });
        },
        add: function (type , name, explanation ,checkboxinfo, option) {

          return $http.post(BASEURL + 'dashboard_label-post.php', {
            type: type,
            name: name,
            explanation: explanation,
            option : option,
            checkboxinfo: checkboxinfo ? checkboxinfo : ''
          
          }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            });
        },
        update: function (idITEM, selected) {
          return $http.post(BASEURL + 'dashboard_updateItemLabels-post.php', {
            idITEM: idITEM,
            selected: selected
          }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            });
        }
      }
    }


    //////////////////////SUBSCRIPTIONS
    api.subscriptions = {

      getCurrentOffers: function () {
        return $http.get(BASEURL + "subscription_offers-get.php", {
          cache: false
        }).error(function (res) {
          return $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res;
        });
      },
      getInvites: function (idSUB) {
        return $http.get(BASEURL + "subscription_invites-get.php?idSUB=" + idSUB, {
          cache: false
        }).error(function (res) {
          return $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res;
        });
      },
      getInvite: function (idSUI) {
        return $http.get(BASEURL + "subscription_invite-get.php?idSUI=" + idSUI, {
          cache: false
        }).error(function (res) {
          return $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res;
        });
      },
      finalize: function (offer, pmtMethod) {
        return $http.post(BASEURL + 'subscription_finalize-post.php', {
          offer: offer,
          pmtMethod: pmtMethod
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      makeSubscriptionActive: function (idSUB) {
        return $http.post(BASEURL + 'subscription_makeActive-post.php', {
          idSUB: idSUB
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      invite: function (email, role_type, phone, first_name, last_name) {
        return $http.post(BASEURL + 'subscription_invite_send-post.php', {
          email: email,
          role_type: role_type,
          phone: phone,
          first_name: first_name,
          last_name: last_name,
          //organization: localStorage.getItem("org_name"),
          created_by: $cookies.get("useridCON")
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      withdrawInvite: function (invite) {
        return $http.post(BASEURL + 'subscription_invite_withdraw-post.php', {
          suiRID: invite.rid
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      offboardMember: function (member) {
        return $http.post(BASEURL + 'organization_member_offboard-post.php', {
          idCON: member.idCON
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      acceptInvite: function (idSUI, option, details) {
        var pack;
        if (option === 'login') {
          pack = {
            idSUI: idSUI,
            option: option,
            username: details.username,
            password: details.password
          };
        } else if (option === 'signup') {
          pack = {
            idSUI: idSUI,
            option: option,
            contact: details.contact,
            existing_data: details.existing_data ? details.existing_data : '',
            organization_id: details.organization_id ? details.organization_id : '',
            password: details.password
          };
        }
        return $http.post(BASEURL + 'subscription_invite_accept-post.php', pack, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        });
      }
    }


    ////////////////////// ATTACHMENTS
    api.attachments = {

      add: function (pID, pType, aws, name, size, label) {
        return $http.post(BASEURL + 'attachments-finish_upload-post.php', {
          pID: pID,
          pType: pType,
          aws: aws,
          name: name,
          size: size,
          label: label
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      parent: function (idPARENT, token) {
        return $http.get(BASEURL + "attachments-get.php?t=group&p=" + idPARENT + "&token=" + token, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.attachments;
        });
      },
      checklist: function (idCHK) {
        return $http.get(BASEURL + 'attachments-get.php?idCHK=' + idCHK, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.attachments;
        });
      },
      attachment: function (idATT) {
        return $http.get(BASEURL + 'attachments-get.php?idATT=' + idATT, {
          cache: false
        }).error(function (res) {
          $rootScope.message('Error talking to server', 'warning');
        }).success(function (res) {
          return res.attacments;
        });
      }

    }

    ////////////////////// SUMMARY
    api.summary = {

      evaluateItem: function (item, checkboxes) {

          

        var left, right;
        item.conflicts = false;
        item.nonCompliant = false;
        left = this.evaluateCheckbox(checkboxes[0]);
        right = this.evaluateCheckbox(checkboxes[1]);
        if (checkboxes[1] !== void 0) {
          if (left !== right) {
            item.conflicts = true;
          }
        }
        if (left === 'non-compliant') {
          checkboxes[0].nonCompliant = true;
        } else if (checkboxes[0] !== void 0) {
          checkboxes[0].nonCompliant = false;
        }
        if (right === 'non-compliant') {
          checkboxes[1].nonCompliant = true;
        } else if (checkboxes[1] !== void 0) {
          checkboxes[1].nonCompliant = false;
        }
        item.checkbox = checkboxes;
        if (left === 'non-compliant' || right === 'non-compliant') {
          item.nonCompliant = true;
        }
        return item;
      },
      evaluateCheckbox: function (checkbox) {
        var condition;
        condition = 'blank';
        if (checkbox === void 0 || checkbox === []) {

        } else if (checkbox.applies && checkbox.complies) {
          condition = 'compliant';
        } else if (checkbox.applies) {
          condition = 'non-compliant';
        } else if (checkbox.complies) {
          condition = 'irrelevant';
        }
        return condition;
      },
      reports: {
        get: function () {
          return $http.get(BASEURL + 'conflictReports-get.php', {
            cache: false
          }).success(function (res) {
            return res;
          });
        },
        request: function () {
          return $http.post(BASEURL + 'conflictReports-request-post.php', {
            idsCHK: [],
            requestedAt: ''
          }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            });
        },
        delete: function (id) {
          return $http.post(BASEURL + 'conflictReports-request-post.php', {
            idsCHK: [],
            requestedAt: '',
            id: id,
            type: 'delete'
          }, {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              cache: false
            });
        }
      }

    }


    //////////////////////TEAMMEBERS
    api.teammembers = {

      get: function () {
        return $http.get(BASEURL + 'organization_members-get.php');
      }

    }

    api.item = {
      paste: function (origin, destination, type, action_type, move_item_id) {
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'cutCopyPaste',
          parent_origin_id: origin,
          parent_destination_id: destination,
          item_move_type: type,
          action_type: action_type,
          move_item_id: move_item_id,
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      undo: function (id) {
        return $http.get(BASEURL + 'coe-get.php?t=undo&id=' + id);
      }
    }


    api.mail = {
      inbox: $resource(api.baseUrl + 'mail/inbox.json')
    };

    /// stats API
    // api.userstats = {
    //   create: function (type, title, id, user_id) {
    //     return $http.post(BASEURL + 'user-stats.php', {
    //       type: type,
    //       title:title,
    //       id:id,
    //       user_id:user_id
    //     }, { headers: {
    //           'Content-Type': 'application/x-www-form-urlencoded' },
    //            cache: false
    //       });
    //   }
    // };


    ////////////////////// NOTIFICATIONS
    api.notifications = {
      get: function (token) {
        return $http.get(BASEURL + "coe-get.php?t=notification&token=" + token);
      },

      read: function (id, type, read_array) {
        return $http.post(BASEURL + 'coe-post.php', {
          type: type,
          id: id,
          read_array: read_array

        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      count_notifi: function () {
        var user_id = $cookies.get("useridCON");

        
        return $http.post(BASEURL + 'coe-post.php', {
          type: 'notification-count', id: user_id
        }, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          }).success(function (resp) {
            
            if (resp.type === "success") {
              // $rootScope.notificationCountCheck = resp.item;
              //// 
              $rootScope.socketio.emit('real_time_notification', resp.item);
              // // 
            
              // $rootScope.socketio.$broadcast('real_time_notification', resp.item);
              // // 
            }

          }).error(function (resp) {

            // if(resp.message) $rootScope.message(resp.message, 'error');
            // $rootScope.message('Server Error', 'error');
            // // 
          });
      },
      // count_notifi: function () {
      //   var user_id = $cookies.get("useridCON");

      //   // 
      //   return $http.post(BASEURL + 'coe-post.php', {
      //     type: 'notification-count', id: user_id
      //   }, {
      //       headers: {
      //         'Content-Type': 'application/x-www-form-urlencoded'
      //       },
      //       cache: false
      //     }).success(function (resp) {
      //       // 
      //       if (resp.type == 'success') {

      //         $rootScope.socketio.emit('real_time_notification', resp.item);
      //         // 
      //       }

      //     });
      // }

    };


    api.isUserRole = function (value) {
      var user_Roles = $cookies.get('logged_user_roles');
      return user_Roles.includes(value);

    }

    $rootScope.createStats = function (type, title, id) {
      $http.post(BASEURL + 'user-stats.php', {
        type: type,
        title: title,
        id: id,
        user_id: $cookies.get('useridCON')
      }, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          cache: false
        });
    };

    api.templates = {
      search_templates: function (data) {
        return $http.post(BASEURL + 'templates-search.php', data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      },
      getLabels: function () {
    
        return $http.get(BASEURL + 'dashboard_label-get.php', {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not create data table. Unknown error.', 'warning');
          }).success(function (res) {
            // // 
            if(res.type == "success"){
              
              return res.labels;
             }
            
           
            
           
          });
      }
    }

    
    ////////////////////// Data Point
    api.datapoint = {

      datapoint: function (data) {
        return $http.post(BASEURL + 'datapoint.php', data, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }
    };

    api.organization = {

      get_all_spreadsheets: function () {
        return $http.get(BASEURL + 'coe-get.php?t=spreadsheet', {
        // return $http.get(BASEURL + 'orgSpreadSheetDatabase.php', {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }
    };

        ////////////////////// Data Point
        api.alert = {

          save: function (data) {
            return $http.post(BASEURL + 'alerts.php', 
            {
              name: data.name,
              info: data.info,
              checklist_id: data.idCHK,
              item_id: data.id,
              item_type: data.item_type,
              user_id: $cookies.get("useridCON"),
              type: 'save'

          }, {
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                cache: false
              });
          },
          get: function() {
            return $http.post(BASEURL + 'alerts.php', {
              user_id: $cookies.get("useridCON"),
              type: 'get'

          }, { cache: false
              });
          }

        };

    /**Data Table Function Start Here ** */
    api.dataTable = {

     
      add: function (name,row_num,column_num,section_id,data_table_structure,table_id) {
    
        return $http.post(BASEURL + 'data-table.php', {
          section_id: section_id,
          table_structure: data_table_structure,
          type: 'table_structure',
          name: name,
          row: row_num,
          column: column_num,
          table_id : table_id
        }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not create data table. Unknown error.', 'warning');
          }).success(function (res) {
            // // 
            if(res.code == -1){
              $rootScope.message(res.message, 'warning');
             }
             else{
              if(table_id != ''){
                $rootScope.message('Table  Updated successfully.', 'success');
               }
               else{
                $rootScope.message('Table  Created successfully.', 'success');
               }
             }
           
            
            return res;
          });
      },
      getDataTableTemplate: function () {
      
        return $http.post(BASEURL + 'data-table.php', {
          type: 'datatable-template',
         }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not get data table template. Unknown error.', 'warning');
          }).success(function (res) {

            if(res.code == -1){
                $rootScope.message(res.message, 'warning');
             }
             else{
                  
             }
           
            
            return res;
          });
      },
      saveTableAsTemplate: function (table_id,name,description) {
        console.log('saveTableAsTemplate',table_id)
        
        return $http.post(BASEURL + 'data-table.php', {
          type: 'datatable-template-create',
          table_id: table_id,
          name: name,
          description: description
         }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not create data table template. Unknown error.', 'warning');
          }).success(function (res) {

            if(res.code == -1){
                $rootScope.message(res.message, 'warning');
             }
             else{
                    $rootScope.message(res.message, 'success');
             }
           
            
            return res;
          });
      },
      downloadTable: function (section_id,template_id) {
    
        return $http.post(BASEURL + 'data-table.php', {
          type: 'datatable-template-download',
          section_id: section_id,
          template_id: template_id
         }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not downlaod data table template. Unknown error.', 'warning');
          }).success(function (res) {

            if(res.code == -1){
                $rootScope.message(res.message, 'warning');
             }
             else{
                    $rootScope.message(res.message, 'success');
             }
           
            
            return res;
          });
      },
      changeTableRow: function (index,column,table_str,table_id,request_type,rowIndex,headArr,data_table_data) {
        //  ;
        var res_type;
        // var res_type = request_type == 'update' ? 'Duplicate' : 'Delete';
        if(request_type == 'update'){
          res_type =  'Duplicate';
        }
        else if(request_type == 'delete'){
          res_type =  'Delete';
        }
        else{
           res_type =  'Header';
        }
        //  ;
        return $http.post(BASEURL + 'data-table.php', {
          table_structure: table_str,
          type: 'update-row',
          index: index,
          column: column,
          table_id : table_id,
          request_type : request_type,
          rowIndex : rowIndex,
          headArr : headArr,
          data_table_values: data_table_data
        }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
           
            return $rootScope.message('Could not '+ res_type+' data table row. Unknown error.', 'warning');
          }).success(function (res) {
            //  ;
             if(res.code == -1){
              $rootScope.message(res.message, 'warning');
             }
             else{
                  $rootScope.message(res_type+' Row  successfully.', 'success');
             }
              
            
            
            return res;
          });
      },
      saveTable: function (heading_id,table_id,data_table_data) {
        
        return $http.post(BASEURL +'data-table.php', {
          heading_id: heading_id,
          data_table_values: data_table_data,
          type: 'data_table_save',
          table_id : table_id
        }, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message('Could not save data table. Unknown error.', 'warning');
          }).success(function (res) {

            if(res.code == -1){
                $rootScope.message(res.message, 'warning');
             }
             else{
                if(table_id != ''){
                  $rootScope.message('Table  Saved successfully.', 'success');
                }
             }
             
            
            return res;
          });
      },
    }

    /****** Organization Spreadsheet ******/
    api.organization = {

      get_all_spreadsheets: function () {
        return $http.get(BASEURL + 'coe-get.php?t=spreadsheet', {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            cache: false
          });
      }
    }

    

    /** End Here  Data Table functions */

     /****** Reports starts  ******/
     api.reports = {

      reports: function (data) {
        
        return $http.post(BASEURL +'report-dashboard.php', data, {
            headers: {
              'Content-Type': 'applicatio/x-www-form-urlencoded'
            },
            cache: false
          }).error(function (res) {
            return $rootScope.message(res.message, 'error');
          }).success(function (res) {

            // if(res.code == -1){
            //     $rootScope.message(res.message, 'warning');
            //  }
             
            
            return res;
          });
      },
    }
      /******  Reports Ends ******/


    return api;
  }

})();
