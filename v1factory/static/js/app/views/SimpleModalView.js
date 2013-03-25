define([
  'backbone',
  'backboneui',
  'iui'
],
function(Backbone, BackboneUI) {
  
  var SimpleModalView = BackboneUI.ModalView.extend({
    tagName: 'div',
    className: 'deployed',
    
    initialize: function(text) {
        his.render(text.text);
    },
    
    render : function(text) {
      this.el.innerHTML = text;
      return this;
    }
  });

  return SimpleModalView;
});