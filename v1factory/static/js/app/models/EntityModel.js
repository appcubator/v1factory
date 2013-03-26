define([
  'app/collections/FieldsCollection',
  'app/collections/FormCollection',
  'backbone'
], function(FieldsCollection, FormCollection) {

  var EntityModel = Backbone.Model.extend({
      initialize: function(bone) {

        if(typeof bone === "string") {
          bone = _.findWhere(appState.entities, {name : bone});
        }

        if(bone.name) {
          this.set('name', bone.name);
        }
        else {
          alert('Entity should have a name. Something is wrong.');
        }

        this.set('fields', new FieldsCollection());
        if(bone.fields) {
          this.get('fields').add(bone.fields);
        }

        this.set('forms', new FormCollection());
        if(bone.forms) {
          this.get('forms').add(bone.forms);
        }

      },
      toJSON: function () {
        alert('yolo');
        var json = {};
        json = _.clone(this.attributes);
        json.fields = this.get('fields').toJSON();
        //json.forms = this.get('forms').toJSON();
        return json;
      }
  });

  return EntityModel;
});