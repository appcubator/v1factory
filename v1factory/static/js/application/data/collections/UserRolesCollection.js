define([
	'models/UserEntityModel'
], function(UserEntityModel) {
	var UserRolesCollection = Backbone.Collection.extend({
		model: UserEntityModel
	});

	return UserRolesCollection;
});
