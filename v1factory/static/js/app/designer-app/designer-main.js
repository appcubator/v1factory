require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "backboneui" : "../../backbone/BackboneUI",
    "key" : "../../libs/keymaster/keymaster",
    "iui" : "../../libs/iui/iui",
    "dicts" : "../../dicts",
    "collections" : "../collections",
    "editor" : "../editor"
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
    }
  }

});

require(["ThemesView", '../../libs/keymaster/keymaster'], function(ThemesView) {
  var editorView = new ThemesView();
});