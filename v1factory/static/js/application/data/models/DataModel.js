define([
  'models/ContentModel',
  'models/ContainerInfoModel'
],
function(ContentModel,
         ContainerInfoModel) {

  var DataModel = Backbone.Model.extend({

    initialize: function(bone, isNew) {

      this.set('content_attribs', new ContentModel(bone.content_attribs||{}));

      if(bone.container_info) {
        this.set('container_info', new ContainerInfoModel(bone.container_info, isNew));
      }

    }

  });

  return DataModel;
});