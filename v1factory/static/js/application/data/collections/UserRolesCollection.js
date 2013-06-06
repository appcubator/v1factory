define([
	'models/UserTableModel'
], function(UserTableModel) {
	var UserRolesCollection = Backbone.Collection.extend({
		model: UserTableModel,

    getUserTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
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
