define([
  'backbone'
],
function() {

  var EmailModel = Backbone.Model.extend({
    defaults : {
      "name"         : "default-email",
      "subject" : "Default Subject",
      "content"   : "You have received the default email."
    }
  });

  return EmailModel;
});