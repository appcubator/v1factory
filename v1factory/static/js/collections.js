var EntityCollection = Backbone.Collection.extend({
  model: EntityModel,
  add: function(inpObjs) {
    _.each(inpObjs, function(inpObj,ind) {
      if(!inpObj.fields) {
        inpObj = _.where(appState.entities, {name: inpObj})[0];
        inpObjs[ind] = inpObj;
      }
    });

    Backbone.Collection.prototype.add.call(this, inpObjs);
  }
});

var ElementCollection = Backbone.Collection.extend({
  model : UIElementModel
});