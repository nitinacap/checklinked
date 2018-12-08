(function ()
{
    'use strict';

    angular
        .module('checklinked')
        .controller('MainController', MainController);

    /** @ngInject */
    function MainController($scope, $rootScope)
    {
        // Data



        // Remove the splash screen
        $scope.$on('$viewContentAnimationEnded', function (event)
        {
            if ( event.targetScope.$id === $scope.$id )
            {
                $rootScope.$broadcast('msSplashScreen::remove');
            }
        });

        
    }
})();

var contentWidth = $("#content").outerWidth();
console.log("hello22");
console.log(contentWidth);
$(".nav-fixed-top").css('width', contentWidth);
