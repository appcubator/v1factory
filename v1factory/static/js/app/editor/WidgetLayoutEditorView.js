define([
  'app/editor/WidgetClassPickerView',
  'app/views/FormEditorView',
  'app/editor/tool-tip-hints'
],
function(WidgetClassPickerView, FormEditorView) {

  var WidgetLayoutEditorView = Backbone.View.extend({
    el     : document.getElementById('layout-editor'),
    className : 'layout-editor',
    events : {
      'click .a-pick'            : 'changeAlignment',
      'click .padding'           : 'changePadding',
      'click #delete-widget'     : 'deleteWidget',
      'mouseover .tt'            : 'showToolTip',
      'mouseout .tt'             : 'hideToolTip'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
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
    },

    renderLayoutInfo: function() {
      var aLeft = this.model.get('layout').get('alignment') == "left" ? " selected" : "";
      var aCenter = this.model.get('layout').get('alignment') == "center" ? " selected" : "";
      var aRight = this.model.get('layout').get('alignment') == "right" ? " selected" : "";

      var ul = document.createElement('ul');
      ul.className = "alignment-picker";
      ul.innerHTML += '<li class="a-left a-pick tt'+ aLeft +'" id="a-left"></li><li class="a-center a-pick tt'+ aCenter +'" id="a-center"></li><li class="a-right a-pick tt'+ aRight +'" id="a-right"></li>';
      return ul;
    },

    renderPaddingInfo: function() {
      var paddingLR = this.model.get('layout').get('r-padding') > 0 ? "selected" : "";
      var paddingTB = this.model.get('layout').get('b-padding') > 0 ? "selected" : "";

      var ul = document.createElement('ul');
      ul.className = "padding-picker right";
      ul.innerHTML += '<li class="padding tb tt '+ paddingTB +'" id="padding-tb"></li><li class="padding lr tt '+ paddingLR +'" id="padding-lr"></li>';
      return ul;
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

