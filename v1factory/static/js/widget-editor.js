/*
 *  Widget Editor
 *  Written by icanberk
 *
 *  Abstract:
 *  This module controls the widgets and interactions with the side
 *  panels on the editor page.
 *
 *  Includes:
 *  - EntityModel
 *  - EntityCollection
 *  - Widget
 *  - WidgetCollection
 *  - WidgetView
 *  - EntityUIContainer
 *  - WidgetMenuView
 *  - WidgetInfoView
 *  - WidgetEntityView
 *  - WidgetEntitiesListView
 *  - WidgetEditorView
 */

var GRID_WIDTH = 30;
var GRID_HEIGHT = 30;


var EntityModel = Backbone.Model.extend({
  initialize: function(key, value) {
    this.name = key;
  }
});


var EntityCollection = Backbone.Collection.extend({
  model: EntityModel,

  initialize: function(items) {
    _(items).each(function(item){
      item['attributes'] = item.fields;
      item.fields = null;
    });
    this.add(items);
  }
});


var Widget = Backbone.Model.extend({
  selected: false,

  initialize: function() {
    _.bindAll(this, 'select');
  },

  select: function() {
    this.collection.unselectAll();
    this.set('selected', true);
    widgetInfoView.show(this);
  }
});


var WidgetCollection = Backbone.Collection.extend({
  model : Widget,
  selectedElement: null,

  initialize: function() {
    _.bindAll(this, 'selectWidgetById',
                    'unselectAll');
  },

  unselectAll: function() {
    _.each(this.models, function(model) {
      model.set('selected', false);
    });
  },

  selectWidgetById: function(id) {
    this.collection.get(id).select();
    this.selectedElement = this.collection.get(id);
  }
});

var WidgetView = Backbone.View.extend({
  el: null,
  className: 'pseudo-outline',
  tagName : 'span',
  widget :null,
  selected : false,

  events: {
    'click .widget' : 'select',
    'click .delete' : 'remove'
  },

  initialize: function(item){
    var self = this;
    _.bindAll(this, 'render',
                    'remove',
                    'select',
                    'outlineSelected',
                    'changedWidth',
                    'changedHeight',
                    'changedTop',
                    'changedLeft');

    this.model = item;
    this.model.bind("change:selected", this.outlineSelected, this);
    this.model.bind("change:width", this.changedWidth, this);
    this.model.bind("change:height", this.changedHeight, this);
    this.model.bind("change:top", this.changedTop, this);
    this.model.bind("change:left", this.changedLeft, this);

    this.render(item);
  },

  render: function(widget) {
    this.el.innerHTML = '';

    /* TODO: Make a better way to fetch these once we have
       the gallery set up */
    var element = document.getElementById(widget.get('type')).firstChild.cloneNode(true);
    var width = widget.get('width');
    var height = widget.get('height');
    
    element.setAttribute("style","position:absolute;");
    element.style.top = (GRID_HEIGHT * (widget.get('top')-1)) + 'px';
    element.style.left = (GRID_HEIGHT * (widget.get('left')-1)) + 'px';
    element.className = 'widget span'+width;
    element.style.height = (height * GRID_HEIGHT) + 'px';
    element.id = 'widget-' + this.collection.length;
    element.innerHTML = widget.get('text') || "BLANK TEXT";

    meta = document.createElement('div');
    meta.className = 'meta';
    deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete';
    deleteBtn.appendChild(document.createTextNode('delete'));
    meta.appendChild(deleteBtn);

    element.appendChild(meta);
    this.widget = element;
    this.el.appendChild(element);
    this.model.select();
  },

  remove: function() {
    widgetCollection.remove(this);
    $(this.el).remove();
  },

  select: function() {
    this.model.select();
  },

  outlineSelected: function() {
    if(this.model.attributes.selected && this.selected === false) {
      $(this.widget).addClass('selected');
      this.selected = true;
    }
    else {
      $(this.widget).removeClass('selected');
      this.selected = false;
    }
  },

  changedWidth: function(a) {
    this.widget.className = 'selected widget span' + this.model.attributes.width;
  },

  changedHeight: function(a) {
    this.widget.style.height = (this.model.attributes.height * GRID_HEIGHT) + 'px';
  },

  changedTop: function(a) {
    this.widget.style.top = (GRID_HEIGHT * (this.model.get('top')-1)) + 'px';
  },

  changedLeft: function(a) {
    this.widget.style.left = (GRID_HEIGHT * (this.model.get('left')-1)) + 'px';
  }
});


var EntityUIContainer = Backbone.View.extend({
  el: null,
  className: 'container-create',
  tagName : 'div',
  entity: null,
  type: null,
  events: {
    'click .widgets-container' : 'select',
    'click .delete' : 'remove'
  },

  initialize: function(item) {
    _.bindAll(this, 'render',
                    'placeWidget',
                    'placeCreateWidgets',
                    'placeShowWidgets',
                    'placeUpdateWidgets',
                    'select');
    
    this.model = item;
    // this.model.bind("change:selected", this.outlineSelected, this);
    // this.model.bind("change:width", this.changedWidth, this);
    // this.model.bind("change:height", this.changedHeight, this);
    // this.model.bind("change:coordinates", this.changedCoordinates, this);

    this.entity = item.attributes.entity;
    var collection = new WidgetCollection();
    this.model.set('childCollection', collection);
    collection.bind("add", this.placeWidget);

    this.render(item);

    switch (item.attributes.action) {
    case "create":
      this.placeCreateWidgets();
      break;
    case "show":
      this.placeShowWidgets();
      break;
    case "update":
      this.placeUpdateWidgets();
      break;
    }
  },

  render: function(widget) {
    this.el.innerHTML = '';

    // var element = document.getElementById(widget.get('type')).firstChild.cloneNode(true);
    var element = document.createElement('div');
    var width = widget.get('width');
    var height = widget.get('height');
    
    element.setAttribute("style","position:relative;");
    element.style.top = (GRID_HEIGHT * (widget.get('top') -1)) + 'px';
    element.style.left = (GRID_HEIGHT * (widget.get('left') -1)) + 'px';
    element.className = 'widgets-container span'+width;
    element.style.height = (height * GRID_HEIGHT) + 'px';
    element.id = 'widget-' + this.collection.length;

    meta = document.createElement('div');
    meta.className = 'meta';
    deleteBtn = document.createElement('div');
    deleteBtn.className = 'delete';
    deleteBtn.appendChild(document.createTextNode('delete'));
    meta.appendChild(deleteBtn);

    element.appendChild(meta);
    this.widgetsContainer = element;
    this.el.appendChild(element);
    //this.model.select();
  },

  placeWidget: function(model, a) {
    var widgetView = new WidgetView(model);
    this.widgetsContainer.appendChild(widgetView.el);
  },

  placeCreateWidgets: function() {

  },

  placeShowWidgets: function() {
    var nmrAttributes = 0;
    var self = this;
    var widgets = [];
    _(self.entity.attributes.attributes).each(function(val, key, item, ind) {
      var coordinates = widgetEditor.unite({x: 1, y: 1 + (nmrAttributes * 3)}, {x: 7, y: 1 + ((nmrAttributes+1) * 3)});
      var type = 'widget-3';
      var widgetProps = {
        id : self.model.get('childCollection').length + 1,
        top : coordinates.topLeft.y,
        left : coordinates.topLeft.x,
        type : type,
        width : coordinates.bottomRight.x - coordinates.topLeft.x + 1,
        height: coordinates.bottomRight.y - coordinates.topLeft.y + 1,
        text : '{{' + self.entity.attributes.name + '_' + key + '}}'
      };
      var widget = new Widget(widgetProps);
      self.model.get('childCollection').push(widget);
      nmrAttributes++;
    });
  },

  placeUpdateWidgets: function() {

  },

  select: function() {
    //this.model.select();
  },
});


var WidgetMenuView = Backbone.View.extend({
  el : document.getElementById('widget-list'),

  initialize: function(item){
    _.bindAll(this, 'render', 'addMenuItem', 'removeListItem', 'change');
    this.collection = widgetCollection;
    this.collection.bind('remove', this.removeListItem);
    this.collection.bind('add', this.addMenuItem);
    this.collection.bind('change');
  },

  render: function() {

  },
  addMenuItem: function(elem) {
    var item = document.createElement('li');
    item.innerHTML = elem.get('type');
    item.id = 'item-'+ this.collection.length;
    $(item).on('click', elem.select);
    $(this.el).append(item);
  },

  removeListItem: function(model) {
    elem = document.getElementById('item-' + model.get('id'));
    $(elem).remove();
  },

  change: function(item) {

  }
});


var WidgetInfoView = Backbone.View.extend({
  el : document.getElementById('item-info-list'),

  events : {
    'change input' : 'inputChanged'
  },

  initialize: function(){
    _.bindAll(this, 'render', 'show', 'showAttribute', 'inputChanged');
    this.render();
  },

  render: function() {

  },

  show: function(model) {
    this.el.innerHTML = '';
    var self = this;
    this.model = model;

    _(model.attributes).each(function(val, key){
      if(key == 'id' || key == 'type' || key == 'selected') return;
      self.el.appendChild(self.showAttribute(val, key, String('')));
    });
  },

  showAttribute: function(val, key, prop) {
    var self = this;

    if(val.__proto__.toString() === '[object Object]') {
      var li = document.createElement('li');
      li.innerHTML = key + ' : ';
      _(val).each(function(valinner,keyinner) {
        this.props = String(prop + '-' + keyinner);
        li.innerHTML += '<br>' + self.showAttribute(valinner,keyinner, this.props).innerHTML;
      });
    }
    else {
      var li = document.createElement('li');
      li.innerHTML = key + ' : '+ '<input type="text" id="' + prop + '"value=' + val + '>';
    }
    li.id = 'prop-'+ key;
    return li;
  },


  inputChanged: function(e) {
    var prop = e.target.parentNode.id.replace('prop-', '') + e.target.id;
    this.model.set(prop, e.target.value);
  }

});


var WidgetEntityView = Backbone.View.extend({
  el : null,
  tagName : 'li',
  className : 'entity-view-li',

  events: {
    'click .create' : 'clickedCreate',
    'click .show' : 'clickedShow',
    'click .update' : 'clickedUpdate'
  },

  initialize: function(item){
    var self = this;
    _.bindAll(this, 'render', 'clickedCreate',
                              'clickedUpdate',
                              'clickedShow');
    this.model = item;

    var coordinates = widgetEditor.unite({x: 6, y:2}, {x: 16, y: 10});
    var widget = {
      id : widgetCollection + 1,
      top : coordinates.topLeft.y,
      left : coordinates.topLeft.x,
      type : 'container',
      width : coordinates.bottomRight.x - coordinates.topLeft.x + 1,
      height: coordinates.bottomRight.y - coordinates.topLeft.y + 1,
      entity : this.model
    };
    this.widget = widget;
    this.render();
  },

  render: function() {
    this.el.innerHTML = this.model.get('name') + '<div class="buttons">'+
                                                    '<span class="create">Create</span>'+
                                                    '<span class="show">Show</span>'+
                                                    '<span class="update">Update</span>';
  },

  clickedCreate: function() {
    this.widget.action = 'create';
    var newModel = new Widget(this.widget);
    widgetCollection.add(newModel);
  },

  clickedUpdate: function() {
    this.widget.action = 'update';
    var newModel = new Widget(this.widget);
    widgetCollection.add(newModel);
  },

  clickedShow: function() {
    this.widget.action = 'show';
    var newModel = new Widget(this.widget);
    widgetCollection.add(newModel);
  }
});

var WidgetEntitiesListView = Backbone.View.extend({
  el : document.getElementById('entities-list'),
  events : {
  
  },

  initialize: function(){
    var self = this;
    _.bindAll(this, 'render');
    _(initialEntities).each(function(entity) {
      entity.id = self.counter;
      self.counter++;
    });
    this.collection = new EntityCollection(initialEntities);
    this.render();
  },

  render: function() {
    var self = this;
    _(this.collection.models).each(function(item) {
      var view = new WidgetEntityView(item);
      self.el.appendChild(view.el);
    });
  }
});


var WidgetEditorView = Backbone.View.extend({
  el : $('.page'),
  widgetsContainer : document.getElementById('widgets-container'),
  widgets : [],
  selectedElement: null,

  events : {
  },

  initialize: function(){
    _.bindAll(this, 'render',
                    'addWidget',
                    'unite',
                    'placeWidget',
                    'serializeWidgets',
                    'serializeCollection');

    this.collection = widgetCollection;
    this.collection.bind('add', this.placeWidget);
    //this.render();

    $('#save').on('click', this.serializeWidgets);

  },

  render: function() {

  },

  addWidget: function(id, cor1, cor2) {
    var coordinates = this.unite(cor1, cor2);
    var type = id;
    var widget = {
      id : this.collection.length + 1,
      top : coordinates.topLeft.y,
      left : coordinates.topLeft.x,
      type : type,
      width : coordinates.bottomRight.x - coordinates.topLeft.x + 1,
      height: coordinates.bottomRight.y - coordinates.topLeft.y + 1
    };

    this.collection.push(widget);
  },

  unite: function(cor1, cor2) {
    var topLeft = {};
    var bottomRight = {};

    if(cor1.x < cor2.x) {
      topLeft.x =  cor1.x;
      bottomRight.x = cor2.x;
    }
    else {
      topLeft.x =  cor2.x;
      bottomRight.x = cor1.x;
    }

    if(cor1.y < cor2.y) {
      topLeft.y =  cor1.y;
      bottomRight.y = cor2.y;
    }
    else {
      topLeft.y =  cor2.y;
      bottomRight.y = cor1.y;
    }

    return {
      topLeft : topLeft,
      bottomRight: bottomRight
    };
  },

  placeWidget: function(widget) {
    var curWidget;
    if(widget.attributes.entity) {
      curWidget= new EntityUIContainer(widget);
    }
    else {
      curWidget = new WidgetView(widget);
    }
     
    this.widgetsContainer.appendChild(curWidget.el);
  },

  serializeWidgets: function(e) {
    console.log(widgetCollection.models);
    uiElements = this.serializeCollection(widgetCollection.models);
    console.log(uiElements);

    $.ajax({
      type: "POST",
      url: '/app/1/page/homepage/',
      data: {
        content: uiElements
      },
      success: function() {

      },
      dataType: "JSON"
    });

    return false;
  },

  serializeCollection: function(coll) {
    console.log(coll);
    var uiElements = [];
    var self = this;
    _(coll).each(function(item, key) {
      if(item.attributes.type == 'container') {
        console.log(item);
        var elems = { };
        var key = String(item.get('type') + '-' + item.get('action'))
        elems[key] = self.serializeCollection(item.get('childCollection').models);
        uiElements.push(elems);
      }
      else {
        var elem = item.attributes;
        uiElements.push(elem);
      }
    });

    return uiElements;
  }
});


var widgetCollection = new WidgetCollection();
var menuView = new WidgetMenuView();
var widgetEditor = new WidgetEditorView();
var widgetInfoView = new WidgetInfoView();
var widgetEntitiesView = new WidgetEntitiesListView();
