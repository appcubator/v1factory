define([
  'app/models/UrlModel',
  'app/models/NavbarModel',
  'app/collections/WidgetCollection',
  'backbone'
],
function(UrlModel, NavbarModel, WidgetCollection) {

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
      this.set('uielements', new WidgetCollection(bone.uielements||[]));
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.url = this.get('url').toJSON();
      json.navbar = this.get('navbar').toJSON();
      json.uielements = this.get('uielements').toJSON();
      return json;
    }
  });

  return PageModel;
});