define([
  'app/views/ThemeDisplayView',
  'backbone',
  'iui'
],
function(ThemeDisplayView) {

  var ThemesGalleryView = Backbone.View.extend({
    el: null,
    events: {
    },

    initialize: function() {

      $('.theme').on('click', this.showThemeModal);
    },

    render: function() { },

    showThemeModal: function(e) {
      var themeId = e.target.parentNode.id.replace('theme-','');
      $.ajax({
        type: "POST",
        url: '/theme/'+themeId+'/info/',
        success: function(data) {
          var json = $.parseJSON(data.theme);
          console.log(json);
          new ThemeDisplayView({id:data.themeId, title: data.title, theme:json});
        },
        dataType: "JSON"
      });
    }

  });

  return ThemesGalleryView;
});