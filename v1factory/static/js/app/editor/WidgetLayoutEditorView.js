define([
  'app/editor/WidgetClassPickerView',
  'app/views/FormEditorView',
  'editor/tool-tip-hints'
],
function(WidgetClassPickerView, FormEditorView) {

  var WidgetLayoutEditorView = Backbone.View.extend({
    el     : document.getElementById('layout-editor'),
    className : 'layout-editor',
    events : {
      'click .a-pick'            : 'changeAlignment',
      'click .padding'           : 'changePadding',
      'click #pick-style'        : 'openStylePicker',
      'click #delete-widget'     : 'deleteWidget',
      'click #edit-form-btn'     : 'openFormEditor',
      'mouseover .tt'            : 'showToolTip',
      'mouseout .tt'             : 'hideToolTip'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
                      'renderStyleEditing',
                      'renderEditForm',
                      'openFormEditor',
                      'clear',
                      'changeAlignment',
                      'changePadding',
                      'showToolTip',
                      'hideToolTip',
                      'deleteWidget');

      this.model = widgetModel;
      this.render();
    },


    changeAlignment: function(e) {
      $('.selected', '.alignment-picker').removeClass('selected');
      var direction = (e.target.className).replace(' a-pick', '');
      direction = direction.replace(' tt', '');
      direction = direction.replace('a-','');

      console.log(direction);
      this.model.get('layout').set('alignment', direction);
      e.target.className += ' selected';
    },

    changePadding: function(e) {
      //this.$el.find('.selected').removeClass('selected');
      var padding = (e.target.id).replace('padding-', '');
      $(e.target).toggleClass('selected');

      if(padding == "tb") {
        if($(e.target).hasClass('selected')) {
          this.model.get('layout').set('t-padding', 15);
          this.model.get('layout').set('b-padding', 15);
        }
        else {
          this.model.get('layout').set('t-padding', 0);
          this.model.get('layout').set('b-padding', 0);
        }
      }
      else {
        if($(e.target).hasClass('selected')) {
          this.model.get('layout').set('r-padding', 15);
          this.model.get('layout').set('l-padding', 15);
        }
        else {
          this.model.get('layout').set('r-padding', 0);
          this.model.get('layout').set('l-padding', 0);
        }
      }
    },

    render: function() {
      var self = this;

      this.el.appendChild(this.renderPaddingInfo());
      this.el.appendChild(this.renderLayoutInfo());
      if(this.model.get('container_info')&& this.model.get('container_info').has('form')) {
        this.el.appendChild(this.renderEditForm());
      }
      else {
        this.el.appendChild(this.renderStyleEditing());
      }
    },

    renderStyleEditing: function(e) {
      var li       = document.createElement('ul');
      li.innerHTML += '<span id="pick-style" class="option-button tt" style="width:194px; display: inline-block;"><strong>Pick Style</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    renderEditForm: function(e) {
      var li       = document.createElement('ul');
      li.innerHTML += '<span id="edit-form-btn" class="option-button tt" style="width:194px; display: inline-block;"><strong>Edit Form</strong></span><span id="delete-widget" class="option-button delete-button tt" style="width:34px; margin-left:1px; display: inline-block;"></span>';
      return li;
    },

    renderLayoutInfo: function() {
      var ul = document.createElement('ul');
      ul.className = "alignment-picker";
      ul.innerHTML += '<li class="a-left a-pick tt" id="a-left"></li><li class="a-center a-pick tt" id="a-center"></li><li class="a-right a-pick tt" id="a-right"></li>';
      return ul;
    },

    renderPaddingInfo: function() {
      var ul = document.createElement('ul');
      ul.className = "padding-picker right";
      ul.innerHTML += '<li class="padding tb tt" id="padding-tb"></li><li class="padding lr tt" id="padding-lr"></li>';
      return ul;
    },

    openStylePicker: function(e) {
      new WidgetClassPickerView(this.model);
    },

    showToolTip: function(e) {
      if(this.toolTip) {
        $(this.toolTip).remove();
      }

      var div = document.createElement('div');
      div.className = "tool-tip-box fadeIn";
      var text = ToopTipHints[e.target.id];
      if(text) {
        div.innerHTML = text;
        this.toolTip = div;
        this.el.appendChild(div);
      }

    },

    hideToolTip: function(e) {
      if(this.toolTip) {
        $(this.toolTip).remove();
      }
    },

    openFormEditor: function() {
      new FormEditorView(this.model.get('container_info').get('form'), this.model.get('container_info').get('entity'));
    },

    deleteWidget: function() {
      this.model.remove();
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
      this.remove();
    }
  });

  return WidgetLayoutEditorView;
});

