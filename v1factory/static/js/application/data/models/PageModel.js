define([
  'models/UrlModel',
  'models/NavbarModel',
  'models/FooterModel',
  'models/ContainerWidgetModel',
  'models/WidgetModel',
  'collections/WidgetCollection',
  'backbone'
],
function(UrlModel, NavbarModel, FooterModel, ContainerWidgetModel, WidgetModel, WidgetCollection) {

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
      this.set('footer', new FooterModel(bone.footer||{}));
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
        if(bottom > height) { height = bottom; }
      });

      return height;
    },

    getFields: function() {
      var access = this.get('access_level');
      if(access == "all") { return []; }
      if(access == "all-users") { return v1State.get('users').getCommonProps(); }

      var model = v1State.get('users').getUserEntityWithName(access);
      return model.get('fields');
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.url = this.get('url').toJSON();
      json.navbar = this.get('navbar').toJSON();
      json.footer = this.get('footer').toJSON();
      json.uielements = this.get('uielements').toJSON();
      return json;
    }
  });

  return PageModel;
});
