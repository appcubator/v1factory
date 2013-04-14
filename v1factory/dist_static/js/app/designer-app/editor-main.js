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