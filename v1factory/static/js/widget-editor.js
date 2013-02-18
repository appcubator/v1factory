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
    if(pagesView.widgetEditor) {
      pagesView.widgetEditor.collection.unselectAll();
      pagesView.widgetEditor.collection.selectedElement = this;
    }
    this.set('selected', true);
    widgetInfoView.show(this);
  },

  moveLeft: function() {
    this.set('left', this.get('left') - 1);
  },

  moveRight: function() {
    this.set('left', this.get('left') + 1);
  },

  moveUp: function() {
    this.set('top', this.get('top') - 1);
  },

  moveDown: function() {
    this.set('top', this.get('top') + 1);
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
    this.selectedElement = this.get(id);
  }
});

var WidgetView = Backbone.View.extend({
  el: null,
  className: 'pseudo-outline',
  tagName : 'span',
  widgetsContainer :null,
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
                    'changedLeft',
                    'resized');

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
    
    element.setAttribute("style","position:relative;");
    element.style.top = (GRID_HEIGHT * (widget.get('top'))) + 'px';
    element.style.left = (GRID_HEIGHT * (widget.get('left'))) + 'px';
    element.className = 'widget span'+width;
    element.style.height = (height * GRID_HEIGHT) + 'px';
    element.id = 'widget-' + this.collection.length;
    if(widget.get('type') != 'widget-5')
      element.innerHTML = widget.get('text') || "BLANK TEXT";

    meta = document.createElement('div');
    meta.className = 'meta';
    deleteBtn = document.createElement('img');
    deleteBtn.className = 'delete';
    deleteBtn.src = '/static/img/delete-icon.png';
    meta.appendChild(deleteBtn);

    element.appendChild(meta);
    this.widgetsContainer = element;
    this.el.appendChild(element);
    this.model.select();

    var self = this;
    $(this.widgetsContainer).resizable({
      grid: 30,
      resize: self.resized
    });
  },

  remove: function() {
    pagesView.widgetEditor.collection.remove(this);
    $(this.el).remove();
  },

  select: function() {
    this.model.select();
  },

  outlineSelected: function() {
    if(this.model.attributes.selected && this.selected === false) {
      $(this.widgetsContainer).addClass('selected');
      this.selected = true;
    }
    else {
      $(this.widgetsContainer).removeClass('selected');
      this.selected = false;
    }
  },

  changedWidth: function(a) {
    this.widgetsContainer.className = 'selected widget span' + this.model.attributes.width;
  },

  changedHeight: function(a) {
    this.widgetsContainer.style.height = (this.model.attributes.height * GRID_HEIGHT) + 'px';
  },

  changedTop: function(a) {
    this.widgetsContainer.style.top = (GRID_HEIGHT * (this.model.get('top'))) + 'px';
  },

  changedLeft: function(a) {
    this.widgetsContainer.style.left = (GRID_HEIGHT * (this.model.get('left'))) + 'px';
  },

  resized: function(e, ui) {
    var deltaHeight = (ui.size.height + 2) / GRID_HEIGHT;
    var deltaWidth = (ui.size.width + 2) / GRID_WIDTH;
    this.model.set('width', deltaWidth);
    this.model.set('height', deltaHeight);  
  }
});


var EntityUIContainer = WidgetView.extend({
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

    this.model.bind("change:selected", this.outlineSelected, this);
    this.model.bind("change:width", this.changedWidth, this);
    this.model.bind("change:height", this.changedHeight, this);
    this.model.bind("change:top", this.changedTop, this);
    this.model.bind("change:left", this.changedLeft, this);

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
  },

  placeWidget: function(model, a) {
    var widgetView = new WidgetView(model);
    this.widgetsContainer.appendChild(widgetView.el);
  },

  placeCreateWidgets: function() {
    var nmrAttributes = 0;
    var self = this;
    var widgets = [];
    _(self.entity.attributes.attributes).each(function(val, key, item, ind) {
      var coordinates = pagesView.unite({x: 1, y: 1 + (nmrAttributes * 3)}, {x: 7, y: 1 + ((nmrAttributes+1) * 3)});
      var type = 'widget-5';
      var widgetProps = {
        id : self.model.get('childCollection').length + 1,
        top : coordinates.topLeft.y,
        left : coordinates.topLeft.x,
        type : type,
        width : coordinates.bottomRight.x - coordinates.topLeft.x,
        height: coordinates.bottomRight.y - coordinates.topLeft.y,
        text : '{{' + self.entity.attributes.name + '_' + key + '}}'
      };
      var widget = new Widget(widgetProps);
      self.model.get('childCollection').push(widget);
      nmrAttributes++;
    });
  },

  placeShowWidgets: function() {
    var nmrAttributes = 0;
    var self = this;
    var widgets = [];
    _(self.entity.attributes.attributes).each(function(val, key, item, ind) {
      var coordinates = pagesView.unite({x: 1, y: 1 + (nmrAttributes * 3)}, {x: 7, y: 1 + ((nmrAttributes+1) * 3)});
      var type = 'widget-3';
      var widgetProps = {
        id : self.model.get('childCollection').length + 1,
        top : coordinates.topLeft.y,
        left : coordinates.topLeft.x,
        type : type,
        width : coordinates.bottomRight.x - coordinates.topLeft.x,
        height: coordinates.bottomRight.y - coordinates.topLeft.y,
        text : '{{' + self.entity.attributes.name + '_' + key + '}}'
      };
      var widget = new Widget(widgetProps);
      self.model.get('childCollection').push(widget);
      nmrAttributes++;
    });
  },

  placeUpdateWidgets: function() {

  }
});


var WidgetMenuView = Backbone.View.extend({
  el : document.getElementById('widget-list'),

  initialize: function(widgetCollection){
    _.bindAll(this, 'render', 'addMenuItem', 'removeListItem', 'change');
    this.render();
    this.collection = widgetCollection;
    this.collection.bind('remove', this.removeListItem);
    this.collection.bind('add', this.addMenuItem);
    this.collection.bind('change');
  },

  render: function() {
    this.el.innerHTML = '';
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
  model: null,
  events : {
    'change input' : 'inputChanged'
  },

  initialize: function(){
    _.bindAll(this, 'render', 
                    'show', 
                    'showAttribute', 
                    'inputChanged',
                    'changedProp');
    this.render();
  },

  render: function() {

  },

  show: function(model) {
    this.el.innerHTML = '';
    var self = this;
    this.model = model;
    this.model.bind("change", this.changedProp, this);

    _(model.attributes).each(function(val, key){
      if(key == 'id' || key == 'type' || key == 'selected') return;
      self.el.appendChild(self.showAttribute(val, key, String('')));
    });
  },

  showAttribute: function(val, key, prop) {
    var self = this;
    var li = document.createElement('li');
    li.innerHTML = key + ' : '+ '<input type="text" id="' + prop + '"value=' + val + '>';
    li.id = 'prop-'+ key;
    return li;
  },

  inputChanged: function(e) {
    var prop = e.target.parentNode.id.replace('prop-', '') + e.target.id;
    this.model.set(prop, e.target.value);
  },

  changedProp: function(a, b) {
    _(a.changed).each(function(val, key) {
      if(document.getElementById('prop-' + key)) {
        $('input', document.getElementById('prop-' + key)).val(val);
      }
    });
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

  initialize: function(item, widgetCollection){
    var self = this;
    _.bindAll(this, 'render', 'clickedCreate',
                              'clickedUpdate',
                              'clickedShow');
    this.model = item;

    var coordinates = pagesView.unite({x: 6, y:2}, {x: 16, y: 10});
    var widget = {
      id : widgetCollection + 1,
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

  initialize: function(widgetCollection){
    var self = this;
    _.bindAll(this, 'render');
    var initialEntities = appState.entities;
    _(initialEntities).each(function(entity) {
      entity.id = self.counter;
      self.counter++;
    });
    this.collection = new EntityCollection(initialEntities);
    this.widgetCollection = widgetCollection;
    this.render();
  },

  render: function() {
    var self = this;
    this.el.innerHTML = '';
    _(this.collection.models).each(function(item) {
      var view = new WidgetEntityView(item, this.widgetCollection);
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

  initialize: function(page) {
    _.bindAll(this, 'render',
                    'addWidget',
                    'placeWidget',
                    'serializeWidgets',
                    'serializeCollection',
                    'keydown');

    this.render();
    this.collection = new WidgetCollection();
    this.widgetMenu = new WidgetMenuView(this.collection);
    this.widgetEntitiesView = new WidgetEntitiesListView(this.collection);
    this.collection.bind('add', this.placeWidget);

    this.collection.add(page.uielements);

    //this.render();
    window.addEventListener('keydown', this.keydown);
  },

  render: function() {
    this.widgetsContainer.innerHTML = '';
  },

  addWidget: function(id, cor1, cor2) {
    var coordinates = pagesView.unite(cor1, cor2);
    var type = id;
    var widget = {
      id : this.collection.length + 1,
      top : coordinates.topLeft.y,
      left : coordinates.topLeft.x,
      type : type,
      width : coordinates.bottomRight.x - coordinates.topLeft.x,
      height: coordinates.bottomRight.y - coordinates.topLeft.y
    };

    this.collection.push(widget);
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
    uiElements = this.serializeCollection(this.collection.models);    
    return uiElements;
  },

  serializeCollection: function(coll) {
    var uiElements = [];
    var self = this;
    _(coll).each(function(item, key) {
      if(item.attributes.type == 'container') {
        var elems = { };
        var key = String(item.get('type') + '-' + item.get('action'));
        elems[key] = {};
        elems[key]['entity'] = item.get('entity').get('name');
        elems[key]['elements'] = self.serializeCollection(item.get('childCollection').models);
        uiElements.push(elems);
      }
      else {
        var elem = item.attributes;
        delete elem.selected;
        uiElements.push(elem);
      }
    });

    return uiElements;
  },

  keydown: function(e) {
    switch(e.keyCode) {
      case 37:
        this.collection.selectedElement.moveLeft();
        e.preventDefault();
        break;
      case 38:
        this.collection.selectedElement.moveUp();
        e.preventDefault();
        break;
      case 39:
        this.collection.selectedElement.moveRight();
        e.preventDefault();
        break;
      case 40:
        this.collection.selectedElement.moveDown();
        e.preventDefault();
        break;
    }
  }
});

var PagesView = Backbone.View.extend({
  el: document.body,
  listEl: document.getElementById('pages-list'),
  events: {
    'click .new-page' : 'clickedNewPage',
    'submit .new-page-form' : 'submittedNewPage',
    'click .exist-page' : 'clickedOpen',
    'click #save' : 'savePages'
  },

  initialize: function() {
    _.bindAll(this, 'render', 'clickedNewPage', 'submittedNewPage', 'savePages', 'savePage', 'unite', 'clickedOpen');
    this.pages = appState.pages || [];
    this.render();
  },

  render: function() {
    var self = this;
    _(this.pages).each(function(page, ind) {
      self.listEl.innerHTML +=  '<li class="exist-page" id="page-'+ ind + '">' + page.name + '</li>';
    });
    self.listEl.innerHTML += '<li class="new-page"> + Create Page</li>' +
    '<form class="new-page-form" hi2 style="display:none;"><input class="new-page-name" type="text"></form>';
  },

  clickedNewPage: function() {
    $('.new-page').hide();
    $('.new-page-form').fadeIn();
    $('.new-page-name').focus();
  },

  submittedNewPage: function(e) {
    e.preventDefault();
    var pageName = $('.new-page-name').val();
    var page = {'name': pageName, 'uielements' : []};

    this.pages.push(page);
    this.curPage = this.pages.length - 1;
    this.openPage(this.curPage);

    $('<li class="page" id="'+ pageName + '">' + pageName + '</li>').insertBefore('.new-page');
    $('.new-page-form').hide();
    $('.new-page-name').val('');
    $('.new-page').fadeIn();
  },

  openPage: function(pageInd) {
    if(this.widgetEditor) {
      this.savePage();
    }
    this.curPage = pageInd;
    this.widgetEditor = new WidgetEditorView(this.pages[pageInd]);
    document.getElementById('page-' + pageInd).className += ' selected';
  },

  savePage: function() {
    this.pages[this.curPage]['uielements'] = (this.widgetEditor.serializeWidgets() || []);
  },

  savePages: function() {
    this.savePage();
    appState.pages = this.pages;
    $.ajax({
      type: "POST",
      url: '/app/1/state/',
      data: JSON.stringify(appState),
      success: function() {

      },
      dataType: "JSON"
    });
  },

  unite: function(cor1, cor2) {
    var topLeft = {}, bottomRight = {};

    if(cor1.x < cor2.x) {
      topLeft.x =  cor1.x;
      bottomRight.x = cor2.x;
    } else {
      topLeft.x =  cor2.x;
      bottomRight.x = cor1.x;
    }

    if(cor1.y < cor2.y) {
      topLeft.y =  cor1.y;
      bottomRight.y = cor2.y;
    } else {
      topLeft.y =  cor2.y;
      bottomRight.y = cor1.y;
    }

    topLeft.x--; topLeft.y--;

    return {
      topLeft : topLeft,
      bottomRight: bottomRight
    };
  },

  clickedOpen: function(e) {
    var ind = String(e.target.id).replace('page-','');
    $('.selected.exist-page').removeClass('selected');
    this.openPage(ind);
    e.preventDefault();
  }
});

var widgetInfoView = new WidgetInfoView();
var pagesView = new PagesView();
pagesView.openPage(0);
