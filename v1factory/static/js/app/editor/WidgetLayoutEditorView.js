define(['backbone'], function() {
  var WidgetLayoutEditorView = Backbone.View.extend({
    el     : document.getElementById('layout-editor'),
    className : 'layout-editor',
    events : {
      'click .a-pick'            : 'changeAlignment',
      'click .padding'           : 'changePadding'
    },

    initialize: function(widgetsCollection){
      _.bindAll(this, 'render',
                      'clear',
                      'selectChanged',
                      'changeAlignment',
                      'changePadding');

      this.widgetsCollection = widgetsCollection;
      this.model = widgetsCollection.selectedEl;
      this.widgetsCollection.bind('change', this.selectChanged, this);
      if(this.widgetsCollection.selectedEl) {
        this.render();
      }
    },

    selectChanged : function(chg, ch2) {

      if(this.widgetsCollection.selectedEl === null) {
        this.model = null;
        //this.el.innerHTML = '';
      }
      else if(this.widgetsCollection.selectedEl != this.model) {
        this.clear();
        this.model = this.widgetsCollection.selectedEl;
        this.render();
      }
    },

    changeAlignment: function(e) {
      $('.selected', '.alignment-picker').removeClass('selected');
      var direction = (e.target.className).replace(' a-pick', '');
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
      var ul = document.createElement('ul');
      ul.className = "alignment-picker";
      ul.innerHTML += '<li class="a-left a-pick"></li><li class="a-center a-pick"></li><li class="a-right a-pick"></li>';
      return ul;
    },

    renderPaddingInfo: function() {
      var ul = document.createElement('ul');
      ul.className = "padding-picker right";
      ul.innerHTML += '<li class="padding tb" id="padding-tb"></li><li class="padding lr" id="padding-lr"></li>';
      return ul;
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
    }
  });

  return WidgetLayoutEditorView;
});

