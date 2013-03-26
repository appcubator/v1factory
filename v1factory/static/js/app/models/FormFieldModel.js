define([
  'backbone'
], 
function() {

  var FormFieldModel = Backbone.Model.extend({
    initialize: function(bone) {

      if(bone.type) {
        this.set('type', bone.type);
      }
      else { alert('form field should have type'); }

      if(bone.label) {
        this.set('label', bone.label);
      }
    }
  });

  return FormFieldModel;

});