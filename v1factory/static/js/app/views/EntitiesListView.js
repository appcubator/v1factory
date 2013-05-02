define([
  'app/models/EntityModel',
  'app/models/UserEntityModel',
  'app/models/FieldModel',
  'app/views/UploadExcelView',
  'app/views/ShowDataView',
  'app/views/EntityView',
  'app/views/UserEntityView',
  'app/collections/EntityCollection',
  'app/models/PageModel'
],

function(EntityModel,
         UserEntityModel,
         FieldModel,
         UploadExcelView,
         ShowDataView,
         EntityView,
         UserEntityView,
         EntityCollection,
         PageModel) {

    var EntityListView = Backbone.View.extend({

      initialize: function(entitiesColl) {
        _.bindAll(this, 'render', 'appendItem');

        var self = this;

        this.collection = v1State.get('entities');
        this.collection.bind("add", this.appendItem);
        this.collection.bind("add", this.createRelatedPages);

        this.collection.trigger('initialized');
      },

      render: function(){
        var self = this;
        _(this.collection.models).each(function(entityModel) {
          self.appendItem(entityModel);
        });
        return this;
      },

      appendItem: function(entityModel) {
        var entityView = new EntityView(entityModel, 'entity-list-', this.collection);
        this.el.appendChild(entityView.el);
      },

      createRelatedPages: function(entityModel) {
        var underscoredName = entityModel.get('name').replace(' ', '_');
        var contextPage = new PageModel({
          name : underscoredName + ' Page',
          url : {
            urlparts : [underscoredName, '{{' +  entityModel.get('name') + '}}']
          }
        });
        v1State.get('pages').push(contextPage);
      }

    });

    return EntityListView;

});
