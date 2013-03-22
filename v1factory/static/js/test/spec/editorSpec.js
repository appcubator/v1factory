var pageId = 3;
var g_editorView;
var g_appState = {};
var g_initial_appState = {};
var GRID_WIDTH = 80;
var GRID_HEIGHT = 15;

define([
  "editor/EditorView",
  '../../libs/keymaster/keymaster'
], function(EditorView) {

  var editorView = new EditorView();
  g_editorView = editorView;
  g_appState = appState;
  g_initial_appState = _.clone(appState);

  describe( "appState model input-outputs", function () {  
    it("doesnt fuck up", function () {
      var curAppstate = editorView.amendAppState();
      expect(appState).toEqual(curAppstate);  
    });
  });
});