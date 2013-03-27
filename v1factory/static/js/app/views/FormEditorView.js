define([
  'backbone',
  'backboneui',
  'app/templates/FormEditorTemplates'
],
function(Backbone, BackboneUI) {

  var FormEditorView = BackboneUI.ModalView.extend({
    tagName: 'div',
    width: 900,
    padding: 0,
    className: 'form-editor',
    
    initialize: function(formModel, entityModel) {
      _.bindAll(this, 'render');
      this.model = formModel;
      this.entity = entityModel;
      this.render();
    },
    
    render : function(text) {
      var self = this;
      console.log(self.entity.get('fields'));
      var html = _.template(FormEditorTemplates.template, { form: self.model, entity: self.entity});
      this.el.innerHTML = html;
      return this;
    }
  });

  return FormEditorView;
});