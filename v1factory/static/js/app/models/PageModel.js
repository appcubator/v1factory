define([
  'app/models/UrlModel',
  'app/models/NavbarModel',
  'app/models/ContainerWidgetModel',
  'app/models/WidgetModel',
  'app/collections/WidgetCollection',
  'backbone'
],
function(UrlModel, NavbarModel, ContainerWidgetModel, WidgetModel, WidgetCollection) {

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
      this.set('uielements', new WidgetCollection());
      var self = this;
      _(bone.uielements).each(function(uielement) {
        if(uielement.container_info) {
          self.get('uielements').push(new ContainerWidgetModel(uielement));
        }
        else {
          self.get('uielements').push(new WidgetModel(uielement));
        }
      });
    },

    getHeight: function() {
      var height  = 0;

      _(this.get('uielements').models).each(function(uielement) {
        var layout = uielement.get('layout');
        var bottom = layout.get('top') + layout.get('height');
        if(bottom > height) { console.log(uielement); height = bottom; }
      });

      return height;
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