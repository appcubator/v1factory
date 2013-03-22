define([
  '../models/UrlModel',
  'backbone'
],function(UrlModel, Backbone) {

  var UrlsCollection = Backbone.Collection.extend({
    model: UrlModel
  });

  return UrlsCollection;
});