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

var WidgetView = Backbone.UIView.extend({
  el: null,
  className: 'pseudo-outline widget-wrapper',
  tagName : 'div',
  widgetsContainer :null,
  selected : false,
  editable : false,

  events: {
    'mousedown' : 'select',
    'click .delete' : 'remove',
    'dblclick' : 'switchOnEditMode'
  },

  initialize: function(widgetModel){
    var self = this;
    _.bindAll(this, 'render',
                    'renderElement',
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
                    'resized');

    this.model = widgetModel;

    this.render();

    this.model.bind("change:selected", this.outlineSelected, this);
    this.model.bind("change:type", this.changedType, this);
    this.model.bind("remove", this.remove, this);

    this.model.get('layout').bind("change:width", this.changedWidth, this);
    this.model.get('layout').bind("change:height", this.changedHeight, this);
    this.model.get('layout').bind("change:top", this.changedTop, this);
    this.model.get('layout').bind("change:left", this.changedLeft, this);

    this.model.get('content').bind("change:text", this.changedText, this);
    this.model.get('attribs').bind("change:src", this.changedSource, this);
  },

  render: function() {

    this.model.select();
    this.clear();

    iui.assert(this.model.get('lib_id'));

    var width = this.model.get('layout').get('width');
    var height = this.model.get('layout').get('height');

    if(this.model.get('type') == 'box') {this.el.style.zIndex = 0;}
    this.setTop(GRID_HEIGHT * (this.model.get('layout').get('top')));
    this.setLeft(GRID_HEIGHT * (this.model.get('layout').get('left')));
    this.setHeight(height * GRID_HEIGHT);

    this.el.className += " span" + width;
    this.el.innerHTML = this.renderElement();

    this.resizableAndDraggable();

    return this;
  },

  renderElement: function() {
    var temp = document.getElementById('temp-node').innerHTML;

    var node_context = _.clone(this.model.attributes);
    node_context.attribs = this.model.get('attribs').attributes;
    node_context.content = this.model.get('content').attributes;

    var el = _.template(temp, { element: node_context});
    return el;
  },

  select: function(e) {
    this.model.select();
  },

  outlineSelected: function() {
    if(this.model.attributes.selected && this.selected === false) {
      $(this.el).addClass('selected');
      this.selected = true;
    }
    else {
      $(this.el).removeClass('selected');
      this.selected = false;
    }
  },

  changedWidth: function(a) {
    this.el.className = 'selected widget-wrapper ui-resizable ui-draggable';

    if(this.model.get('layout').get('width') == '100%') {
      $('#full-container').append(this.el);
      this.setLeft(0);
      this.setWidth('100%');
    }
    else {
      this.setWidth('');
      this.el.className += 'span' + this.model.get('layout').get('width');
    }
  },

  changedHeight: function(a) {
    this.setHeight(this.model.get('layout').get('height') * GRID_HEIGHT);
  },

  changedTop: function(a) {
    this.setTop(GRID_HEIGHT * (this.model.get('layout').get('top')));
  },

  changedLeft: function(a) {
    this.setLeft(GRID_HEIGHT * (this.model.get('layout').get('left')));
  },

  changedText: function(a) {
    this.clear();
    this.el.innerHTML = this.renderElement();
    this.model.select();
    this.resizable();
  },

  changedType: function(a) {
    this.clear();
    this.el.innerHTML = this.renderElement();
    this.model.select();
    this.resizableAndDraggable();
  },

  changedSource: function(a) {
    // TODO: can be more efficient
    this.clear();
    this.el.innerHTML = this.renderElement();
    this.model.select();
    this.resizableAndDraggable();
  },

  resized: function(e, ui) {
    var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
    var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);
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

    elem = this.el.firstChild.cloneNode(true);
    elem.setAttribute('contenteditable', true);
    elem.style.position = 'fixed';
    elem.style.top = '300px';
    elem.style.left = '200px';

    console.log(elem);

    document.body.appendChild(elem);
    elem.focus();

    var range = document.createRange();
    range.selectNodeContents(elem);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    console.log('tryn');
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
    'click '        : 'select',
    'click .delete' : 'remove'
  },

  initialize: function(widgetModel) {

    WidgetContainerView.__super__.initialize.call(this, widgetModel);
    _.bindAll(this, 'placeWidget');

    var collection = new WidgetCollection();
    this.model.set('childCollection', collection);
    collection.bind("add", this.placeWidget);

    var uielements = widgetModel.get('container_info').uielements;
    this.model.get('childCollection').add(uielements);

    console.log(this.model.collection);
  },

  render: function() {
    var self = this;
    this.el.innerHTML = '';

    var width = this.model.get('layout').get('width');
    var height = this.model.get('layout').get('height');

    this.setTop(GRID_HEIGHT * this.model.get('layout').get('top'));
    this.setLeft(GRID_HEIGHT * this.model.get('layout').get('left'));
    this.setHeight(height * GRID_HEIGHT);

    this.el.className += ' widget-wrapper span'+width;

    this.resizableAndDraggable();

    return this;
  },

  placeWidget: function(model, a) {
    var widgetView = new WidgetView(model);
    this.el.appendChild(widgetView.el);
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
    //this.style(page['design_props']);

    this.collection.add(page.uielements);

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
