define([
  'app/collections/UIElementCollection',
  'backbone'
],
function(UIElementCollection, Backbone) {

  var PageDesignModel = Backbone.Model.extend({
    defaults : {
      "name"         : "default-page",
      "design_props"     : [
        {
          type  : "background-image",
          value : "/static/img/sample_bg.png"
        },
        {
          type  : "background-color",
          value : "#fff"
        },
        {
          type  : "text-color",
          value : "#000"
        },
        {
          type  : "text-size",
          value : '12px'
        },
        {
          type  : "text-family",
          value : '"Helvetica Neue", Helvetica, "Lucida Grande"'
        },
        {
          type  : "header-color",
          value : "#666"
        },
        {
          type  : "header-size",
          value : "16px"
        },
        {
          type  : "header-family",
          value : '"Helvetica Neue", Helvetica, "Lucida Grande"'
        }
      ]
    },

    initialize: function(bone) {
      this.set('name', bone.name||"Random Page");
      this.set('uielements', new UIElementCollection(bone.uielements||[]));
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      return json;
    }
  });

  return PageDesignModel;
});