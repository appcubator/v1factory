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
  defaults: {
    name: "default name",
    fields: []
  }
});


var EntityCollection = Backbone.Collection.extend({
  model: EntityModel,
  add: function(inpObjs) {
    _.each(inpObjs, function(inpObj,ind) {
      console.log(inpObj);
      if(!inpObj.fields) {
        inpObj = _.where(appState.entities, {name: inpObj})[0];
        inpObjs[ind] = inpObj;
      }
    });

    Backbone.Collection.prototype.add.call(this, inpObjs);
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

    return false;
  },

  clickedUpdate: function(e) {
    this.widget.action = 'update';
    var newWidget = new Widget(this.widget);
    newWidget.assignCoord();
    this.widgetCollection.add(newWidget);

    return false;
  },

  clickedQuery: function(e) {
    this.widget.action = 'query';
    var newWidget = new Widget(this.widget);
    newWidget.assignCoord();
    this.widgetCollection.add(newWidget);

    return false;
  },

  assignCoord: function() {
    var coordinates = currentCoord? pagesView.unite(currentCoord.initCor, currentCoord.lastCor):
                                    pagesView.unite({x: 0, y:2}, {x: 16, y: 10});

    console.log(coordinates);
  }
});

var EntityContextView = EntityView.extend({
  events: {
    'click .entity-sing-text' : 'clickedEntitySingText'
  },

  initialize: function(item, widgetCollection) {
    this.constructor.__super__.initialize.apply(this, [item, widgetCollection]);
    _.bindAll(this, 'clickedEntitySingText');
  },

  render: function() {
    var self = this;
    var name = this.model.get('name');
    this.el.innerHTML = '<div class="buttons">';
    _(this.model.get('fields')).each(function(field) {
      self.el.innerHTML += '<span id="'+ field.name +'" class="entity-sing-text">Display ' + name +' '+field.name+'</span>';
    });
    this.el.innerHTML += '</div>';
  },

  clickedEntitySingText: function(e) {

    this.widget.action = 'display';
    this.widget.displayType = 'text';
    this.widget.type = 'container',
    this.widget.entity = this.model;
    this.widget.field =  e.target.id;

    var newView = new Widget(this.widget);
    newView.assignCoord();
    this.widgetCollection.add(newView);

    return false;
  }
});

var EntitiesListView = Backbone.View.extend({
  el : document.getElementById('entities-list'),

  initialize: function(contextEntities, widgetCollection) {
    _.bindAll(this, 'render');

    this.render();

    this.collection = new EntityCollection();
    this.collection.bind('add', this.appendEntity, this);
    this.contextCollection = new EntityCollection();
    this.contextCollection.bind('add', this.appendContextEntity, this);

    this.widgetCollection = widgetCollection;

    this.contextCollection.add(contextEntities);
    this.collection.add(appState.entities);
  },

  render: function() {
  },

  appendEntity: function(entityModel) {
    var view = new EntityView(entityModel, this.widgetCollection);
    this.el.appendChild(view.el);
  },

  appendContextEntity: function(entityModel) {
    var view = new EntityContextView(entityModel, this.widgetCollection);
    this.el.appendChild(view.el);
  }
});
