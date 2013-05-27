define([
  'models/WidgetModel',
  'backbone'
],
function(WidgetModel,
         Backbone) {

  var WidgetCollection = Backbone.Collection.extend({
    model : WidgetModel
  });

  return WidgetCollection;
});
