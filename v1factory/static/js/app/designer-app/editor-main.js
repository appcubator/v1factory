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
    "editor" : "../editor",
    "dicts" : "../../dicts",
    "libs"  : "../../libs"
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

require(["./EditorLiteView", '../../libs/keymaster/keymaster'], function(EditorLiteView) {
  window.onerror = function(error) {
    alert('Segfault: '+ error);
  };
  var editorView = new EditorLiteView();
});