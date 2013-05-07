define([
  'app/models/WidgetModel',
  'backbone'
],
function(WidgetModel,
         Backbone) {

  var WidgetCollection = Backbone.Collection.extend({

    model : WidgetModel,
    selectedEl: null,
    hoveredEl: null,

    initialize: function(bone) {
      _.bindAll(this, 'selectWidgetById',
                      'select',
                      'unselectAll');

      this.bind('add', this.select);
    },

    unselectAll: function(inpModel) {
      _.each(this.models, function(model) {
        if(inpModel && model.cid == inpModel.cid) return;
        model.set('selected', false);
      });
      this.selectedEl = inpModel;
    },

    selectWidgetById: function(id) {
      this.collection.get(id).select();
      this.selectedEl = this.get(id);
    },

    select : function(model) {
      this.selectedEl = model;
      model.set('selected', true);
      this.trigger('selected');
      this.unselectAll(model);
    },

    hover : function(model) {
      this.hoveredEl = model;
      this.trigger('hovered');
    },

    removeSelected  : function(e) {
      if(this.editMode !== true) {
        this.remove(this.selectedEl);
        this.selectedEl = null;
        e.preventDefault();
      }
    }
  });

  return WidgetCollection;
});
