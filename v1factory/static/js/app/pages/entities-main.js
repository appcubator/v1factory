require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "iui" : "../../libs/iui/iui",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "editor" : "../editor",
    "dicts" : "../../dicts",
    "mixins" : "../../mixins"
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
  "app/views/EntitiesView",
  "app/templates/EntitiesTemplates",
  "bootstrap",
  "iui"
],
function(EntitiesView, Templates) {
  var entityEditor   = new EntitiesView();
});

