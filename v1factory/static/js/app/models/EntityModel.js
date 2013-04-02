define([
  'require',
  'app/collections/FieldsCollection',
  'app/collections/FormCollection',
  'backbone'
], function(require) {
  //FieldsCollection, FormCollection
  var FieldsCollection = require('app/collections/FieldsCollection');
  var FormCollection   = require('app/collections/FormCollection');
  var Backbone         = require('backbone');

  var EntityModel = Backbone.Model.extend({
      initialize: function(bone) {

        if(typeof bone === "string") {
          if(bone === "User") {
            alert('EntityModel init isnt supposed to receive user');
            return;
          }

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
        var json = {};
        json = _.clone(this.attributes);
        json.fields = this.get('fields').toJSON();
        json.forms = this.get('forms').toJSON();
        return json;
      },

      getFormWithName: function(str) {
        var formName = /\{\{([^\}]+)\}\}/g.exec(str)[1];
        var formModel = this.get('forms').where({name : formName})[0];
        return formModel;
      }
  });

  return EntityModel;
});