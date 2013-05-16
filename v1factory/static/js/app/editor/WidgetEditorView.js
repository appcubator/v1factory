define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'editor/ImageSliderEditorView',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor, WidgetLayoutEditor, ImageSliderEditorView) {

  var WidgetEditorView = Backbone.UIView.extend({
    className : 'widget-editor fadeIn',
    id: 'widget-editor',
    tagName : 'div',
    css : 'widget-editor',

    events : {
      'click .edit-slides-button' : 'openSlideEditor',
      'click .edit-query-button'  : 'openQueryEditor',
      'click .edit-row-button'    : 'openRowEditor',
      'click #edit-form-btn'      : 'openFormEditor'
    },

    initialize: function(){
      _.bindAll(this, 'render',
                      'clear',
                      'openSlideEditor',
                      'openQueryEditor',
                      'openRowEditor',
                      'openFormEditor',
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

      if(this.model.has('container_info')) {
        var action = this.model.get('container_info').get('action');

        if(action == "authentication") {
          this.layoutEditor = new WidgetLayoutEditor(this.model);
          this.el.appendChild(this.layoutEditor.el);
        }

        if(action == "imageslider") {
          this.el.appendChild(slidesElem);
        }

        if(action == "table") {
          this.infoEditor = new WidgetInfoEditorView(this.model);
          this.el.appendChild(this.infoEditor.el);
        }

        if(action == "show") {
          this.el.appendChild(this.renderEditForm());
        }

      }
      else {
        this.el.appendChild(this.renderStyleEditing());
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.el.appendChild(this.layoutEditor.el);
        this.contentEditor = new WidgetContentEditor(this.model);
        this.el.appendChild(this.contentEditor.el);
      }

      return this;
    },

    renderStyleEditing: function(e) {
      var li       = document.createElement('div');
      li.className = 'style-editor';
      li.innerHTML += '<span id="pick-style" class="option-button tt" style="width:194px; display: inline-block;"><strong>Pick Style</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    renderEditForm: function(e) {
      var li       = document.createElement('ul');
      li.innerHTML += '<span id="edit-form-btn" class="option-button tt" style="width:194px; display: inline-block;"><strong>Edit Form</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    renderQueryButton: function() {
      var li       = document.createElement('li');
      li.className = 'option-button edit-query-button';
      li.innerHTML = 'Edit Query';
      return li;
    },

    renderRowButton: function() {
      var li       = document.createElement('li');
      li.className = 'option-button edit-row-button';
      li.innerHTML = 'Edit Row View';
      return li;
    },

    renderImageSliderButton: function() {
      var li       = document.createElement('li');
      li.className = 'option-button edit-slides-button';
      li.innerHTML = 'Edit Slides';
      return li;
    },

    openStylePicker: function(e) {
      new WidgetClassPickerView(this.model);
    },

    openFormEditor: function() {
      new FormEditorView(this.model.get('container_info').get('form'), this.model.get('container_info').get('entity'));
    },

    openSlideEditor: function() {
      new ImageSliderEditorView(this.model);
    },

    openQueryEditor: function() {
      var type = 'table';
      if(this.model.get('container_info').has('row')) {
        type = 'list';
      }

      new TableQueryView(this.model, type);
    },

    openRowEditor: function() {
      //widgetModel, queryModel, rowModel
      console.log(this.model);
      console.log(this.model.get('container_info').get('query'));
      new ListEditorView(this.model,
                         this.model.get('container_info').get('query'),
                         this.model.get('container_info').get('row'));
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

