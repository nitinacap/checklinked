(function ()
{
    'use strict';

    angular
        .module('app.core')
        .provider('msApi', msApiProvider)
        .factory('dataTable', dataTableProvider);

    /** @ngInject **/
    function msApiProvider()
    {
        /* ----------------- */
        /* Provider          */
        /* ----------------- */
        var provider = this;

        // Inject the $log service
        var $log = angular.injector(['ng']).get('$log');

        // Data
        var baseUrl = '';
        var api = [];

        // Methods
        provider.setBaseUrl = setBaseUrl;
        provider.getBaseUrl = getBaseUrl;
        provider.getApiObject = getApiObject;
        provider.register = register;

        //////////

        /**
         * Set base url for API endpoints
         *
         * @param url {string}
         */
        function setBaseUrl(url)
        {
            baseUrl = url;
        }

        /**
         * Return the base url
         *
         * @returns {string}
         */
        function getBaseUrl()
        {
            return baseUrl;
        }

        /**
         * Return the api object
         *
         * @returns {object}
         */
        function getApiObject()
        {
            return api;
        }

        /**
         * Register API endpoint
         *
         * @param key
         * @param resource
         */
        function register(key, resource)
        {
            if ( !angular.isString(key) )
            {
                $log.error('"path" must be a string (eg. `dashboard.project`)');
                return;
            }

            if ( !angular.isArray(resource) )
            {
                $log.error('"resource" must be an array and it must follow $resource definition');
                return;
            }

            // Store the API object
            api[key] = {
                url          : baseUrl + (resource[0] || ''),
                paramDefaults: resource[1] || [],
                actions      : resource[2] || [],
                options      : resource[3] || {}
            };
        }

        /* ----------------- */
        /* Service           */
        /* ----------------- */
        this.$get = function ($log, $q, $resource, $rootScope)
        {
            // Data

            // Methods
            var service = {
                setBaseUrl: setBaseUrl,
                getBaseUrl: getBaseUrl,
                register  : register,
                resolve   : resolve,
                request   : request
            };

            return service;

            //////////

            /**
             * Resolve an API endpoint
             *
             * @param action {string}
             * @param parameters {object}
             * @returns {promise|boolean}
             */
            function resolve(action, parameters)
            {
                // Emit an event
                $rootScope.$broadcast('msApi::resolveStart');
                
                var actionParts = action.split('@'),
                    resource = actionParts[0],
                    method = actionParts[1],
                    params = parameters || {};

                if ( !resource || !method )
                {
                    $log.error('msApi.resolve requires correct action parameter (resourceName@methodName)');
                    return false;
                }

                // Create a new deferred object
                var deferred = $q.defer();

                // Get the correct resource definition from api object
                var apiObject = api[resource];

                if ( !apiObject )
                {
                    $log.error('Resource "' + resource + '" is not defined in the api service!');
                    deferred.reject('Resource "' + resource + '" is not defined in the api service!');
                }
                else
                {
                    // Generate the $resource object based on the stored API object
                    var resourceObject = $resource(apiObject.url, apiObject.paramDefaults, apiObject.actions, apiObject.options);

                    // Make the call...
                    resourceObject[method](params,

                        // Success
                        function (response)
                        {
                            deferred.resolve(response);

                            // Emit an event
                            $rootScope.$broadcast('msApi::resolveSuccess');
                        },

                        // Error
                        function (response)
                        {
                            deferred.reject(response);

                            // Emit an event
                            $rootScope.$broadcast('msApi::resolveError');
                        }
                    );
                }

                // Return the promise
                return deferred.promise;
            }

            /**
             * Make a request to an API endpoint
             *
             * @param action {string}
             * @param [parameters] {object}
             * @param [success] {function}
             * @param [error] {function}
             *
             * @returns {promise|boolean}
             */
            function request(action, parameters, success, error)
            {
                // Emit an event
                $rootScope.$broadcast('msApi::requestStart');
                
                var actionParts = action.split('@'),
                    resource = actionParts[0],
                    method = actionParts[1],
                    params = parameters || {};

                if ( !resource || !method )
                {
                    $log.error('msApi.resolve requires correct action parameter (resourceName@methodName)');
                    return false;
                }

                // Create a new deferred object
                var deferred = $q.defer();

                // Get the correct resource definition from api object
                var apiObject = api[resource];

                if ( !apiObject )
                {
                    $log.error('Resource "' + resource + '" is not defined in the api service!');
                    deferred.reject('Resource "' + resource + '" is not defined in the api service!');
                }
                else
                {
                    // Generate the $resource object based on the stored API object
                    var resourceObject = $resource(apiObject.url, apiObject.paramDefaults, apiObject.actions, apiObject.options);

                    // Make the call...
                    resourceObject[method](params,

                        // SUCCESS
                        function (response)
                        {
                            // Emit an event
                            $rootScope.$broadcast('msApi::requestSuccess');
                            
                            // Resolve the promise
                            deferred.resolve(response);

                            // Call the success function if there is one
                            if ( angular.isDefined(success) && angular.isFunction(success) )
                            {
                                success(response);
                            }
                        },

                        // ERROR
                        function (response)
                        {
                            // Emit an event
                            $rootScope.$broadcast('msApi::requestError');
                            
                            // Reject the promise
                            deferred.reject(response);

                            // Call the error function if there is one
                            if ( angular.isDefined(error) && angular.isFunction(error) )
                            {
                                error(response);
                            }
                        }
                    );
                }

                // Return the promise
                return deferred.promise;
            }
        };
    }

     /** @ngInject **/
     function dataTableProvider($rootScope)
     {
         /* ----------------- */
         /* Provider          */
         /* ----------------- */
         var provider = this;
 
         // Methods
         provider.getValue = getValue;
         provider.toExcelHeaderArray = toExcelHeaderArray;
         provider.toExcelHeader = toExcelHeader;
         provider.getdetails = getdetails;
         provider.selectPercentage = selectPercentage;
         provider.savingCellStructure = savingCellStructure;
         provider.convertLetterToNumber = convertLetterToNumber;
 
         return provider;
 
         //////////
 
         /**
          * Set base url for API endpoints
          *
          * @param url {string}
          */

          

         function getValue(val){
             val 
              //// 

            if(val == 'decimal'){

              return  [{ "value" : 0},{ "value" : 1},{ "value" : 2}];

            }else if(val == 'currency'){

                return [{ "name": "$", "sign ": "Dollars" }, { "name": "€", "sign ": "Euros" }, { "name": "£", "sign ": "Pounds" }, { "name": "￥", "sign ": "Yen/Yuan" }];

            }else if (val == 'alignTextVal'){

                return [{ "name": "center" }, { "name": "left" }, { "name": "right" }];
            }else if (val == 'TextPostition'){

                return [ { "name": "bottom", "pos": "fa-long-arrow-down" }, { "name": "middle", "pos": "fa-arrows-v" }, { "name": "top", "pos": "fa-long-arrow-up" }];

            }else if (val == 'cell_format'){

                return [{ "name": "None" }, { "name": "Date" }, { "name": "Label" }, { "name": "Text" }, { "name": "Number" }, { "name": "Currency" }, { "name": "Formula" }, { "name": "Data Point" }];

            }else if(val == 'datapoint_functions'){

                return [{ "name": "Sum" }, { "name": "Avg" }];
                
            }else if(val == 'cell_format_for_reports'){

                return [{ "name": "None" }, { "name": "Label" }, { "name": "Data Point" }];
               
           }
            
         }
         function toExcelHeaderArray (rows) {
             var excelHeaderArr = [];
             for(var index = 1; index <= rows; index++) {
                 excelHeaderArr.push(toExcelHeader(index));
             }
             
             return excelHeaderArr;
           }
 
           
             function toExcelHeader (index) {
                 if(index <= 0) {
                     alert("row must be 1 or greater");
                 }
                 index--;
                 var charCodeOfA = ("a").charCodeAt(0); // you could hard code to 97
                 var charCodeOfZ = ("z").charCodeAt(0); // you could hard code to 122
                 var excelStr = "";
                 var base24Str = (index).toString(charCodeOfZ - charCodeOfA + 1);
                 for(var base24StrIndex = 0; base24StrIndex < base24Str.length; base24StrIndex++) {
                     var base24Char = base24Str[base24StrIndex];
                     var alphabetIndex = (base24Char * 1 == base24Char) ? base24Char : (base24Char.charCodeAt(0) - charCodeOfA + 10);
                     // bizarre thing, A==1 in first digit, A==0 in other digits
                     if(base24StrIndex == 0) {
                         alphabetIndex -= 1;
                     }
                     excelStr += String.fromCharCode(charCodeOfA*1 + alphabetIndex*1);
                 }
                 return excelStr.toUpperCase();
            }

            function convertLetterToNumber(str) {
                var out = 0;
                var len = str.length;
                for (var pos = 0; pos < len; pos++) {
                  out += (str.charCodeAt(pos) - 64) * Math.pow(26, len - pos - 1);
                }
                return out;
              }

            function getdetails(selected_value) {
                 //// 
                if(selected_value === 'Number'){
                    
                    $rootScope.DataTableFields.number_type = 0;
                     //// 
                }
                
                // else if(selected_value === 'Number'){
                //     $rootScope.DataTableFields.number_type = 0;
                // }

                $rootScope.DataTableFields = {
                  lable_show : false,
                  formula_show : false,
                  currency_show : false,
                  textShow : true,
                  text_show : false,
                  number_show : false,
                  data_point_show : false
                }
                // vm.lable_show = false;
                // vm.formula_show = false;
                // vm.currency_show = false;
               
                // vm.textShow = true;
                // vm.text_show = false;
          
                // vm.number_show = false;
          
                $rootScope.DataTableFields.selected_value = selected_value;
          
                //  //// ;
          
                if (selected_value == 'None') {
                  $rootScope.DataTableFields.textShow = false;
         
                 
                }
                else if (selected_value == 'Date') {
          
                }
          
                else if (selected_value == 'Formula') {
                  $rootScope.DataTableFields.formula_show = true;
                }
          
                else if (selected_value == 'Currency') {
                  $rootScope.DataTableFields.currency_show = true;
                  $rootScope.DataTableFields.number_show = false;
                }
          
                else if (selected_value == 'Text') {
                  $rootScope.DataTableFields.text_show = true;
                }
          
                else if (selected_value == 'Number') {
                  $rootScope.DataTableFields.currency_show = false;
                  $rootScope.DataTableFields.number_show = true;
                }

                else if (selected_value == 'Data Point') {
                  $rootScope.DataTableFields.data_point_show = true;
                }
          
                else if (selected_value == 'Label') {
                  $rootScope.DataTableFields.lable_show = true;
                }
          
                $rootScope.DataTableFields.cellSelected = true;
              
          
              }

              function selectPercentage(){
           
                if ($rootScope.DataTableFields.percentage) {
                    $rootScope.DataTableFields.percentage = false;
                  }
                  else {
                    $rootScope.DataTableFields.percentage = true;
                  }
              }

              function savingCellStructure(selectedIndex, selectedHeaderName, selectedHeaderIndex, alignTextStatus, TextPostitionStatus){
                
                var rootScopeDatafields = $rootScope.DataTableFields;
                var selected_value = $rootScope.DataTableFields.selected_value;
                
                rootScopeDatafields.cell_stucture = { 'index': selectedIndex, 'cell_no': selectedHeaderName + selectedHeaderIndex, 'type': selected_value, 'row': selectedHeaderName, 'column': selectedHeaderIndex, 'text_position': TextPostitionStatus, 'text_align': alignTextStatus}
                
                if (selected_value == 'None') {
                  rootScopeDatafields.cell_stucture.value = '';
                }
                else if (selected_value == 'Formula') {

                 
                    rootScopeDatafields.value = rootScopeDatafields.formula
                    rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value ;
            
                    rootScopeDatafields.value = '';
             
                  
          
                }
                else if (selected_value == 'Currency') {
                  rootScopeDatafields.value = rootScopeDatafields.currency_type;
          
                  rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value ;
          
                  rootScopeDatafields.value = '';
          
                }
                else if (selected_value == 'Date') {
                  rootScopeDatafields.value = '';
          
                  rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value ;
          
                }
          
                else if (selected_value == 'Text') {
                  rootScopeDatafields.value = rootScopeDatafields.text
                  rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value;
                  rootScopeDatafields.value = '';
            
                }
          
                else if (selected_value == 'Number') {
                  rootScopeDatafields.value = rootScopeDatafields.number_type
                  rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value;
                  rootScopeDatafields.cell_stucture.percentage = rootScopeDatafields.percentage;
                  rootScopeDatafields.value = ''
                }

                else if (selected_value == 'Data Point') {
                    rootScopeDatafields.value = rootScopeDatafields.data_point_function
                    rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value;
                    rootScopeDatafields.value = '';
                }
          
                else {
                  rootScopeDatafields.value = rootScopeDatafields.label_name
                  rootScopeDatafields.cell_stucture.value =  rootScopeDatafields.value;
          
                }
               

                rootScopeDatafields = {
                    lable_show : false,
                    text_show : false,
                    formula_show : false,
                    number_show : false,
                    textShow : false,
                    cellSelected : false,
                    data_point_show : false,
                    label_name : ''
                  }
          
              }
 
       
     }
})();