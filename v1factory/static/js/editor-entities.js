var EntityModel = Backbone.Model.extend({
  initialize: function(key, value) {
    this.name = key;
  }
});


var EntityCollection = Backbone.Collection.extend({
  model: EntityModel,

  initialize: function(items) {
    this.add(items);
  }
});


var WidgetEntityView = Backbone.View.extend({
  el : null,
  tagName : 'li',
  className : 'entity-view-li',

  events: {
    'click .create' : 'clickedCreate',
    'click .query' : 'clickedQuery',
    'click .update' : 'clickedUpdate'
  },

  initialize: function(item, widgetCollection){
    var self = this;
    _.bindAll(this, 'render', 'clickedCreate',
                              'clickedUpdate',
                              'clickedQuery');

    console.log(item);
    this.model = item;
    this.parentCollection = item.collection;
    this.widgetCollection = widgetCollection;

    var coordinates = pagesView.unite({x: 0, y:2}, {x: 16, y: 10});
    var widget = {
      top : coordinates.topLeft.y,
      left : coordinates.topLeft.x,
      type : 'container',
      width : coordinates.bottomRight.x - coordinates.topLeft.x,
      height: coordinates.bottomRight.y - coordinates.topLeft.y,
      entity : this.model
    };
    this.widget = widget;
    this.render();
  },

  render: function() {
    this.el.innerHTML = '<div class="entity-name">' + this.model.get('name') + '</div><div class="buttons">'+
                                                    '<span class="create">Create</span>'+
                                                    '<span class="query">Query</span>'+
                                                    '<span class="update">Update</span>';
  },

  clickedCreate: function() {
    this.widget.action = 'create';
    var newModel = new Widget(this.widget);
    this.widgetCollection.add(newModel);
  },

  clickedUpdate: function() {
    this.widget.action = 'update';
    var newModel = new Widget(this.widget);
    this.widgetCollection.add(newModel);
  },

  clickedQuery: function() {
    this.widget.action = 'query';
    var newModel = new Widget(this.widget);
    this.widgetCollection.add(newModel);
  }
});

var WidgetEntitiesListView = Backbone.View.extend({
  el : document.getElementById('entities-list'),
  events : {
  
  },

  initialize: function(widgetCollection){
    var self = this;
    _.bindAll(this, 'render');
    var initialEntities = appState.entities;
    var entities = [];
    _(initialEntities).each(function(entity) {
      entities.push(entity);
    });
    console.log(entities);
    this.collection = new EntityCollection(entities);
    this.widgetCollection = widgetCollection;
    this.render();
  },

  render: function() {
    var self = this;
    this.el.innerHTML = '';
    _(this.collection.models).each(function(item) {
      var view = new WidgetEntityView(item, self.widgetCollection);
      self.el.appendChild(view.el);
    });
  }
});
