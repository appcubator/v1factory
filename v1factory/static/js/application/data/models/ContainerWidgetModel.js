define([
  'models/WidgetModel'
],
function(WidgetModel) {

  var ContainerWidgetModel = WidgetModel.extend({
    selected: false,

    defaults: {
      'container_info' : null,
      'deletable' : true
    },

    initialize: function(bone, isNew) {
      ContainerWidgetModel.__super__.initialize.call(this, bone);
    },

    toJSON : function() {
      var json = _.clone(this.attributes);
      json = _.omit(json, 'selected', 'deletable');

      json.content_attribs = this.get('content_attribs').toJSON()|| {};
      json.content = this.get('content')||'';
      json.layout  = this.get('layout').toJSON();
      if(json.container_info) {
        json.container_info = this.get('container_info').toJSON();
      }

      if(this.has('container_info')) {
        json.container_info = this.get('container_info').toJSON();
      }

      return json;
    }
  });

  return ContainerWidgetModel;
});
