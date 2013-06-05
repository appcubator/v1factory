define([
  'models/AppInfoModel',
  'collections/UserRolesCollection',
  'collections/TableCollection',
  'collections/PageCollection',
  'collections/MobilePageCollection',
  'collections/EmailCollection'
],
function(AppInfoModel,
         UserRolesCollection,
         TableCollection,
         PageCollection,
         MobilePageCollection,
         EmailCollection) {

  var AppModel = Backbone.Model.extend({
    initialize: function(appState) {
      if(!appState) return;

      this.set('info', new AppInfoModel(appState.info));
      this.set('users', new UserRolesCollection(appState.users||[]));
      this.set('tables', new TableCollection(appState.tables||[]));
      this.set('emails', new EmailCollection(appState.emails));
      this.set('pages', new PageCollection(appState.pages||[]));
      this.set('mobilePages', new MobilePageCollection(appState.mobilePages||[]));

    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.info = json.info.toJSON();
      json.users = json.users.toJSON();
      json.tables = json.tables.toJSON();
      json.pages = json.pages.toJSON();
      json.mobilePages = json.mobilePages.toJSON();
      json.emails = json.emails.toJSON();

      return json;
    }
  });

  return AppModel;
});
