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
  "app/designer-app/ThemeEditView",
  'app/models/ThemeModel',
  "bootstrap"
],
function(ThemeEditView, ThemeModel) {
  var themeModel = new ThemeModel(themeState);
  var galleryView = new ThemeEditView(themeModel);
});
