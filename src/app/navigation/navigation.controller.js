(function ()
{
    'use strict';

    angular
        .module('app.navigation')
        .controller('NavigationController', NavigationController);

    /** @ngInject */
    function NavigationController($scope, $rootScope)
    {
        var vm = this;

        // Data
        vm.bodyEl = angular.element('body');
        vm.folded = false;
        vm.msScrollOptions = {
            suppressScrollX: true
        };

        // Methods
        vm.toggleMsNavigationFolded = toggleMsNavigationFolded;

        //////////

        /**
         * Toggle folded status
         */
        function toggleMsNavigationFolded()
        {
            vm.folded = !vm.folded;
            $rootScope.folded = vm.folded;
            if (vm.folded){
            $('.title').hide();
            $('md-sidenav').addClass('vertical-navigation-hide');
                $('.admin-logo').attr('src','/assets/images/logos/small-logo.jpg').addClass('pl-20');
        }else{
            $('.title').show();
            $('md-sidenav').removeClass('vertical-navigation-hide');
                $('.admin-logo').attr('src', '/assets/images/logos/checklinked.png');
        }
        }

        // Close the mobile menu on $stateChangeSuccess
        $scope.$on('$stateChangeSuccess', function ()
        {
            vm.bodyEl.removeClass('ms-navigation-horizontal-mobile-menu-active');
        });
    }

})();