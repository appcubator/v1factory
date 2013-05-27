define([
  'backbone',
  'models/EntityModel'
],
function(Backbone,
         EntityModel) {

  var EntityCollection = Backbone.Collection.extend({
    model: EntityModel,

    // todo
    getEntityWithName: function(entityNameStr) {
      var entity = this.where({name : entityNameStr })[0];
      return entity;
    }
  });

  return EntityCollection;
});