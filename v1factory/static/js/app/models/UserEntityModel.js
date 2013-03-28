define([
  'app/models/EntityModel',
  'app/models/FieldModel',
  'app/collections/FormCollection',
  'app/collections/FieldsCollection',
  'backbone'
],
function(EntityModel, FieldModel,FormCollection, FieldsCollection, Backbone) {
  console.log(EntityModel);
  var UserEntityModel = EntityModel.extend({
    defaults : {
      facebook : false,
      linkedin : false,
      local : true
    },

    initialize: function(bone) {
      var fieldCollection = new FieldsCollection();
      if(bone) fieldCollection.add(bone.fields);
      //this.bind('change', function(){iui.askBeforeLeave});
      this.set('fields', fieldCollection);

      this.set('forms', new FormCollection());
      if(bone.forms) {
        this.get('forms').add(bone.forms);
      }
    },

    toJSON: function () {
      var json = {};
      json = _.clone(this.attributes);
      json.fields = this.get('fields').toJSON();
      json.fields = _.uniq(json.fields, function(val) { return val.name; });

      return json;
    }
  });

  return UserEntityModel;
});