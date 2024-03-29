define([
  'backbone',
  'app/collections/FormFieldCollection'
],
function(Backbone, FormFieldCollection) {

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
      this.set('goto', bone.goto||"internal://Homepage/");
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
      this.entity = entity;
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
      return json;
    }

  });

  return FormModel;

});
