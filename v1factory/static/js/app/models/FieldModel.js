define(['backbone'], function() {

  var FieldModel = Backbone.Model.extend({
    defaults :{
        "name"     : "description",
        "required" : false,
        "type"     : "text"
    }
  });

  return FieldModel;

});