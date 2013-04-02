define(['backbone'], function(Backbone) {
  var UrlModel = Backbone.Model.extend({
    defaults : {
      urlparts : []
    },

    getUrlString: function(appSubdomain) {
      return 'http://' + (appSubdomain||'yourapp.com') + '/' +this.get('urlparts').join('/');
    }
  });

  return UrlModel;
});