define([
  'app/collections/WidgetCollection',
  'app/models/QueryModel',
  'app/models/EntityModel',
  'app/models/UserEntityModel',
  'app/models/FormModel',
  'app/models/RowModel'
],
function(WidgetCollection,
         QueryModel,
         EntityModel,
         UserEntityModel,
         FormModel,
         RowModel) {

  var ContainerInfoModel = Backbone.Model.extend({
    initialize: function(bone) {
      this.set('uielements', new WidgetCollection(bone.uielements));

      if(bone.entity) {
        if(!bone.entity.attributes) {

          if(bone.entity == "User") {
            this.set('entity', g_userModel);
          }
          else {
            this.set('entity', g_entityCollection.getEntityWithName(bone.entity));
          }
        }
        else {
          this.set('entity', bone.entity);
        }
      }

      if(bone.row) {
        this.set('row', new RowModel(bone.row));
      }

      if(bone.query) {
        this.set('query', new QueryModel(bone.query, this.get('entity')));
      }

      // if(bone.form) {
      //   if(!bone.form.attributes) {
      //     this.set('form', new FormModel(bone.form, this.get('entity')));
      //   }
      //   else {
      //     this.set('form', bone.form);
      //   }
      // }
    },
    toJSON: function() {
      var json = _.clone(this.attributes);
      json.uielements = this.get('uielements').toJSON();

      if(json.query) {
        json.query = this.get('query').toJSON();
      }

      if(this.has('entity')) {
        if(typeof json.entity !== "string") {
          json.entity = json.entity.get('name');
        }
      }

      if(this.has('row')) {
        json.row = this.get('row').toJSON();
      }

      return json;
    }
  });

  return ContainerInfoModel;
});
