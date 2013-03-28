define([
  'backbone'
],
function() {

  var FormFieldModel = Backbone.Model.extend({
    initialize: function(bone) {

      this.set('name', bone.name);

      if(bone.type) {
        this.set('type', bone.type);
      }
      else { alert('form field should have type'); }


      this.set('label', (bone.label||bone.name));
      this.set('placeholder', (bone.placeholder||bone.name));
      this.set('options', []);
    }
  });

  return FormFieldModel;

});