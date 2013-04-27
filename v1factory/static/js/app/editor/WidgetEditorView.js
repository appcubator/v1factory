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

    initialize: function(widgetsCollection){
      _.bindAll(this, 'render',
                      'clear',
                      'setLocation',
                      'bindLocation',
                      'selectChanged');

      this.widgetsCollection    = widgetsCollection;

      this.model = widgetsCollection.selectedEl;
      this.widgetsCollection.bind('selected', this.selectChanged, this);

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

      console.log('trying to render');

      if(!iui.get('widget-wrapper-' + this.model.cid)) {
        console.log('not found');
        this.model.bind('rendered', self.render);
        return;
      }

      iui.get('widget-wrapper-' + this.model.cid).appendChild(this.el);
      this.el.appendChild(this.layoutEditor.el);
      this.el.appendChild(this.contentEditor.el);
      this.model.unbind('rendered', self.render);
    },

    setLocation: function() { },

    bindLocation: function() {    },

    selectChanged : function(chg, ch2) {
      console.log("SELECTED");
      console.log(this.widgetsCollection.selectedEl);
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

