define([
  'backbone',
  'mixins/BackboneModal'
],
function(Backbone) {

  var UploadExcelView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'upload-excel',

    initialize: function(entityModel) {
      this.entity = entityModel;
      this.name = entityModel.get('name');
      this.fields = entityModel.get('fields').toJSON();
      this.render();
    },

    render : function(text) {
      var self = this;
      this.el.innerHTML = ['<form enctype="multipart/form-data" method="post" class="upload-form" action="/app/'+ appId +'/entities/xl/">'+
                                  '<input type="file" name="file_name" value="Upload"/>',
                                  '<input type="hidden" name="entity_name" value="'+ self.name+'">',
                                  '<input type="hidden" name="fields" value=\''+ JSON.stringify(self.fields) +'\'>',
                                  '<input type="submit" class="btn" value="Upload">',
                           '</form>'].join('\n');
      return this;
    }
  });

  return UploadExcelView;
});