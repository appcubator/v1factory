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
      if(!appState) return;
      if(appState.info) this.set('info', new AppInfoModel(appState.info));
      if(appState.users) this.set('users', new UserEntityModel(appState.users));
      if(appState.entities) this.set('entities', new EntityCollection(appState.entities));
      if(appState.pages) this.set('pages', new PageCollection(appState.pages));
      if(appState.emails) this.set('emails', new EmailCollection(appState.emails));
    }
  });

  return AppModel;
});