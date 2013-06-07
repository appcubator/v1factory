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
      this.each(function(model) {
        fields = _.union(fields, model.get('fields').models);
      });
      fields = _.uniq(fields, function(obj) { return obj.attributes.name; });

      return fields;
    },

    getRelationsWithName: function(tableNameStr) {
      var arrFields = [];
      this.each(function(table) {
        if(table.get('name') == tableNameStr) return;
        table.get('fields').each(function(fieldModel) {
          if(fieldModel.has('entity_name') && fieldModel.get('entity_name') == tableNameStr) {
            var obj = fieldModel.toJSON();
            obj.entity = table.get('name');
            obj.entity_cid = table.cid;
            arrFields.push(obj);
          }
        });
      });

      return arrFields;
    }
	});

	return UserRolesCollection;
});
