require.config({
  paths: {
    "jquery" : "../libs/jquery/jquery",
    "jquery-ui" : "../libs/jquery-ui/jquery-ui",
    "underscore" : "../libs/underscore-amd/underscore",
    "backbone" : "../libs/backbone-amd/backbone",
    "iui" : "../libs/iui/iui",
    "comp": "../libs/iui/comp",
    "bootstrap" : "../libs/bootstrap/bootstrap",
    "app" : "./",
    "editor" : "./editor",
    "dicts" : "../dicts",
    "mixins" : "../mixins",
    "key" : "../libs/keymaster/keymaster"
  },

  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    }
  }

});

//libs
require([
  "backbone",     //require plugins
  "bootstrap",
  "iui"
],
function () {
  var $ = require("jquery"),
    // the start module is defined on the same script tag of data-main.
    // example: <script data-main="main.js" data-start="pagemodule/main" src="vendor/require.js"/>
    startModuleName = $("script[data-main][data-start]").attr("data-start");

    if (startModuleName) {
      require([startModuleName], function (startModule) {
        $(function(){
          var fn = $.isFunction(startModule) ? startModule : startModule.init;
          if (fn) { fn(); }
        });
      });
    }
});