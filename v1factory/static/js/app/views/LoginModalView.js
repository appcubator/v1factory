define([
  'mixins/BackboneModal'
],
function() {

  var LoginModalView = Backbone.ModalView.extend({
    tagName: 'div',

    initialize: function(text) {
      this.render();
    },

    render : function() {
      this.el.innerHTML = iui.get('login-form-template').innerHTML;
      return this;
    }
  });

  return LoginModalView;
});