define([
	'models/UserTableModel',
  'collections/TableCollection'
], function(UserTableModel, TableCollection) {

  var UserRolesCollection = TableCollection.extend({
		model: UserTableModel,

    getUserTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
    }

	});

	return UserRolesCollection;
});
