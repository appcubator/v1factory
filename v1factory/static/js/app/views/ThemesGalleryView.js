define([
  'app/views/ThemeDisplayView',
  'backbone',
  'iui'
],
function(ThemeDisplayView) {

  var ThemesGalleryView = Backbone.View.extend({

    events: {
    },

    initialize: function() {
      $('.theme').on('click', this.showThemeModal);
    },

    render: function() {
      var self = this;

      var template = [
        '<li class="span64 theme" class="theme-item" id="theme-<%= id %>">',
          '<img src="/static/img/theme4.png" class="span16">',
          '<div class="details">Click to See Details</div>',
          '<h2 class="offset2 span40"><%= name %></h2>',
          '<div class="offset2 span40">Designed by <%= designer %></div>',
        '</li>'
      ].join('\n');

      _(themes).each(function(theme) {
        self.el.innerHTML += _.template(template, theme);
      });
    },

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