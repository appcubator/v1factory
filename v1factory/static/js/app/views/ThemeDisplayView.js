define([
  'mixins/BackboneModal',
  'iui'
],
function() {

  var ThemeDisplayView = Backbone.ModalView.extend({
    el: null,
    events: {
      'click #load-btn' : 'loadTheme'
    },

    initialize: function(data) {
      _.bindAll(this, 'render', 'loadTheme');

      console.log(data);

      this.info  = data.themeInfo;
      this.theme = data.theme;
      this.render();
    },

    render: function() {
      template = ['<h2 class="span30"><%= name %></h2>',
                  '<div class="span10 hoff2"><img src="<%= image %>"></div>',
                  '<div class="span16 offset2 hoff2 load"><div class="btn" id="load-btn">Load Theme</div></div>'].join('\n');
      this.el.innerHTML = _.template(template, this.info);
    },

    loadTheme: function() {
      var self = this;
      console.log(self.theme);
      uieState = _.extend(uieState, self.theme);
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/uiestate/',
        data: JSON.stringify(uieState),
        success: function(data) {
          self.$el.find('.load').append('<div class="hoff2"><h3>Loaded!</h3></div>');
        }
      });

      /* Load Statics */
      $.ajax({
        type: "GET",
        url: '/theme/'+self.id+'/static/',
        success: function(data) {
          _(data).each(function(static_file) {
            $.ajax({
              type: "POST",
              url: '/app/'+appId+'/static/',
              data: JSON.stringify(static_file),
              success: function(data) {
                console.log(data);
              }
            });
          });
        }
      });
    }
  });

  return ThemeDisplayView;
});
