/*
 *  Editor - Entities
 *  Written by icanberk
 *
 *  Abstract:
 *  This module creates and controls the entities section
 *  on the right of the editor page.
 *
 *  Includes:
 *  - EntityModel
 *  - EntityCollection
 *  - EntityView
 *  - EntitiesListView
 *
 */

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


var EntityView = Backbone.View.extend({
  el : null,
  tagName : 'li',
  className : 'entity-view-li',

  events: {
    'click .create' : 'clickedCreate',
    'click .query'  : 'clickedQuery',
    'click .update' : 'clickedUpdate'
  },

  initialize: function(item, widgetCollection){
    var self = this;
    _.bindAll(this, 'render', 
                    'clickedCreate',
                    'clickedUpdate',
                    'clickedQuery');

    this.model = item;
    this.parentCollection = item.collection;
    this.widgetCollection = widgetCollection;

    var widget = {
      type   : 'container',
      entity : this.model
    };

    this.widget = widget;
    this.render();
  },

  render: function() {
    var name = this.model.get('name');
    this.el.innerHTML = '<div class="buttons">'+
                        '<span class="create">Create '+name+'</span>'+
                        '<span class="query">Query '+name+'</span>'+
                        '<span class="update">Update '+name+'</span></div>';
  },

  clickedCreate: function(e) {
    this.widget.action = 'create';
    var newWidget = new Widget(this.widget);
    newWidget.assignCoord();
    this.widgetCollection.add(newWidget);

    e.preventDefault();
    return false;
  },

  clickedUpdate: function(e) {
    this.widget.action = 'update';
    this.widgetCollection.add(new Widget(this.widget));
    e.preventDefault();
    return false;
  },

  clickedQuery: function(e) {
    this.widget.action = 'query';
    this.widgetCollection.add(new Widget(this.widget));
    e.preventDefault();
    return false;
  },

  assignCoord: function() {
    var coordinates = currentCoord? pagesView.unite(currentCoord.initCor, currentCoord.lastCor):
                                    pagesView.unite({x: 0, y:2}, {x: 16, y: 10});

    console.log(coordinates);
  }
});

var EntitiesListView = Backbone.View.extend({
  el : document.getElementById('entities-list'),

  initialize: function(widgetCollection) {
    _.bindAll(this, 'render');

    var self = this;
    var initialEntities = appState.entities;
    var entities = [];
    _(initialEntities).each(function(entity) {
      entities.push(entity);
    });

    this.collection = new EntityCollection(entities);
    this.widgetCollection = widgetCollection;
    this.render();
  },

  render: function() {
    var self = this;
    this.el.innerHTML = '';
    _(this.collection.models).each(function(item) {
      var view = new EntityView(item, self.widgetCollection);
      self.el.appendChild(view.el);
    });
  }
});
