define(
  ['../collections/FieldsCollection',
  'backbone'], function(FieldsCollection) {

  var EntityModel = Backbone.Model.extend({
      defaults: {
        name: "default name"
      },
      initialize: function(bone) {
        console.log(bone);
        var fieldCollection = new FieldsCollection();

        if(bone) fieldCollection.add(bone.fields);
        this.set('fields', fieldCollection);
        //this.bind('change', iui.askBeforeLeave);
        console.log(this);
        //bone.fields = fieldCollection;
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