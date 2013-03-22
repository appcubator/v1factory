define(['backbone'], function(Backbone) {
  var UrlModel = Backbone.Model.extend({
    defaults : {
      urlparts : [],
      page_name : "defaults"
    }
  });

  return UrlModel;
});