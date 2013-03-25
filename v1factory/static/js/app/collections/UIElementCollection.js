define([
  'app/models/UIElementModel',
  'backbone'
],
function(UIElementModel, Backbone) {
  var UIElementCollection = Backbone.Collection.extend({
    model : UIElementModel,
    initialize: function (models, type) {
      this.type = type;
    }
  });

  return UIElementCollection;
});

  