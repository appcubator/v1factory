require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.flexslider" : "../../libs/jquery/jquery.flexslider-min",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "iui" : "../../libs/iui/iui",
    "comp": "../../libs/iui/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "editor" : "./../editor",
    "dicts" : "../../dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "answer" : "../../libs/answer/answer"
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
    },
    "answer" : {
      deps: ["../../libs/answer/lib/natural", "underscore", "jquery"]
    }
  }

});

require([
  "app/models/AppModel",
  "editor/EditorView",
  'editor/KeyDispatcher',
  "iui",
  "comp"
],
function(AppModel, EditorView, KeyDispatcher) {

  var EditorMain = function() {
    window.onerror = function(error) {
      alert('Segfault: '+ error);
    };
    v1State = new AppModel(null);
    v1State.initialize(appState);

    keyDispatcher  = new KeyDispatcher();
    editorView  = new EditorView({}, pageId);
    editorView.setElement(document.body).render();
  };

  new EditorMain();
});