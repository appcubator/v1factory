define([
  'backbone',
  'mixins/BackboneModal',
  'iui'
],
function(Backbone) {

  var ErrorModalView = Backbone.ModalView.extend({
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
        text = text.replace('\n', '<br />');
        text = text.replace(' ', '&nbsp;');
        this.el.innerHTML += '<h3>'+text+'</h3>';
      }
      return this;
    }
  });

  return ErrorModalView;
});
