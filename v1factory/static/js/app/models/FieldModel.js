define(['backbone'], function() {

  var FieldModel = Backbone.Model.extend({
    defaults :{
        "required" : false,
        "type"     : "text"
    },

    initialize: function(bone) {
      console.log(bone);
    }

  });

  return FieldModel;

});