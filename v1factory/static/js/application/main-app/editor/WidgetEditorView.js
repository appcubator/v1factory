define([
  'editor/WidgetContentEditorView',
  'editor/WidgetLayoutEditorView',
  'editor/ImageSliderEditorView',
  'editor/WidgetClassPickerView',
  'app/FormEditorView',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor,
         WidgetLayoutEditor,
         ImageSliderEditorView,
         WidgetClassPickerView,
         FormEditorView) {

  var WidgetEditorView = Backbone.UIView.extend({
    className : 'widget-editor fadeIn',
    id: 'widget-editor',
    tagName : 'div',
    css : 'widget-editor',
    isMobile: false,

    events : {
      'click .edit-slides-button' : 'openSlideEditor',
      'click .edit-query-button'  : 'openQueryEditor',
      'click .edit-row-button'    : 'openRowEditor',
      'click #edit-form-btn'      : 'openFormEditor',
      'click #pick-style'         : 'openStylePicker',
      'click .delete-button'      : 'clickedDelete',
      'click'                     : 'clicked'
    },

    initialize: function(){
      _.bindAll(this, 'render',
                      'clear',
                      'openStylePicker',
                      'openSlideEditor',
                      'openQueryEditor',
                      'openRowEditor',
                      'openFormEditor',
                      'setModel',
                      'clickedDelete',
                      'classChanged',
                      'hideSubviews',
                      'showSubviews');

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
      if(this.isMobile) {
        this.$el.append('<div class="left-arrow"></div>');
      }
      else {
        this.$el.append('<div class="top-arrow"></div>');
      }

      if(this.model.get('data').has('container_info')) {
        var action = this.model.get('data').get('container_info').get('action');

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

        if(action == "show" || action == "create") {
          this.el.appendChild(this.renderEditForm());
        }

      }
      else {
        this.widgetClassPickerView = new WidgetClassPickerView(this.model);
        this.layoutEditor = new WidgetLayoutEditor(this.model);
        this.contentEditor = new WidgetContentEditor(this.model);
        this.widgetClassPickerView.bind('change', this.classChanged);

        this.el.appendChild(this.widgetClassPickerView.el);
        this.el.appendChild(this.renderStyleEditing());
        this.el.appendChild(this.layoutEditor.el);
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
      this.hideSubviews();
      this.widgetClassPickerView.show();
      this.widgetClassPickerView.expand();
    },

    openFormEditor: function() {
      new FormEditorView(this.model.get('data').get('container_info').get('form'), this.model.get('data').get('container_info').get('entity'));
    },

    openSlideEditor: function() {
      new ImageSliderEditorView(this.model);
    },

    openQueryEditor: function() {
      var type = 'table';
      if(this.model.get('data').get('container_info').has('row')) {
        type = 'list';
      }

      new TableQueryView(this.model, type);
    },

    openRowEditor: function() {
      //widgetModel, queryModel, rowModel
      new ListEditorView(this.model,
                         this.model.get('data').get('container_info').get('query'),
                         this.model.get('data').get('container_info').get('row'));
    },

    classChanged: function() {
      this.showSubviews();
      this.widgetClassPickerView.$el.hide();
    },

    clear: function() {
      if(this.contentEditor) this.contentEditor.clear();
      if(this.layoutEditor) this.layoutEditor.clear();
      if(this.infoEditor) this.infoEditor.clear();
      this.el.innerHTML = '';
      this.$el.hide();
    },

    showSubviews: function() {
      if(this.widgetClassPickerView) this.widgetClassPickerView.$el.fadeIn();
      if(this.contentEditor) this.contentEditor.$el.fadeIn();
      if(this.layoutEditor) this.layoutEditor.$el.fadeIn();
      if(this.infoEditor) this.infoEditor.$el.fadeIn();
      this.$el.find('.style-editor').fadeIn();
    },

    hideSubviews: function() {
      if(this.widgetClassPickerView) this.widgetClassPickerView.$el.hide();
      if(this.contentEditor) this.contentEditor.$el.hide();
      if(this.layoutEditor) this.layoutEditor.$el.hide();
      if(this.infoEditor) this.infoEditor.$el.hide();
      this.$el.find('.style-editor').hide();
    },

    clickedDelete: function() {
      if(this.model) this.model.remove();
    },

    clicked: function(e) {
      e.stopPropagation();
    }

  });

  return WidgetEditorView;

});

