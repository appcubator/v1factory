define(['../collections/WidgetCollection'], function(WidgetCollection) {

  var ContainerInfoModel = Backbone.Model.extend({
    initialize: function(bone) {
      var WidgetCollection = require('../collections/WidgetCollection');
      this.set('uielements', new WidgetCollection(bone.uielements));
    },
    toJSON: function() {
      var json = _.clone(this.attributes);
      json.uielements = this.get('uielements').toJSON();
      if (this.has('entity')) {
        json.entity = _.clone(this.get('entity').attributes);
        if(typeof json.entity !== "string") {
          json.entity = json.entity.name;
        }
      }

      return json;
    }
  });

  return ContainerInfoModel;
});
