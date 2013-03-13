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
  editMode : false,
  shadowElem : null,

  events: {
    'mousedown' : 'select',
    'click .delete' : 'remove',
    'dblclick' : 'switchOnEditMode',
    'keyDown'  : 'keyHandler'
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
                    'toggleFull',
                    'moving',
                    'moved',
                    'resizing',
                    'resized',
                    'keyHandler');

    console.log(widgetModel);

    this.model = widgetModel;

    this.render();

    this.model.bind("change:selected", this.outlineSelected, this);
    this.model.bind("change:type", this.changedType, this);
    this.model.bind("change:class_name", this.changedType, this);
    this.model.bind("remove", this.remove, this);

    this.model.get('layout').bind("change:width", this.changedWidth, this);
    this.model.get('layout').bind("change:height", this.changedHeight, this);
    this.model.get('layout').bind("change:top", this.changedTop, this);
    this.model.get('layout').bind("change:left", this.changedLeft, this);
    this.model.get('layout').bind("change:isFull", this.toggleFull, this);

    this.model.bind("change:content", this.changedText, this);
    this.model.get('content_attribs').bind("change:src", this.changedSource, this);

    window.addEventListener('keydown', this.keyHandler);
  },

  render: function() {
    this.clear();
    //this.model.select();

    //iui.assert(this.model.get('lib_id'));

    var width = this.model.get('layout').get('width');
    var height = this.model.get('layout').get('height');

    if(this.model.get('type') == 'box') {this.el.style.zIndex = 0;}
    this.setTop(GRID_HEIGHT * (this.model.get('layout').get('top')));
    this.setLeft(GRID_HEIGHT * (this.model.get('layout').get('left')));
    this.setHeight(height * GRID_HEIGHT);
    this.el.className += " span" + width;
    this.el.innerHTML = this.renderElement();

    if(this.model.isFullWidth()) this.switchOnFullWidth();

    this.resizableAndDraggable();

    return this;
  },

  renderElement: function() {
    var temp = document.getElementById('temp-node').innerHTML;
    var node_context = _.clone(this.model.attributes);
    node_context.content_attribs = this.model.get('content_attribs').attributes;
    var el = _.template(temp, { element: node_context});
    console.log(el);
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
    this.el.className = 'selected widget-wrapper ';
    this.el.className += 'span' + this.model.get('layout').get('width');
    this.setLeft(GRID_HEIGHT * (this.model.get('layout').get('left')));

  },

  toggleFull: function (argument) {
    if(this.model.get('layout').get('isFull') === true) {
      this.switchOnFullWidth();
    }
    else {
      this.switchOffFullWidth();
    }
  },

  switchOnFullWidth: function() {
    $('#full-container').append(this.el);
    this.disableResizeAndDraggable();
    this.el.className = 'selected widget-wrapper spanFull';
    this.setLeft(0);
    this.fullWidth = true;
  },

  switchOffFullWidth: function() {
    this.fullWidth = false;
    $('#elements-container').append(this.el);
    this.render();
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
    this.el.firstChild.innerHTML = this.model.get('content');
  },

  changedType: function(a) {
    var newBone = _.findWhere(uieState[this.model.get('type')], {class_name : this.model.get('class_name')});
    this.model.set('style', newBone.style);
    this.render();
  },

  changedSource: function(a) {
    this.el.firstChild.src = this.model.get('content_attribs').get('src');
  },

  resizing: function(e, ui) {
    var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
    var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);
    this.model.get('layout').set('width', deltaWidth);
    this.model.get('layout').set('height', deltaHeight);
  },

  resized: function (argument) {
    // this.clear();
    // this.el.innerHTML = this.renderElement();
    // this.model.select();
    // this.resizableAndDraggable();
  },

  moving: function(e, ui) {
    var top = Math.round((ui.position.top / GRID_HEIGHT));
    var left = Math.round((ui.position.left / GRID_HEIGHT));
    this.model.get('layout').set('top', top);
    this.model.get('layout').set('left', left);
  },

  moved: function () {
    // console.log(this);
    // this.render();
    // this.model.select();
    // this.resizableAndDraggable();
  },

  switchOnEditMode: function(e) {
    console.log(this);
    this.editMode = true;

    var editedElem = this.el;
    var top = $(editedElem).offset().top;
    var left = $(editedElem).offset().left;
    this.editedElem = editedElem;

    console.log(editedElem);

    elem = editedElem.cloneNode(true);
    elem.setAttribute('contenteditable', true);
    elem.style.position = 'absolute';
    elem.style.top = top;
    elem.style.left = left;
    this.shadowElem = elem;

    $(editedElem).hide();

    document.body.appendChild(elem);
    elem.focus();

    var range = document.createRange();
    range.selectNodeContents(elem);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  },

  switchOffEditMode: function() {
    console.log(this);
    this.model.set('content', this.shadowElem.innerText);
    console.log(this.shadowElem.innerText);
    $(this.shadowElem).remove();
    $(this.editedElem).fadeIn();
  },

  keyHandler: function (e) {
    if(this.editMode === false) return;

    switch(e.keyCode) {
      case 13: //enter
        this.switchOffEditMode();
        return false;
        break;
    }

    return false;
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
    //this.model.set('uielements', collection);
    this.model.get('container_info').get('uielements').bind("add", this.placeWidget);

    console.log(this.model.get('container_info'));
    //this.model.get('container_info').get('uielements').add(widgetModel.)
    //var uielements = widgetModel.get('container_info').uielements;
    //this.model.get('uielements').add(uielements);

    console.log(this.model.collection);
    this.render();
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

    _(this.model.get('container_info').get('uielements').models).each(function(widgetModel) {
      self.placeWidget(widgetModel);
    });

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
  widgetsContainer : document.getElementById('elements-container'),
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

    if(!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
    else iui.get('full-container').appendChild(curWidget.el);
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
