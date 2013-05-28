define([
  'backbone',
  'models/FieldModel'
],
function(Backbone,
         FieldModel) {

  var FieldsCollection = Backbone.Collection.extend({
    model : FieldModel
  });

  return FieldsCollection;
});