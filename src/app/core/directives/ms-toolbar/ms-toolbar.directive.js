(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('pageToolbar', pagetoolbarDirective);

    /** @ngInject */

    function pagetoolbarDirective() {

        return {
            restrict: 'EA',
            scope: {
                active: '=',
                datas: '='
            },
            templateUrl: 'app/core/directives/ms-toolbar/toolbarmenu.html',
            link: function (scope, element, attrs) {
                if (attrs.details) {
                    scope.active = attrs.active;
                    scope.datas = attrs.datas;

                }

            }

        }
    };
    


})();
