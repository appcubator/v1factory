define([
  'app/models/UrlModel',
  'app/models/NavbarModel',
  'backbone'
],
function(UrlModel, NavbarModel) {

  var PageModel = Backbone.Model.extend({
    defaults : {
      "name"         : "default-page",
      "access_level" : "all",
      "uielements"   : []
    },
    initialize: function(bone) {
      bone = bone||{};
      this.set('url', new UrlModel(bone.url||{}));
      this.set('navbar', new NavbarModel(bone.navbar||{}));
    },

    toJSON: function() {
      console.log("YOO");
      var json = _.clone(this.attributes);
      json.url = this.get('url').toJSON();
      json.navbar = this.get('navbar').toJSON();
      return json;
    }
  });

  return PageModel;
});