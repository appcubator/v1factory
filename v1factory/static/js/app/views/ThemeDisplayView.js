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

    initialize: function(bone) {
      _.bindAll(this, 'loadTheme');

      this.id = bone.id;
      this.theme = bone.theme;
      this.title = bone.title;
      this.render();
    },

    render: function() {
      this.el.innerHTML = '<div class="btn" id="load-btn">Load Theme</div>';
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
          $(self.el).append('Loaded.');
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
