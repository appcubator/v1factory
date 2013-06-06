define(['backbone'], function() {

  var FieldModel = Backbone.Model.extend({
    defaults :{
      "required" : false,
      "type"     : "text"
    }
  });

  return FieldModel;

});