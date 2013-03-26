define([
  'backbone',
  'app/collections/FormFieldCollection'
], function(Backbone, FormFieldCollection) {

  var FormModel = Backbone.Model.extend({
    initialize: function(bone, entity) {

      this.set('name', bone.name);
      this.set('fields', new FormFieldCollection());

      if(bone.fields) {
        this.get('fields').add(bone.fields);
      }

      // should not an attribute
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