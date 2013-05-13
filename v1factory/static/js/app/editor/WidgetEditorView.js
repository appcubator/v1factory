define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'editor/WidgetInfoEditorView',
  'editor/ImageSliderEditorView',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor, WidgetLayoutEditor, WidgetInfoEditorView, ImageSliderEditorView) {

  var WidgetEditorView = Backbone.UIView.extend({
    className : 'widget-editor fadeIn',
    id: 'widget-editor',
    tagName : 'div',
    css : 'widget-editor',

    events : {
      'click .edit-slides-button' : 'openSlideEditor'
    },

    initialize: function(){
      _.bindAll(this, 'render',
                      'clear',
                      'openSlideEditor',
                      'setModel');

      iui.loadCSS(this.css);
      var self = this;
      this.model = null;
    },

    setModel: function(widgetModel) {
      this.model = widgetModel;
      return this;
    },

    render: function() {
      this.$el.fadeIn();
      console.log(this.model);
      if(!(this.model.has('container_info') && this.model.get('container_info').has('query'))) {
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.el.appendChild(this.layoutEditor.el);
      }

      if(this.model.has('container_info') && this.model.get('container_info').get('action') == "imageslider") {
        var slidesElem = document.createElement('ul');
        var html = '<li class="option-button edit-slides-button">Edit Slides</li>';
        slidesElem.innerHTML = html;
        this.el.appendChild(slidesElem);
      }

      if(this.model.has('container_info') && this.model.get('container_info').has('query')) {
        this.infoEditor = new WidgetInfoEditorView(this.model);
        this.el.appendChild(this.infoEditor.el);
      }

      if(this.model.get('container_info') === null) {
        this.contentEditor = new WidgetContentEditor(this.model);
        this.el.appendChild(this.contentEditor.el);
      }

      return this;
    },

    openSlideEditor: function() {
      new ImageSliderEditorView(this.model);
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

