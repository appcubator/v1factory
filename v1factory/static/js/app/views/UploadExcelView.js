define([
  'backbone',
  'backboneui'
],
function(Backbone, BackboneUI) {
  
  var UploadExcelView = BackboneUI.ModalView.extend({
    tagName: 'div',
    className: 'upload-excel',
    
    initialize: function(entitiyModel) {
      this.render();
    },
    
    render : function(text) {
      this.el.innerHTML = '<form enctype="multipart/form-data" method="post" action="/app/'+ appId +'/entities/xl/">'+
                                  '<input type="file" name="file_name" value="Upload"/><input type="submit" value="Upload"></form>';
      return this;
    }
  });

  return UploadExcelView;
});