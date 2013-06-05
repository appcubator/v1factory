define([
	'models/UserEntityModel'
], function(UserEntityModel) {
	var UserRolesCollection = Backbone.Collection.extend({
		model: UserEntityModel,

    getUserEntityWithName: function(entityNameStr) {
      var entity = this.where({name : entityNameStr })[0];
      return entity;
    },

    getCommonProps: function() {
      var fields = this.models[0].get('fields').models;
      console.log(fields);
      this.each(function(model) {
        fields = _.union(fields, model.get('fields').models);
      });

      fields = _.uniq(fields, function(obj) { return obj.attributes.name; });

      console.log(fields);
      return fields;
    }

	});

	return UserRolesCollection;
});
