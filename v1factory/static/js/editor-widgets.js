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

var WidgetView = Backbone.View.extend({
  el: null,
  className: 'pseudo-outline',
  tagName : 'span',
  widgetsContainer :null,
  selected : false,
  editable : false,

  events: {
    'mousedown' : 'select',
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
                    'switchOnEditMode',
                    'switchOffEditMode',
                    'outlineSelected',
                    'changedWidth',
                    'changedHeight',
                    'changedTop',
                    'changedLeft',
                    'changedText',
                    'changedType',
                    'changedSource',
                    'moved',
                    'removeView',
                    'resized');

    this.model = widgetModel;

    this.render();

    this.model.bind("change:selected", this.outlineSelected, this);
    this.model.bind("change:type", this.changedType, this);
    this.model.bind("remove", this.removeView, this);

    this.model.get('layout').bind("change:width", this.changedWidth, this);
    this.model.get('layout').bind("change:height", this.changedHeight, this);
    this.model.get('layout').bind("change:top", this.changedTop, this);
    this.model.get('layout').bind("change:left", this.changedLeft, this);

    this.model.get('content').bind("change:text", this.changedText, this);
    this.model.get('attribs').bind("change:src", this.changedSource, this);
  },

  render: function() {
    this.el.appendChild(this.renderContent());

    if(this.model.get('type') == 'box') {
      console.log("YOLOOOO");
      this.el.style.zIndex = 0;
    }

    this.model.select();

    var self = this;
    iui.resizableAndDraggable(self.widgetsContainer, self);

    return this;
  },

  renderContent: function() {
    this.el.innerHTML = '';

    iui.assert(this.model.get('lib_id'));

    var width = this.model.get('layout').get('width');
    var height = this.model.get('layout').get('height');

    var wrapperElem = document.createElement('div');
    wrapperElem.className ='widget-wrapper';

    wrapperElem.style.top = (GRID_HEIGHT * (this.model.get('layout').get('top'))) + "px";
    wrapperElem.style.left = (GRID_HEIGHT * (this.model.get('layout').get('left'))) + "px";
    wrapperElem.style.height = (height * GRID_HEIGHT) + "px";
    wrapperElem.className += " span" + width;
    wrapperElem.id = "widget-" + this.collection.length;

    wrapperElem.innerHTML = this.renderElement() + this.renderMeta(); //element + meta;

    this.widgetsContainer = wrapperElem;

    return wrapperElem;
  },

  renderElement: function() {

    var self = this;
    var temp = document.getElementById('temp-node').innerHTML;

    var node_context = _.clone(this.model.attributes);
    node_context.attribs = this.model.get('attribs').attributes;
    node_context.content = this.model.get('content').attributes;
    node_context.attribs.style += 'width:100%; height:100%;';

    var el = _.template(temp, { element: node_context});
    return el;
  },

  renderMeta: function() {
    // var tempMeta = document.getElementById('temp-meta').innerHTML;
    // var meta = _.template(tempMeta, {});
    return '';
  },

  remove: function() {
    //pagesView.widgetEditor.collection.remove(this);
    $(this.el).remove();
  },

  removeView: function() {
    $(this.el).remove();
  },

  select: function(e) {
    console.log(this);
    // if(!this.editable) {
    //   console.log('hey');
      this.model.select();
      e.preventDefault();
      return false;
    // }
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
    this.widgetsContainer.className = 'selected widget-wrapper ui-resizable ui-draggable';
    this.widgetsContainer.className += 'span' + this.model.get('layout').get('width');
  },

  changedHeight: function(a) {
    this.widgetsContainer.style.height = (this.model.get('layout').get('height') * GRID_HEIGHT) + 'px';
  },

  changedTop: function(a) {
    this.widgetsContainer.style.top = (GRID_HEIGHT * (this.model.get('layout').get('top'))) + 'px';
  },

  changedLeft: function(a) {
    this.widgetsContainer.style.left = (GRID_HEIGHT * (this.model.get('layout').get('left'))) + 'px';
  },

  changedText: function(a) {
    this.el.innerHTML = '';
    this.el.appendChild(this.renderContent());
    this.model.select();

    var self = this;
    $(this.widgetsContainer).resizable({
      handles: "n, e, s, w, se",
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
      handles: "n, e, s, w, se",
      grid: 30,
      resize: self.resized
    });
  },

  changedSource: function(a) {
    // TODO: can be more efficient
    this.el.innerHTML = '';
    this.el.appendChild(this.renderContent());
    this.model.select();

    var self = this;
    iui.resizableAndDraggable(this.widgetsContainer, self);

  },

  resized: function(e, ui) {
    console.log(this);
    var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
    var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);
    console.log(deltaHeight + ' ,' + deltaWidth);
    this.model.get('layout').set('width', deltaWidth);
    this.model.get('layout').set('height', deltaHeight);
  },

  moved: function(e, ui) {
    var top = Math.round((ui.position.top / GRID_HEIGHT));
    var left = Math.round((ui.position.left / GRID_HEIGHT));
    this.model.get('layout').set('top', top);
    this.model.get('layout').set('left', left);
  },

  switchOnEditMode: function(e) {
    $(this.widgetsContainer).draggable('destroy');
    this.editable = true;
    var elem = this.widgetsContainer.firstChild;
    elem.setAttribute('contenteditable', true);
    $(elem).focus();
    return false;
    //iui.setCursor(this.widgetsContainer.firstChild, 1);
  },

  switchOffEditMode: function() {

  }
});


var WidgetContainerView = WidgetView.extend({
  el: null,
  className: 'container-create',
  tagName : 'div',
  entity: null,
  type: null,
  events: {
    'click' : 'select',
    'click .delete'            : 'remove'
  },

  initialize: function(widgetModel) {
    _.bindAll(this, 'render',
                    'placeWidget',
                    'plageEntitySingleWidget',
                    'removeView',
                    'select');

    this.model = widgetModel;
    this.model.bind("change:selected", this.outlineSelected, this);

    this.model.get('layout').bind("change:width", this.changedWidth, this);
    this.model.get('layout').bind("change:height", this.changedHeight, this);
    this.model.get('layout').bind("change:top", this.changedTop, this);
    this.model.get('layout').bind("change:left", this.changedLeft, this);

    this.model.bind("remove", this.removeView, this);

    this.entity = widgetModel.get('container_info').entity;
    var collection = new WidgetCollection();
    this.model.set('childCollection', collection);
    collection.bind("add", this.placeWidget);

    this.render(widgetModel);

    if(widgetModel.get('container_info').uielements) {
      this.model.get('childCollection').add(widgetModel.get('container_info').uielements);
      return;
    }
  },

  render: function(widget) {
    var self = this;
    this.el.innerHTML = '';

    var element = document.createElement('div');
    var width = widget.get('layout').get('width');
    var height = widget.get('layout').get('height');

    element.style.top = (GRID_HEIGHT * (widget.get('layout').get('top') -1)) + 'px';
    element.style.left = (GRID_HEIGHT * (widget.get('layout').get('left') -1)) + 'px';
    element.className = 'widget-wrapper span'+width;
    element.style.height = (height * GRID_HEIGHT) + 'px';
    element.id = 'widget-' + this.collection.length;

    console.log(element);

    this.widgetsContainer = element;
    this.el.appendChild(element);

    iui.resizableAndDraggable(this.widgetsContainer, self);

    return this;
  },

  placeWidget: function(model, a) {
    var widgetView = new WidgetView(model);
    this.widgetsContainer.appendChild(widgetView.el);
  },

  plageEntitySingleWidget: function() {

    if (this.model.get('displayType') == "text") {
      var coordinates = iui.unite({x: 1,
                                   y: 1 },
                                  {x: this.model.get('layout').get('width') + 1,
                                   y: 3});
      var type = '2';
      var widgetProps = {
        lib_id : type,
        layout: {
          top : coordinates.topLeft.y,
          left : coordinates.topLeft.x,
          width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
          height: coordinates.bottomRight.y - coordinates.topLeft.y -1
        },
        content : {
          text : '{{' + this.entity.get('name') + ' ' + this.model.get('field') + '}}'
        }
      };
      var widget = new WidgetModel(widgetProps);
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
  selectedEl: null,

  events : {
  },

  initialize: function(widgetsCollection, contextEntities, page) {
    _.bindAll(this, 'render',
                    'placeWidget',
                    'style');

    this.render();
    this.collection = widgetsCollection;
    this.collection.bind('add', this.placeWidget);

    this.style(page['design_props']);
    if(page.uielements && page.uielements.length) this.collection.add(page.uielements);

  },

  render: function() {
    this.widgetsContainer.innerHTML = '';
  },

  placeWidget: function(widgetModel) {
    var curWidget;

    if (widgetModel.get('container_info')) {
      curWidget= new WidgetContainerView(widgetModel);
    }
    else {
      curWidget = new WidgetView(widgetModel);
    }

    this.widgetsContainer.appendChild(curWidget.el);
  },

  style: function (props) {

    _(props).each(function(prop) {

      if(document.getElementById('style-' + prop.type)) {
        $(document.getElementById('style-' + prop.type)).remove();
      }

      var styleTag = document.createElement('style');
      styleTag.id = 'style-' + prop.type;

      var styleContent = '' + (designOptions[prop.type].tag||'.sample') + ' {';
      styleContent += designOptions[prop.type].css.replace(/<%=content%>/g, prop.value);
      styleContent += '}';

      styleTag.innerHTML = styleContent;
      this.styleTag = styleTag;

      document.getElementsByTagName('head')[0].appendChild(styleTag);
    });
  }
});
