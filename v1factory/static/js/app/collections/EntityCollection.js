define([
  'backbone',
  '../models/EntityModel'
],function(Backbone, EntityModel) {

  var EntityCollection = Backbone.Collection.extend({
    model: EntityModel
  });

  return EntityCollection;
});