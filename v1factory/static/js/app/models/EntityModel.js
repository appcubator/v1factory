define(
 ['../collections/FieldsCollection',
  'backbone'],
  function(FieldsCollection) {

  var EntityModel = Backbone.Model.extend({
      initialize: function(bone) {

        if(typeof bone === "string") {
          bone = _.findWhere(appState.entities, {name : bone});
        }
        console.log(bone);
        this.set('name', bone.name);
        var fieldCollection = new FieldsCollection();
        if(bone) fieldCollection.add(bone.fields);
        this.set('fields', fieldCollection);
      },
      toJSON: function () {
        var json = {};
        json = _.clone(this.attributes);
        json.fields = this.get('fields').toJSON();
        return json;
      }
  });

  return EntityModel;
});