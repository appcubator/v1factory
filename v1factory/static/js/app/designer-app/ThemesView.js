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
      $('.create-theme').hide();
      $('.create-container').fadeIn();
    },

    createFormSubmitted: function(e) {
      var name = $('.theme-name').val();
      $.ajax({
        type: "POST",
        url: '/theme/new/',
        data: { name : name },
        success: function(data) { console.log(data); },
        dataType: "JSON"
      });

      e.preventDefault();
    }
  });

  return ThemesView;
});
