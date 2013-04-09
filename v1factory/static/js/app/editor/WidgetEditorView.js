define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'backbone',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor, WidgetLayoutEditor) {

  var WidgetEditorView = Backbone.UIView.extend({
    el     : document.getElementById('editor-page'),
    className : 'editor-page fadeIn',
    tagName : 'div',

    initialize: function(widgetsCollection, containersCollection){
      _.bindAll(this, 'render',
                      'clear',
                      'setLocation',
                      'bindLocation',
                      'selectChanged');

      this.widgetsCollection    = widgetsCollection;
      this.containersCollection = containersCollection;

      this.model = widgetsCollection.selectedEl;
      this.widgetsCollection.bind('change', this.selectChanged, this);
      this.containersCollection.bind('selected', this.clear);

      if(this.model) {
        this.model.bind('change:selected', this.selectChanged);
        this.contentEditor = new WidgetContentEditor(this.model);
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.render();
        this.bindLocation();
      }
    },

    render: function() {
      var self = this;
      // if(this.model.get('type') == 'box') {this.el.style.zIndex = 0;}
      iui.get('widget-wrapper-' + this.model.cid).appendChild(this.el);
      this.el.appendChild(this.layoutEditor.el);
      this.el.appendChild(this.contentEditor.el);
    },

    setLocation: function() {
      // this.setTop(GRID_HEIGHT * ((this.model.get('layout').get('top')+this.model.get('layout').get('height'))));
      // this.setLeft(GRID_WIDTH * (this.model.get('layout').get('left')));
    },

    bindLocation: function() {    },

    selectChanged : function(chg, ch2) {

      if(this.widgetsCollection.selectedEl === null) {
        this.model = null;
        this.clear();
      }
      else if(this.widgetsCollection.selectedEl != this.model) {
        this.clear();
        this.model = this.widgetsCollection.selectedEl;
        this.model.bind('change:selected', this.selectChanged);
        this.contentEditor = new WidgetContentEditor(this.model);
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.render();
        this.bindLocation();
        this.$el.fadeIn();
      }
    },

    clear: function() {
      if(this.contentEditor) this.contentEditor.clear();
      if(this.layoutEditor) this.layoutEditor.clear();
      this.el.innerHTML = '';
      this.model = null;
      this.$el.hide();
    }
  });

  return WidgetEditorView;

});

