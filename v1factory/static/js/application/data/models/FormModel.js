define([
  'collections/FormFieldCollection',
  'collections/ActionCollection'
],
function(FormFieldCollection, ActionCollection) {

  var FormModel = Backbone.Model.extend({
    initialize: function(bone) {

      this.set('name', bone.name);
      this.set('fields', new FormFieldCollection());
      this.set('action', bone.action||"create");
      this.set('actions', new ActionCollection(bone.actions || []));
      this.set('belongsTo', bone.belongsTo||null);

      if(bone.fields) {
        this.get('fields').add(bone.fields);
      }
      else {
        var field = {
                        "name": "Submit",
                        "type" : "button",
                        "label" : " ",
                        "displayType": "button",
                        "placeholder": "Submit",
                        "options": []
                    };

        this.get('fields').push(field);
      }

      // should not be an attribute
      this.entity = bone.entity;
      console.log(bone);
      console.trace();
    },

    fillWithProps: function(entity) {
      var self = this;
      _(entity.get('fields').models).each(function(fieldModel) {

        var formFieldModel = {name: fieldModel.get('name'), displayType: "single-line-text", type: fieldModel.get('type')};

        if(fieldModel.get('type') == "email") {
          formFieldModel.displayType = "email-text";
        }
        if(fieldModel.get('type') == "image") {
          formFieldModel.displayType = "image-uploader";
        }
        if(fieldModel.get('type') == "date") {
          formFieldModel.displayType = "date-picker";
        }

        var ind = self.get('fields').models.length - 1;
        self.get('fields').push(formFieldModel, {at: ind});
      });
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.name = json.name || "";
      json.fields = this.get('fields').toJSON();
      if(json.entity.attributes) {
        json.entity = json.entity.get('name');
      }
      return json;
    }

  });

  return FormModel;

});
