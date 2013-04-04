define([
  'backboneui',
  'iui'
],
function(BackboneUI) {

  var ThemeDisplayView = BackboneUI.ModalView.extend({
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
          alert('Matrix re-loaded');
        }
      });
    }
  });

  return ThemeDisplayView;
});
