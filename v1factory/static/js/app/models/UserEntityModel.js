define([
  'app/models/EntityModel',
  'app/models/FieldModel',
  'app/collections/FormCollection',
  'app/collections/FieldsCollection',
  'backbone'
],
function(EntityModel, FieldModel, FormCollection, FieldsCollection, Backbone) {

  var UserEntityModel = EntityModel.extend({
    defaults : {
      facebook : false,
      linkedin : false,
      local : true
    },

    initialize: function(bone) {

      if(typeof bone === "string") {
        bone = appState.users;
      }

      var fieldCollection = new FieldsCollection();
      if(bone) fieldCollection.add(bone.fields);
      this.set('fields', fieldCollection);
      this.set('forms', new FormCollection());
      this.set('name', 'User');

      if(bone.forms) {
        this.get('forms').add(bone.forms);
      }
    },

    toJSON: function () {
      var json = {};
      json = _.clone(this.attributes);
      json.fields = this.get('fields').toJSON();
      json.fields = _.uniq(json.fields, function(val) { return val.name; });
      json.forms = this.get('forms').toJSON();
      return json;
    },

    getFormWithName: function(str) {
      var formName = /\{\{([^\}]+)\}\}/g.exec(str)[1];
      var formModel = this.get('forms').where({name : formName})[0];
      return formModel;
    }
  });

  return UserEntityModel;
});