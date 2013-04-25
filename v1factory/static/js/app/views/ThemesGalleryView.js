define([
  'app/views/ThemeDisplayView',
  'backbone',
  'iui'
],
function(ThemeDisplayView) {

  var ThemesGalleryView = Backbone.View.extend({

    events: {
      'click .theme' : 'showThemeModal'
    },

    initialize: function() {
    },

    render: function() {
      var self = this;

      self.el.innerHTML = ['<div class="span58">',
                           '<h2 class="hoff2">Themes</h2>',
                           '<hr class="span58 hoff2">'].join('\n');

      self.listView = document.createElement('ul');
      self.listView.className = 'theme-gallery';

      var template = [
        '<li class="span28 theme hoff3 offsetr1" class="theme-item" id="theme-<%= id %>">',
          '<img src="/static/img/theme4.png" class="span13">',
          '<div class="details">Click to See Details</div>',
          '<h2 class="offset2 span12"><%= name %></h2>',
          '<div class="offset2 span12">Designed by <%= designer %></div>',
        '</li>'
      ].join('\n');

      _(themes).each(function(theme) {
        self.listView.innerHTML += _.template(template, theme);
      });

      $(self.el).append(self.listView);

      return this;
    },

    showThemeModal: function(e) {
      var themeId = e.target.parentNode.id.replace('theme-','');
      $.ajax({
        type: "POST",
        url: '/theme/'+themeId+'/info/',
        success: function(data) {
          var json = $.parseJSON(data.theme);
          new ThemeDisplayView({id:data.themeId, title: data.title, theme:json});
        },
        dataType: "JSON"
      });
    }

  });

  return ThemesGalleryView;
});