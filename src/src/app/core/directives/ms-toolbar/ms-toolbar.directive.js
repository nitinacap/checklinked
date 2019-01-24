(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('pageToolbar', pagetoolbarDirective)
        .directive('fileModel', fileModelDirective);

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


    function fileModelDirective($parse){

        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
               element.bind('change', function(){
               $parse(attrs.fileModel).assign(scope,element[0].files)
                  scope.$apply();
               });
            }
         };
    }


    
    


})();
