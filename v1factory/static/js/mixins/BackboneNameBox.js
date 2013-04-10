define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  Backbone.NameBox = Backbone.View.extend({
    el: null,
    tagName: 'div',
    events: {
      'click'               : 'showForm',
      'submit form'         : 'createFormSubmitted'
    },

    initialize: function() {
      _.bindAll(this, 'render', 'showForm', 'createFormSubmitted');
      this.render();
      return this;
    },

    render: function() {
      return this;
    },

    showForm: function (e) {
      this.$el.find('.box-button').hide();
      this.$el.find('form').fadeIn();
      this.$el.find('input').focus();
    },

    createFormSubmitted: function(e) {
      e.preventDefault();
      var name = this.$el.find('input').val();
      if(name.length > 0) {
        this.$el.find('input form').val('');
        this.$el.find('form').hide();
        this.$el.find('.box-button').fadeIn();
        this.trigger('submit', name);
      }
    }

  });

  return Backbone;

});
