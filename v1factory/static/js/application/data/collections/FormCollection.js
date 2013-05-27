define([
  'backbone',
  'models/FormModel'
],
function(Backbone,
         FormModel) {

  var FormCollection = Backbone.Collection.extend({
    model : FormModel
  });

  return FormCollection;
});