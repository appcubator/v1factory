define(['backbone',
        '../collections/FieldsCollection'], function(Backbone, FieldsCollection) {

  var EntityModel = Backbone.Model.extend({
      defaults: {
        name: "default name"
      },
      initialize: function(bone) {
        var fieldCollection = new FieldsCollection();

        if(bone) fieldCollection.add(bone.fields);
        //this.bind('change', iui.askBeforeLeave);
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