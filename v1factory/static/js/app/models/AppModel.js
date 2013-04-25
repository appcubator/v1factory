define([
  'app/models/AppInfoModel',
  'app/models/UserEntityModel',
  'app/collections/EntityCollection',
  'app/collections/PageCollection',
  'app/collections/EmailCollection'
],
function(AppInfoModel,
         UserEntityModel,
         EntityCollection,
         PageCollection,
         EmailCollection) {

  var AppModel = Backbone.Model.extend({
    initialize: function(appState) {
      this.set('info', new AppInfoModel(appState.info));
      this.set('entities', new EntityCollection(appState.entities));
      this.set('users', new UserEntityModel(appState.users));
      this.set('pages', new PageCollection(appState.pages));
      this.set('emails', new EmailCollection(appState.emails));
    }
  });

  return AppModel;
});