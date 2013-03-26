define([
  'app/collections/WidgetCollection',
  'app/models/QueryModel',
  'app/models/EntityModel',
  'app/models/UserEntityModel'
],
function(WidgetCollection, QueryModel, EntityModel, UserEntityModel) {

  var ContainerInfoModel = Backbone.Model.extend({
    initialize: function(bone) {
      this.set('uielements', new WidgetCollection(bone.uielements));

      if(bone.entity && !bone.entity.attributes) {
        if(bone.entity == "User") {
          this.set('entity', new UserEntityModel(bone.entity));
        }
        else {
          this.set('entity', new EntityModel(bone.entity));
        }
      }

      if(bone.query) {
        this.set('query', new QueryModel(bone.query, this.get('entity')));
      }
    },
    toJSON: function() {
      var json = _.clone(this.attributes);
      json.uielements = this.get('uielements').toJSON();

      if(json.query) {
        json.query = this.get('query').toJSON();
      }

      if (this.has('entity')) {
        if(typeof json.entity !== "string") {
          json.entity = json.entity.get('name');
        }
      }

      return json;
    }
  });

  return ContainerInfoModel;
});
