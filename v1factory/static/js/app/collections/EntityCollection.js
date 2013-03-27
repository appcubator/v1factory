define([
  'backbone',
  'app/models/EntityModel'
],
function(Backbone, EntityModel) {

  var EntityCollection = Backbone.Collection.extend({
    model: EntityModel,

    // todo
    // entitiyWithName: function(entityNameStr) {
    //   return '';
    // }
  });

  return EntityCollection;
});