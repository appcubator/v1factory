require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "backboneui" : "../../backbone/BackboneUI",
    "iui" : "../../libs/iui/iui",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../"
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

require(["../views/GalleryView", '../models/ThemeModel', "bootstrap"], function(GalleryView, ThemeModel) {
  var themeModel = new ThemeModel(uieState);
  var galleryView = new GalleryView(themeModel);
});