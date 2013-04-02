define([
  'backbone',
  'app/models/FormFieldModel'
],
function(Backbone,
         FormFieldModel) {

  var FormFieldCollection = Backbone.Collection.extend({
    model: FormFieldModel
  });

  return FormFieldCollection;
});
