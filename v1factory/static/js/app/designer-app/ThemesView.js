define([
  'backbone'
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
      // $('#item-gallery').css('top', -180);
      // this.mY = 0;
      $('body').mousemove(this.mousemoveHandler);
    },

    createTheme: function() {
      $('.create-theme').hide();
      $('.create-container').fadeIn();
    },

    createFormSubmitted: function() {
      var name = $('.theme-name').val();
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(appState),
        success: function() {},
        dataType: "JSON"
      });
    }
  });

  return ThemesView;
});
