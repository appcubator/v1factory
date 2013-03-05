var EntityCollection = Backbone.Collection.extend({
  model: EntityModel
});

var ElementCollection = Backbone.Collection.extend({
  model : UIElementModel
});

var WidgetCollection = Backbone.Collection.extend({
  model : WidgetModel,
  selectedEl: null,

  initialize: function() {
    _.bindAll(this, 'selectWidgetById',
                    'unselectAll');

    this.model.bind('change:selected', this.selectedChanged);
  },

  unselectAll: function() {
    _.each(this.models, function(model) {
      model.set('selected', false);
    });
    console.log('unss');
    this.selectedEl = null;
  },

  selectWidgetById: function(id) {
    this.collection.get(id).select();
    this.selectedEl = this.get(id);
  },

  selectedChanged : function(model) {
    console.log(model);
  }
});
