define([
  'backbone',
  'models/LinkModel'
],
function(Backbone,
         LinkModel) {

  var LinkCollection = Backbone.Collection.extend({
    model: LinkModel
  });

  return LinkCollection;
});
