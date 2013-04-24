define([
  'app/models/EntityModel',
  'app/models/UserEntityModel',
  'app/models/FieldModel',
  'app/views/UploadExcelView',
  'app/views/ShowDataView',
  'app/views/EntityView',
  'app/views/UserEntityView',
  'app/collections/EntityCollection'
],

function(EntityModel,
         UserEntityModel,
         FieldModel,
         UploadExcelView,
         ShowDataView,
         EntityView,
         UserEntityView,
         EntityCollection) {

    var EntityListView = Backbone.View.extend({

      initialize: function(entitiesColl) {
        _.bindAll(this, 'render', 'appendItem');

        var self = this;

        this.collection = entitiesColl;
        this.collection.bind("add", this.appendItem);

        this.collection.trigger('initialized');
      },

      render: function(){
        console.log("render");
        console.log(this.el);
        var self = this;
        _(this.collection.models).each(function(entityModel) {
          self.appendItem(entityModel);
        });
        return this;
      },

      appendItem: function(entityModel) {
        var entityView = new EntityView(entityModel, 'entity-list-', this.collection);
        this.el.appendChild(entityView.el);
      }
    });

    return EntityListView;

});
