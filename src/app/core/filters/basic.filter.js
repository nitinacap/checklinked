(function ()
{
    'use strict';
    
    angular  
        .module('app.core')
        .filter('toTrusted', toTrustedFilter)
        .filter('htmlToPlaintext', htmlToPlainTextFilter)
        .filter('nospace', nospaceFilter)
        .filter('extension', extensionFilter)
        .filter('tostring', tostringFilter)
        .filter('tonumber', tonumberFilter)
        .filter('timeSince', timeSinceFilter)
        .filter('unique', uniqueFilter)
        .filter('humanizeDoc', humanizeDocFilter);

    /** @ngInject */


    function uniqueFilter($sce){

        return function (arr, field) {
        //     console.log('unique',field);
        //     var o = {}, i, l = arr.length, r = [];
        //     for(i=0; i<l;i+=1) {
        //       o[arr[i][field]] = arr[i];
        //     }
        //     for(i in o) {
        //       r.push(o[i]);
        //     }
        //     return r;
        //   };

        var jobs = arr.map(function (item) {
            return item.occupation;
        });
        console.log('unique',jobs);
    }
    }

    //  convert to string 
    
    function tostringFilter()
    {
        return function(input) { 
            return input.toString();
          };
    }

    function tonumberFilter()
    {
        return function(input) {
          return parseInt(input, 10);
        };
    };


    function toTrustedFilter($sce)
    {
        return function (value)
        {
            return $sce.trustAsHtml(value);
        };
    }

    /** @ngInject */
    function htmlToPlainTextFilter()
    {
        return function (text)
        {
            return String(text).replace(/<[^>]+>/gm, '');
        };
    }

    /** @ngInject */
    function nospaceFilter()
    {
        return function (value)
        {
            return (!value) ? '' : value.replace(/ /g, '');
        };
    }

    /** @ngInject */
    function humanizeDocFilter()
    {
        return function (doc)
        {
            if ( !doc )
            {
                return;
            }
            if ( doc.type === 'directive' )
            {
                return doc.name.replace(/([A-Z])/g, function ($1)
                {
                    return '-' + $1.toLowerCase();
                });
            }
            return doc.label || doc.name;
        };
    }

     /** @ngInject */
     function extensionFilter(){
        return function(input) {
            return input.split('.').pop()
          };
     }

          /** @ngInject */
     function timeSinceFilter() {
        return function (date)
        {
            var seconds = Math.floor(((new Date().getTime()/1000) - date)),
            interval = Math.floor(seconds / 31536000);
            if (interval > 1) return interval + " years";
        
            interval = Math.floor(seconds / 2592000);
            if (interval > 1) return interval + " Months";
        
            interval = Math.floor(seconds / 86400);
            if (interval >= 1) return interval + " Days";
        
            interval = Math.floor(seconds / 3600);
            if (interval >= 1) return interval + " Hours ago";
        
            interval = Math.floor(seconds / 60);
            if (interval > 1) return interval + " Minutes ago";
        
          //  return Math.floor(seconds) + "just now";
            return " just now";
      }
    }

    
    
      

})();