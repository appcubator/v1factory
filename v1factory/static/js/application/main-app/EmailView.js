define([
	'models/EmailModel',
	'backbone'
], function(EmailModel) {
	var EmailView = Backbone.View.extend({
		events: {
			'keydown input': 'saveChange'
		},
		initialize: function(options) {
			_.bindAll(this);
			this.model = options.model;
		},
		render: function() {
			this.$el.find('input#edit-name').val(this.model.get('name'));
      		this.$el.find('input#edit-subject').val(this.model.get('subject'));
      		this.$el.find('textarea#edit-content').val(this.model.get('content'));
      		return this;
		},
		saveChange: function(e) {
			var value = e.currentTarget.value;
			var attribute = (e.currentTarget.id).replace("edit-", "");
			if(!value) {
				return;
			}
			if(attribute != "name" || attribute != "subject" || attribute != "content") {
				console.error("invalid attribute");
			}
			this.model.set(attribute, value);
		}
	});

	return EmailView;
});
