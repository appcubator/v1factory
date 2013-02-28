/*
 *  Widget Editor
 *  Written by icanberk
 *
 *  Abstract:
 *  This module controls and stores all the widgets
 *  on the editor page.
 *
 *  WidgetContainerView is a model of the WidgetEditorView
 *  collection. However, sub-elements of the WidgetContainerView
 *  is only stored in childCollection attribute.
 *
 *  Includes:
 *  - Widget
 *  - WidgetCollection
 *  - WidgetView
 *  - WidgetImgView
 *  - WidgetLinkView
 *  - WidgetContainerView
 *  - WidgetEditorView
 */

var GRID_WIDTH = 30;
var GRID_HEIGHT = 30;


var Widget = Backbone.Model.extend({
  selected: false,

  defaults: {
    'container-info' : null,
    'context'        : null,
    'lib-id'         : 1,
    'top'            : 0,
    'left'           : 0,
    'height'         : 2,
    'width'          : 2
  },

  initialize: function() {
    _.bindAll(this, 'select', 'assignCoord');
  },

  select: function() {
    if(this.collection){ this.collection.unselectAll()};
    this.collection.selectedElement = this;
    if(pagesView.widgetEditor) {
      pagesView.widgetEditor.selectedElement = this;
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
  },


  assignCoord: function() {
    var coordinates = currentCoord? pagesView.unite(currentCoord.initCor, currentCoord.lastCor):
                                    pagesView.unite({x: 0, y:2}, {x: 16, y: 10});

    this.set('top', coordinates.topLeft.y + 1);
    this.set('left', coordinates.topLeft.x + 1);
    this.set('width', coordinates.bottomRight.x - coordinates.topLeft.x);
    this.set('height', coordinates.bottomRight.y - coordinates.topLeft.y);
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
    'click .widget-wrapper' : 'select',
    'click .delete' : 'remove'
  },

  initialize: function(widgetModel){
    var self = this;
    _.bindAll(this, 'render',
                    'renderContent',
                    'renderElement',
                    'renderMeta',
                    'remove',
                    'select',
                    'outlineSelected',
                    'changedWidth',
                    'changedHeight',
                    'changedTop',
                    'changedLeft',
                    'changedText',
                    'changedType',
                    'removeView',
                    'resized');

    this.model = widgetModel;
    this.model.bind("change:selected", this.outlineSelected, this);
    this.model.bind("change:width", this.changedWidth, this);
    this.model.bind("change:height", this.changedHeight, this);
    this.model.bind("change:top", this.changedTop, this);
    this.model.bind("change:left", this.changedLeft, this);
    this.model.bind("change:text", this.changedText, this);
    this.model.bind("change:type", this.changedType, this);
    this.model.bind("remove", this.removeView, this);

    this.render();
  },

  render: function() {
    this.el.appendChild(this.renderContent());
    this.model.select();

    var self = this;
    $(this.widgetsContainer).resizable({
      grid: 30,
      resize: self.resized
    });
  },

  renderContent: function() {
    this.el.innerHTML = '';

    if(typeof this.model.get('lib-id') == "undefined") {
      alert('wat');
      return;
    }

    var temp = document.getElementById('temp-widget-' + this.model.get('lib-id')).innerHTML;

    if(!temp) {
      alert('elem type could not be found');
      return;
    }

    var width = this.model.get('width');
    var height = this.model.get('height');
    
    var wrapperElem = document.createElement('div');
    wrapperElem.className ='widget-wrapper';

    wrapperElem.style.top = (GRID_HEIGHT * (this.model.get('top'))) + "px";
    wrapperElem.style.left = (GRID_HEIGHT * (this.model.get('left'))) + "px";
    wrapperElem.style.height = (height * GRID_HEIGHT) + "px";
    wrapperElem.className += " span" + width;
    wrapperElem.id = "widget-" + this.collection.length;

    wrapperElem.innerHTML = this.renderElement() + this.renderMeta(); //element + meta;

    this.widgetsContainer = wrapperElem;

    return wrapperElem;
  },

  renderElement: function() {
    var temp = document.getElementById('temp-widget-' + this.model.get('lib-id')).innerHTML;
    var page_context = {};
    page_context.text = this.model.get('text') || "BLANK TEXT";
    page_context.field_name = this.model.get('field_name');
    var element = _.template(temp, page_context);
    return element;
  },

  renderMeta: function() {
    var tempMeta = document.getElementById('temp-meta').innerHTML;
    var meta = _.template(tempMeta, {});
    return meta;
  },

  remove: function() {
    pagesView.widgetEditor.collection.remove(this);
    $(this.el).remove();
  },

  removeView: function() {
    $(this.el).remove();
  },

  select: function(e) {
    this.model.select();
    e.preventDefault();
    return false;
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
    this.widgetsContainer.className = 'selected widget-wrapper span' + this.model.get('width');
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

  changedText: function(a) {
    this.el.innerHTML = '';
    this.el.appendChild(this.renderContent());
    this.model.select();

    var self = this;
    $(this.widgetsContainer).resizable({
      grid: 30,
      resize: self.resized
    });
  },

  changedType: function(a) {
    this.el.innerHTML = '';
    this.el.appendChild(this.renderContent());
    this.model.select();

    var self = this;
    $(this.widgetsContainer).resizable({
      grid: 30,
      resize: self.resized
    });
  },

  resized: function(e, ui) {
    var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
    var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);
    this.model.set('width', deltaWidth);
    this.model.set('height', deltaHeight);
  }
});

var WidgetImgView = WidgetView.extend({
  initialize: function(widgetModel){

    if(!widgetModel.get('source')) {
      widgetModel.set('source', '/static/img/placholder.png');
    }

    this.constructor.__super__.initialize.apply(this, [widgetModel]);
    _.bindAll(this, 'changedSource');
    this.model.bind("change:source", this.changedSource, this);
  },

  changedSource: function(a) {
    // TODO: can be more efficient
    this.el.innerHTML = '';
    this.el.appendChild(this.renderContent());
    this.model.select();

    var self = this;
    $(this.widgetsContainer).resizable({
      grid: 30,
      resize: self.resized
    });
  },

  renderElement: function() {
    var temp = document.getElementById('temp-widget-' + this.model.get('lib-id')).innerHTML;
    elem_text = this.model.get('text') || "BLANK TEXT";
    var element = _.template(temp, { 'text' : elem_text, 'source' : this.model.get('source') });
    return element;
  }
});

var WidgetLinkView = WidgetView.extend({
  initialize: function(item){
    this.constructor.__super__.initialize.apply(this, [item]);
    this.model.set('href', '{{homepage}}');
  }
});

var WidgetContainerView = WidgetView.extend({
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
                    'placeQueryWidgets',
                    'placeUpdateWidgets',
                    'plageEntitySingleWidget',
                    'removeView',
                    'select');

    this.model = item;
    this.model.bind("change:selected", this.outlineSelected, this);
    this.model.bind("change:width", this.changedWidth, this);
    this.model.bind("change:height", this.changedHeight, this);
    this.model.bind("change:top", this.changedTop, this);
    this.model.bind("change:left", this.changedLeft, this);
    this.model.bind("remove", this.removeView, this);

    this.entity = item.get('entity');
    var collection = new WidgetCollection();
    this.model.set('childCollection', collection);
    collection.bind("add", this.placeWidget);

    this.render(item);

    if(item.get('elements')) {
      this.model.get('childCollection').add(item.get('elements'));
      return;
    }

    item.get('action');

    switch (item.get('action')) {
    case "create":
      this.placeCreateWidgets();
      break;
    case "query":
      this.placeQueryWidgets();
      break;
    case "update":
      this.placeUpdateWidgets();
      break;
    case "display":
      this.plageEntitySingleWidget();
      break;
    }
  },

  render: function(widget) {
    this.el.innerHTML = '';

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
    var widgetView;
    console.log(model.get('lib-id'));

    switch (model.get('lib-id'))
    {
      case "3":
        widgetView = new WidgetImgView(model);
        break;
      default:
        widgetView = new WidgetView(model);
    }
     
    this.widgetsContainer.appendChild(widgetView.el);
  },

  placeCreateWidgets: function() {

    var nmrAttributes = 0;
    var self = this;
    var widgets = [];
    _(self.entity.get('fields')).each(function(val, key, item, ind) {
      var coordinates = pagesView.unite({x: 1, y: 1 + (nmrAttributes * 2)}, {x: self.model.get('width') + 1, y: 1 + ((nmrAttributes+1) * 2)});
      var type = '8';
      var widgetProps = {
        id : self.model.get('childCollection').length + 1,
        top : coordinates.topLeft.y,
        left : coordinates.topLeft.x,
        'lib-id' : type,
        width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
        height: 2,
        field_name : val.name,
        text : val.name
      };
      var widget = new Widget(widgetProps);
      self.model.get('childCollection').push(widget);
      nmrAttributes++;
    });
  },

  placeQueryWidgets: function() {
    var nmrAttributes = 0;
    var self = this;
    var widgets = [];

    _(self.entity.get('fields')).each(function(val, key, item, ind) {
      var coordinates = pagesView.unite({x: 1, y: 1 + (nmrAttributes * 2)}, {x: self.model.get('width') + 1, y: 1 + ((nmrAttributes+1) * 2)});
      var type = '2';
      var widgetProps = {
        id : self.model.get('childCollection').length + 1,
        top : coordinates.topLeft.y,
        left : coordinates.topLeft.x,
        'lib-id' : type,
        width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
        height: coordinates.bottomRight.y - coordinates.topLeft.y -1,
        text : '{{' + self.entity.attributes.name + '_' + key + '}}'
      };
      var widget = new Widget(widgetProps);
      self.model.get('childCollection').push(widget);
      nmrAttributes++;
    });
  },

  placeUpdateWidgets: function() {
    var nmrAttributes = 0;
    var self = this;
    var widgets = [];

    _(self.entity.get('fields')).each(function(val, key, item, ind) {
      var coordinates = pagesView.unite({x: 1, y: 1 + (nmrAttributes * 2)}, {x: self.model.get('width') + 1, y: 1 + ((nmrAttributes+1) * 2)});
      var type = '8';
      var widgetProps = {
        id : self.model.get('childCollection').length + 1,
        top : coordinates.topLeft.y,
        left : coordinates.topLeft.x,
        'lib-id' : type,
        width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
        height: coordinates.bottomRight.y - coordinates.topLeft.y -1,
        text : key
      };
      var widget = new Widget(widgetProps);
      self.model.get('childCollection').push(widget);
      nmrAttributes++;
    });
  },

  plageEntitySingleWidget: function() {
    console.log(this);
    if (this.model.get('displayType') == "text") {
      var coordinates = pagesView.unite({x: 1, y: 1 }, {x: this.model.get('width') + 1, y: 3});
      var type = '2';
      var widgetProps = {
        top : coordinates.topLeft.y,
        left : coordinates.topLeft.x,
        'lib-id' : type,
        width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
        height: coordinates.bottomRight.y - coordinates.topLeft.y -1,
        text : '{{' + this.entity.get('name') + ' ' + this.model.get('field') + '}}'
      };
      var widget = new Widget(widgetProps);
      this.model.get('childCollection').push(widget);
    }
  },

  remove: function(e) {
    e.preventDefault();
    pagesView.widgetEditor.collection.remove(this.model);
    $(this.el).remove();
  },

  removeView: function() {
    $(this.el).remove();
  }
});

var WidgetEditorView = Backbone.View.extend({
  el : $('.page'),
  widgetsContainer : document.getElementById('widgets-container'),
  widgets : [],
  selectedElement: null,

  events : {
  },

  initialize: function(contextEntities, page) {
    _.bindAll(this, 'render',
                    'addWidget',
                    'placeWidget',
                    'serializeWidgets',
                    'serializeCollection',
                    'style',
                    'keydown');

    this.render();
    this.collection = new WidgetCollection();
    this.widgetMenu = new WidgetMenuView(this.collection);
    this.widgetEntitiesView = new EntitiesListView(contextEntities, this.collection);
    this.collection.bind('add', this.placeWidget);

    this.style(page['design-props']);
    if(page.uielements && page.uielements.length) this.collection.add(page.uielements);
    
    window.addEventListener('keydown', this.keydown);
  },

  render: function() {
    this.widgetsContainer.innerHTML = '';
  },

  addWidget: function(id, cor1, cor2) {
    var coordinates = pagesView.unite(cor1, cor2);
    var libId = id.replace('widget-','');
    var widget = {
      id : this.collection.length + 1,
      top : coordinates.topLeft.y,
      left : coordinates.topLeft.x,
      'lib-id' : libId,
      width : coordinates.bottomRight.x - coordinates.topLeft.x,
      height: coordinates.bottomRight.y - coordinates.topLeft.y,
      text: "New Text"
    };

    this.collection.push(widget);
  },

  placeWidget: function(widget) {
    var curWidget;
    if(typeof widget.get('entity') == "string") {
      var entityObj = this.widgetEntitiesView.collection.where({ name :widget.get('entity')})[0];
      if(!entityObj) {
        alert('Entity could not be found!');
      }
      else {
        widget.set('entity', entityObj);
        curWidget= new WidgetContainerView(widget);
      }
    }
    else if (widget.get('entity')) {
      curWidget= new WidgetContainerView(widget);
    }
    else {
      switch (widget.get('lib-id'))
      {
        case "1":
          curWidget = new WidgetLinkView(widget);
          break;
        case "3":
          curWidget = new WidgetImgView(widget);
          break;
        default:
          curWidget = new WidgetView(widget);
      }
    }
    

    this.widgetsContainer.appendChild(curWidget.el);
  },

  serializeWidgets: function(e) {
    uiElements = this.serializeCollection(this.collection.models);
    return uiElements;
  },

  style: function (props) {

    _(props).each(function(prop) {

      if(document.getElementById('style-' + prop.type)) {
        $(document.getElementById('style-' + prop.type)).remove();
      }

      var styleTag = document.createElement('style');
      styleTag.id = 'style-' + prop.type;

      var styleContent = '' + (designOptions[prop.type].tag||'body') + ' {';
      styleContent += designOptions[prop.type].css.replace(/<%=content%>/g, prop.value);
      styleContent += '}';

      styleTag.innerHTML = styleContent;
      this.styleTag = styleTag;

      document.getElementsByTagName('head')[0].appendChild(styleTag);
    });
  },

  serializeCollection: function(coll) {
    var uiElements = [];
    var self = this;
    _(coll).each(function(item, key) {
      var elem = { };
      if(item.get('type') == 'container') {
        elem.type = 'container';
        elem.action = item.get('action');
        elem.entity = item.get('entity').get('name');
        elem.width = item.get('width');
        elem.height = item.get('height');
        elem.top = item.get('top');
        elem.left = item.get('left');

        elem.elements = self.serializeCollection(item.get('childCollection').models);
        uiElements.push(elem);
      }
      else {
        elem = item.attributes;
        delete elem.selected;
        uiElements.push(elem);
      }
    });

    return uiElements;
  },

  keydown: function(e) {
    switch(e.keyCode) {
      case 37:
        this.selectedElement.moveLeft();
        break;
      case 38:
        this.selectedElement.moveUp();
        e.preventDefault();
        break;
      case 39:
        this.selectedElement.moveRight();
        e.preventDefault();
        break;
      case 40:
        this.selectedElement.moveDown();
        e.preventDefault();
        break;
      case 8: //backspace
        e.preventDefault();
        this.selectedElement.collection.remove(this.selectedElement);
        break;
      case 27: //escape
        gridEditor.clearSelections();
        if(this.selectedElement) this.selectedElement.collection.unselectAll();
        return false;
    }
  }
});
