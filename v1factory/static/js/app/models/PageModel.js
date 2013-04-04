define([
  'app/models/UrlModel',
  'backbone'
],
function(UrlModel, Backbone) {

  var PageModel = Backbone.Model.extend({
    defaults : {
      "name"         : "default-page",
      "access_level" : "all",
      "uielements"   : []
    },
    initialize: function(bone) {
      bone = bone||{};
      this.set('url', new UrlModel(bone.url||{}));
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.url = this.get('url').toJSON();
      return json;
    }
  });

  return PageModel;
});