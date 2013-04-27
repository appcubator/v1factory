require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "iui" : "../../libs/iui/iui",
    "comp": "../../libs/iui/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "editor" : "./../editor",
    "dicts" : "../../dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster"
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
  "app/models/AppModel",
  "editor/EditorView",
  "iui",
  "comp"
],
function(AppModel, EditorView) {

  var EditorMain = function() {
    window.onerror = function(error) {
      alert('Segfault: '+ error);
    };
    v1State = new AppModel(null);
    v1State.initialize(appState);

    var editorView = new EditorView();
  };

  new EditorMain();
});