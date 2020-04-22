(function () {
    'use strict';

    angular
        .module('app.core')
        .directive('pageToolbar', pagetoolbarDirective)
        .directive('fileModelDymamic', fileModelDymamicDirective)
        .directive('msscroll', msscrollDirective)
        .directive('checklinkedTest', checklinkedTestDirective)
        .directive('capitalize', capitalizeDirective)
        .directive('fileModel', fileModelDirective)
        // .directive('dragToReorder', dragToReorderDirective)
            
        
        // }).call(this);
    


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

    // function dragToReorderDirective() {
    //     return { 
    //       link: function(scope, element, attrs) {
    //         var dragOverHandler, draggingClassName, dropHandler, droppingAboveClassName, droppingBelowClassName, droppingClassName; 
    //         if (scope[attrs.dragToReorder] == null) {
    //           throw 'Must specify the list to reorder';
    //         } 
  
    //         /*
    //           drag stuff
    //          */
    //         draggingClassName = 'dragging';
    //         element.attr('draggable', true);
    //         element.on('dragstart', function(e) {
    //           element.addClass(draggingClassName);
    //           return e.dataTransfer.setData('text/plain', scope.$index);
    //         });
    //         element.on('dragend', function() {
    //           return element.removeClass(draggingClassName);
    //         });
  
    //         /*
    //           drop stuff
    //          */
    //         droppingClassName = 'dropping';
    //         droppingAboveClassName = 'dropping-above';
    //         droppingBelowClassName = 'dropping-below';
    //         dragOverHandler = function(e) {
    //           var offsetY;
    //           e.preventDefault();
    //           offsetY = e.offsetY || e.layerY;
    //           if (offsetY < (this.offsetHeight / 2)) {
    //             element.removeClass(droppingBelowClassName);
    //             return element.addClass(droppingAboveClassName);
    //           } else {
    //             element.removeClass(droppingAboveClassName);
    //             return element.addClass(droppingBelowClassName);
    //           }
    //         };
    //         dropHandler = function(e) {
    //           var droppedItemIndex, i, itemToMove, newIndex, theList, _i, _j;
    //           e.preventDefault();
    //           droppedItemIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    //           theList = scope[attrs.dragToReorder];
    //           newIndex = null;
    //           if (element.hasClass(droppingAboveClassName)) {
    //             if (droppedItemIndex < scope.$index) {
    //               newIndex = scope.$index - 1;
    //             } else {
    //               newIndex = scope.$index;
    //             }
    //           } else {
    //             if (droppedItemIndex < scope.$index) {
    //               newIndex = scope.$index;
    //             } else {
    //               newIndex = scope.$index + 1;
    //             }
    //           }
    //           itemToMove = theList[droppedItemIndex];
    //           if (newIndex > droppedItemIndex) {
    //             for (i = _i = droppedItemIndex; _i < newIndex; i = _i += 1) {
    //               theList[i] = theList[i + 1];
    //             }
    //           } else if (newIndex < droppedItemIndex) {
    //             for (i = _j = droppedItemIndex; _j > newIndex; i = _j += -1) {
    //               theList[i] = theList[i - 1];
    //             }
    //           }
    //           theList[newIndex] = itemToMove;
    //           scope.$apply(function() {
    //             return scope.$emit('dragToReorder.reordered', {
    //               array: theList,
    //               item: itemToMove,
    //               from: droppedItemIndex,
    //               to: newIndex
    //             });
    //           });
    //           element.removeClass(droppingClassName);
    //           element.removeClass(droppingAboveClassName);
    //           element.removeClass(droppingBelowClassName);
    //           return element.off('drop', dropHandler);
    //         };
    //         element.on('dragenter', function(e) {
    //           if (element.hasClass(draggingClassName)) {
    //             return;
    //           }
    //           element.addClass(droppingClassName);
    //           element.on('dragover', dragOverHandler);
    //           return element.on('drop', dropHandler);
    //         });
    //         return element.on('dragleave', function(e) {
    //           element.removeClass(droppingClassName);
    //           element.removeClass(droppingAboveClassName);
    //           element.removeClass(droppingBelowClassName);
    //           element.off('dragover', dragOverHandler);
    //           return element.off('drop', dropHandler);
    //         });
    //       }
    //     };
    //   }
    // ]);




})();
