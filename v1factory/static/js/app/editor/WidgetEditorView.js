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
                      'deselect',
                      'bindWidget',
                      'clear');

      this.widgetsCollection    = widgetsCollection;
      this.widgetsCollection.bind('add', this.bindWidget);
      var self = this;
      _(this.widgetsCollection.models).each(self.bindWidget);

    },

    mousedown: function(e) { e.stopImmediatePropagation(); },

    bindWidget: function(widget) {
      var self = this;
      widget.on('selected', function() {
        self.newSelected(this);
      });
    },

    newSelected: function(widgetModel) {
      if(this.selectedEl && this.selectedEl.cid == widgetModel.cid) return;
      this.selectedEl = widgetModel;
      this.render();
    },

    render: function() {
      this.clear();
      this.$el.fadeIn();

      if(this.selectedEl && !(this.selectedEl.has('container_info') && this.selectedEl.get('container_info').has('query'))) {
        this.layoutEditor = new WidgetLayoutEditor(this.selectedEl);
        this.el.appendChild(this.layoutEditor.el);
      }

      if(this.selectedEl.has('container_info') && this.selectedEl.get('container_info').has('query')) {
        this.infoEditor = new WidgetInfoEditorView(this.selectedEl);
        this.el.appendChild(this.infoEditor.el);
      }

      if(this.selectedEl.get('container_info') === null) {
        this.contentEditor = new WidgetContentEditor(this.selectedEl);
        this.el.appendChild(this.contentEditor.el);
      }

      iui.get('widget-wrapper-' + this.selectedEl.cid).appendChild(this.el);
      iui.get('widget-wrapper-' + this.selectedEl.cid).style.zIndex = 2002;

      $('.page.fdededfcbcbcd').on('mousedown', this.deselect);
      $('#elements-container').on('mousedown', this.deselect);

      return this;
    },

    deselect: function() {
      iui.get('widget-wrapper-' + this.selectedEl.cid).style.zIndex = 2000;
      this.selectedEl = null;
      this.clear();
    },

    clear: function() {
      if(this.contentEditor) this.contentEditor.clear();
      if(this.layoutEditor) this.layoutEditor.clear();
      if(this.infoEditor) this.infoEditor.clear();
      this.el.innerHTML = '';
      this.$el.hide();
    }
  });

  return WidgetEditorView;

});

