define([
  'backbone',
  'iui'
],
function(Backbone) {

  var ThemesView = Backbone.View.extend({
    el           : document.body,

    events : {
      'click .create-theme' : 'createTheme',
      'submit .create-form' : 'createFormSubmitted'
    },

    initialize   : function(widgetsCollection) {
       _.bindAll(this, 'render',
                       'createTheme',
                       'createFormSubmitted');

      this.render();
    },

    render: function() {

    },

    createTheme: function() {
      $('.create-theme-text').hide();
      $('.create-form').fadeIn();
    },

    createFormSubmitted: function(e) {
      var name = $('.theme-name').val();
      $.ajax({
        type: "POST",
        url: '/theme/new/',
        data: { name : name },
        success: function(data) {
          var template = [
            '<li class="hi5 hoff1 span40 pane border">',
              '<a href="/theme/{{ theme.pk }}/">',
                '<span><%= name %></span>',
                '<form method="POST" action="/theme/<%= id %>/delete/">',
                  '<input type="submit"  class="btn btn-warning right" value="Delete">',
                '</form>',
              '</a>',
            '</li>'
          ].join('\n');
          var html = _.template(template, data);
          $('#themes-list').append(html);
        },
        dataType: "JSON"
      });

      e.preventDefault();
      $(e.target).hide();
      $('.create-theme-text').fadeIn();
    }
  });

  return ThemesView;
});
