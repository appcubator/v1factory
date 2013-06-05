define([
  'models/AppInfoModel',
  'collections/UserRolesCollection',
  'collections/EntityCollection',
  'collections/PageCollection',
  'collections/MobilePageCollection',
  'collections/EmailCollection'
],
function(AppInfoModel,
         UserRolesCollection,
         EntityCollection,
         PageCollection,
         MobilePageCollection,
         EmailCollection) {

  var AppModel = Backbone.Model.extend({
    initialize: function(appState) {
      if(!appState) return;

      this.set('name', appState.name || "");
      if(appState.info) this.set('info', new AppInfoModel(appState.info));
      if(appState.users) this.set('users', new UserRolesCollection(appState.users));
      this.set('entities', new EntityCollection(appState.entities||[]));
      if(appState.emails) this.set('emails', new EmailCollection(appState.emails));
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.info = json.info.toJSON();
      json.users = json.users.toJSON();
      json.entities = json.entities.toJSON();
      json.pages = json.pages.toJSON();
      json.mobilePages = json.mobilePages.toJSON();
      json.emails = json.emails.toJSON();

      return json;
    }
  });

  return AppModel;
});
