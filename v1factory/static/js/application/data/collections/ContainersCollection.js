define([
  'models/ContainerWidgetModel',
  'backbone'
],
function(ContainerWidgetModel,
         Backbone) {

  var ContainersCollection = Backbone.Collection.extend({

    model : ContainerWidgetModel,
    selectedEl: null,

    initialize: function() {
      _.bindAll(this, 'selectWidgetById',
                      'select',
                      'unselectAll');

      this.model.bind('change:selected', this.selectedChanged);
    },

    unselectAll: function() {
      _.each(this.models, function(model) {
        model.set('selected', false);
      });
      this.selectedEl = null;
    },

    selectWidgetById: function(id) {
      this.collection.get(id).select();
      this.selectedEl = this.get(id);
    },

    selectedChanged : function(model) {
      this.trigger('selectedChanged');
    },

    select : function(model) {
      this.unselectAll();
      this.selectedEl = model;
      this.trigger('selected');
    },

    removeSelected  : function(e) {
      if(this.editMode !== true) {
        this.remove(this.selectedEl);
        this.selectedEl = null;
        e.preventDefault();
      }
    }
  });

  return ContainersCollection;
});
