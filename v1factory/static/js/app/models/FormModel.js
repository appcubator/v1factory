define([
  'backbone',
  'app/collections/FormFieldCollection'
], function(Backbone, FormFieldCollection) {

  var FormModel = Backbone.Model.extend({
    initialize: function(bone, entity) {

      if(typeof bone == "string") {
        var formName = /\{\{([^\}]+)\}\}/g.exec(bone)[1];
        var formObj  = entity.get('forms').where({name: formName})[0];
        if(!formObj) {
          alert('string could not be resolved into a form');
        }
        bone = formObj.toJSON();
      }

      this.set('name', bone.name);
      this.set('fields', new FormFieldCollection());
      this.set('action', bone.action||"create");

      if(bone.fields) {
        this.get('fields').add(bone.fields);
      }

      // should not be an attribute
      this.entity = entity;
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.fields = this.get('fields').toJSON();
      return json;
    }

  });

  return FormModel;

});