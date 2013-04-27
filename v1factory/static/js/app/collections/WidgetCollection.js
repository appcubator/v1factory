define([
  'app/models/WidgetModel',
  'backbone'
],
function(WidgetModel,
         Backbone) {

  var WidgetCollection = Backbone.Collection.extend({

    model : WidgetModel,
    selectedEl: null,

    initialize: function(bone) {
      console.log(bone);

      _.bindAll(this, 'selectWidgetById',
                      'select',
                      'unselectAll');

      this.bind('change:selected', this.selectedChanged);
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

    selectedChanged : function(model) {
    },

    select : function(model) {
      console.log(model);
      this.selectedEl = model;
      model.set('selected', true);
      this.trigger('selected');
      this.unselectAll(model);
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
