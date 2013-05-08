define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'editor/WidgetInfoEditorView',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor, WidgetLayoutEditor, WidgetInfoEditorView) {

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
      this.model = widgetsCollection.selectedEl || _.last(widgetsCollection.models);

      this.widgetsCollection.bind('selected', this.selectChanged, this);

      if(this.model) {
        this.model.bind('change:selected', this.selectChanged);
        this.bindLocation();
      }
    },

    render: function() {
      var self = this;

      if(!this.model) {
        return;
      }

      if(!iui.get('widget-wrapper-' + this.model.cid)) {
        this.model.bind('rendered', self.render);
        return;
      }

      this.$el.fadeIn();
      if(this.model && !(this.model.has('container_info') && this.model.get('container_info').has('query'))) {
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.el.appendChild(this.layoutEditor.el);
      }

      if(this.model.has('container_info') && this.model.get('container_info').has('query')) {
        this.infoEditor = new WidgetInfoEditorView(this.model);
        this.el.appendChild(this.infoEditor.el);
      }

      if(this.model.get('container_info') === null) {
        this.contentEditor = new WidgetContentEditor(this.model);
        this.el.appendChild(this.contentEditor.el);
      }

      iui.get('widget-wrapper-' + this.model.cid).appendChild(this.el);

      this.model.unbind('rendered', self.render);
    },

    setLocation: function() { },

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
        this.render();
      }
    },

    clear: function() {
      if(this.contentEditor) this.contentEditor.clear();
      if(this.layoutEditor) this.layoutEditor.clear();
      if(this.infoEditor) this.infoEditor.clear();

      this.el.innerHTML = '';
      this.model = null;
      this.$el.hide();
    }
  });

  return WidgetEditorView;

});

