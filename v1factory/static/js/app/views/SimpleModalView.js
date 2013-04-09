define([
  'backbone',
  'backboneui',
  'iui'
],
function(Backbone, BackboneUI) {

  var SimpleModalView = BackboneUI.ModalView.extend({
    tagName: 'div',
    className: 'deployed',

    initialize: function(data) {
      this.render(data.img, data.text);
    },

    render : function(img, text) {
      if(img) {
        this.el.innerHTML += '<img src="/static/img/'+img+'">';
      }

      if(text) {
        this.el.innerHTML += '<h3>'+text+'</h3>';
      }
      return this;
    }
  });

  return SimpleModalView;
});