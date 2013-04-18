define([
  "editor/EditorView"
],
function(EditorView) {

  var EditorMain = function() {
    window.onerror = function(error) {
      alert('Segfault: '+ error);
    };
    var editorView = new EditorView();
  };

  return EditorMain;
});