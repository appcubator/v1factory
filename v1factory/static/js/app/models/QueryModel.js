define(['backbone'], function() {

  var QueryModel = Backbone.Model.extend({
    defaults: {
      fieldsToDisplay: [],
      belongsToUser: false,
      sortAccordingTo: "Date",
      numberOfRows: "All"
    },

    initialize: function(bone, entityModel) {
      this.entity = entityModel;
      this.set('fieldsToDisplay', bone.fieldsToDisplay||[]);
      this.set('belongsToUser', bone.belongsToUser||false);
      this.set('sortAccordingTo', bone.sortAccordingTo||"Date");
      this.set('numberOfRows', bone.numberOfRows||"All");
    }

  });

  return QueryModel;
});