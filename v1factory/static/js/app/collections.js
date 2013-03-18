var EntityCollection = Backbone.Collection.extend({
  model: EntityModel
});

var ElementCollection = Backbone.Collection.extend({
  model : UIElementModel
});

var FieldsCollection = Backbone.Collection.extend({
  model : FieldModel
});

var WidgetCollection = Backbone.Collection.extend({
  model : WidgetModel,
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
    console.log(model);
  },

  select : function(model) {
    this.unselectAll();
    this.selectedEl = model;
  },

  removeSelected  : function(e) {
    if(this.editMode !== true) {
      this.remove(this.selectedEl);
      this.selectedEl = null;
      e.preventDefault();
    }
  }
});

var UrlsCollection = Backbone.Collection.extend({
  model: UrlModel
});

