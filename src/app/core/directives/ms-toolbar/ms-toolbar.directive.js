(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('pageToolbar', pagetoolbarDirective)
        .directive('fileModelDymamic', fileModelDymamicDirective)
        .directive('msscroll', msscrollDirective)
        .directive('checklinkedTest', checklinkedTestDirective)
        .directive('capitalize', capitalizeDirective)
        .directive('fileModel', fileModelDirective);



    /** @ngInject */

    function capitalizeDirective() {

        return {
            require: 'ngModel',
            link: function(scope, element, attrs, capitalizeModelCtrl) {
    
              var capitalizeInputText = function(inputText) {
                if (inputText != undefined) {
                var capitalizedValue = inputText.toUpperCase();
                }
    
                if (inputText === undefined) {
                  inputText = "";
                } else {
                  if (capitalizedValue !== inputText) {
                    capitalizeModelCtrl.$setViewValue(capitalizedValue);
                    capitalizeModelCtrl.$render();
                  }
                }
                return capitalizedValue;
              }
    
              capitalizeModelCtrl.$parsers.push(capitalizeInputText);
              capitalizeInputText(scope[attrs.ngModel]); //This is used to capitalize the initial value.
            }
          };
    };


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

    function checklinkedTestDirective() {
        return {
            restrict: 'EA',
            scope: {
                content: '@',
            },
            templateUrl: 'app/core/directives/ms-toolbar/test.html',
            link: function (scope, element, attrs) {
                if (attrs) {
                    scope.active = attrs.content;

                }

            }

        }
    }


    function fileModelDirective($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                element.bind('change', function () {
                    $parse(attrs.fileModel).assign(scope, element[0].files)
                    scope.$apply();
                });
            }
        };
    }


    function fileModelDymamicDirective($parse) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                var model, modelSetter;

                attrs.$observe('fileModelDymamic', function (fileModelDymamic) {
                    model = $parse(attrs.fileModelDymamic);
                    modelSetter = model.assign;
                });

                element.bind('change', function () {
                    scope.$apply(function () {
                        modelSetter(scope.$parent, element[0].files[0]);
                    });
                });
            }
        };
    }

    function msscrollDirective($window) {
        return function (scope, element, index) {
            element.click(function () {
                var element = angular.element(document.querySelector('#messageHeight' + scope.$index));
                var height = element[0].offsetHeight;
                if (height > 200) {
                    $('#messageHeight' + scope.$index).addClass('messagescroll');
                    var scroll = $('#messageHeight' + scope.$index);
                    scroll.animate({ scrollTop: scroll.prop("scrollHeight") });
                }
            });

        }
    }









})();
