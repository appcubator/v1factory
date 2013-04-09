require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "backboneui" : "../../backbone/BackboneUI",
    "key" : "../../libs/keymaster/keymaster",
    "iui" : "../../libs/iui/iui",
    "app" : "../",
    "editor" : "./",
    "dicts" : "../../dicts",
    "libs"  : "../../libs",
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
    }
  }

});

require(["EditorView", '../../libs/keymaster/keymaster'], function(EditorView) {
  window.onerror = function(error) {
    alert('Segfault: '+ error);
  };
  var editorView = new EditorView();
});