define([
  'app/models/WidgetModel',
  'app/models/ContainerInfoModel'
],
function(WidgetModel,
         ContainerInfoModel) {

  var ContainerWidgetModel = WidgetModel.extend({
    selected: false,

    defaults: {
      'container_info' : null,
      'deletable' : true
    },

    initialize: function(bone, isNew) {
      ContainerWidgetModel.__super__.initialize.call(this, bone);
      this.set('container_info', new ContainerInfoModel(this.get('container_info'), isNew));
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
