define(['backbone', '../models/UrlModel'], function(Backbone, UrlModel) {
  var UrlsCollection = Backbone.Collection.extend({
    model: UrlModel
  });

  return UrlsCollection;
});