require.config({
  paths: {
    "jquery" : "../libs/jquery/jquery",
    "jquery-ui" : "../libs/jquery-ui/jquery-ui",
    "underscore" : "../libs/underscore-amd/underscore",
    "backbone" : "../libs/backbone-amd/backbone",
    "backboneui" : "../backbone/BackboneUI",
    "iui" : "../libs/iui/iui",
    "bootstrap" : "../libs/bootstrap/bootstrap"
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

require([
  "./views/EntitiesView",
  "./templates/EntitiesTemplates",
  "bootstrap",
  "iui"
],
function(EntitiesView, Templates) {
  var entityEditor   = new EntitiesView();
});

