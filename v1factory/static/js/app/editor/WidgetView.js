define([
  'backbone',
  'mixins/BackboneUI'
],function() {

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
      'click'         : 'select',
      'click .delete' : 'remove',
      'keyDown'       : 'keyHandler'
    },

    initialize: function(widgetModel){
      var self = this;
      _.bindAll(this, 'render',
                      'renderElement',
                      'select',
                      'outlineSelected',
                      'changedWidth',
                      'changedHeight',
                      'changedValue',
                      'changedTop',
                      'changedLeft',
                      'changedText',
                      'changedType',
                      'changedStyle',
                      'changedSource',
                      'toggleFull',
                      'moving',
                      'moved',
                      'resizing',
                      'resized',
                      'staticsAdded',
                      'keyHandler');

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
      this.model.get('layout').bind("change:alignment", this.changedAlignment, this);
      this.model.get('layout').bind("change", this.changedPadding, this);

      this.model.bind("change:content", this.changedText, this);
      this.model.get('content_attribs').bind("change:src", this.changedSource, this);
      this.model.get('content_attribs').bind("change:value", this.changedValue, this);
      this.model.get('content_attribs').bind("change:style", this.changedStyle, this);

      window.addEventListener('keydown', this.keyHandler);
    },

    render: function() {

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      // if(this.model.get('type') == 'box') {this.el.style.zIndex = 0;}
      this.setTop(GRID_HEIGHT * (this.model.get('layout').get('top')));
      this.setLeft(GRID_WIDTH * (this.model.get('layout').get('left')));
      this.setHeight(height * GRID_HEIGHT);
      this.el.className += " span" + width;
      this.el.style.textAlign = this.model.get('layout').get('alignment');

      if(this.model.get('layout').has('l-padding')) {
        this.el.style.paddingLeft = this.model.get('layout').get('l-padding');
      }

      if(this.model.get('layout').has('r-padding')) {
        this.el.style.paddingRight = this.model.get('layout').get('r-padding');
      }

      if(this.model.get('layout').has('t-padding')) {
        this.el.style.paddingTop = this.model.get('layout').get('t-padding');
      }

      if(this.model.get('layout').has('b-padding')) {
        this.el.style.paddingBottom = this.model.get('layout').get('b-padding');
      }

      if(this.model.get('selected') === true) {
        $(this.el).addClass('selected');
        this.el.style.zIndex = 2000;
        this.selected = true;
      }

      this.el.innerHTML = this.renderElement();
      this.el.id = 'widget-wrapper-' + this.model.cid;

      if(this.model.isFullWidth()) this.switchOnFullWidth();

      this.resizableAndDraggable();

      return this;
    },

    renderElement: function() {
      var temp = Templates.tempNode;
      var node_context = _.clone(this.model.attributes);
      if(node_context.content) {
        node_context.content = node_context.content.replace(/\n\r?/g, '<br />');
      }
      node_context.content_attribs = this.model.get('content_attribs').attributes;
      var el = _.template(temp, { element: node_context});
      return el;
    },

    select: function(e) {
      this.el.style.zIndex = 2000;
      this.model.set('selected', true);
      this.model.select();

      e.stopPropagation();
    },

    outlineSelected: function() {

      if(this.model.get('selected')) {
        $(this.el).addClass('selected');
        this.el.style.zIndex = 2000;
        this.selected = true;
      }
      else {
        $(this.el).removeClass('selected');
        this.selected = false;
        this.el.style.zIndex = '';
      }
    },

    changedWidth: function(a) {
      this.el.className = 'selected widget-wrapper ';
      this.el.className += 'span' + this.model.get('layout').get('width');
      this.setLeft(GRID_WIDTH * (this.model.get('layout').get('left')));

    },

    changedAlignment: function() {
      this.el.style.textAlign = this.model.get('layout').get('alignment');
    },

    changedPadding: function() {
      this.el.style.paddingTop    = this.model.get('layout').get('t-padding');
      this.el.style.paddingBottom = this.model.get('layout').get('b-padding');
      this.el.style.paddingLeft   = this.model.get('layout').get('l-padding');
      this.el.style.paddingRight  = this.model.get('layout').get('r-padding');
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
      this.setLeft(GRID_WIDTH * (this.model.get('layout').get('left')));
    },

    changedText: function(a) {
      var content = this.model.get('content').replace(/\n\r?/g, '<br />');
      this.el.firstChild.innerHTML = content;
    },

    changedValue: function(a) {
      this.el.firstChild.value = this.model.get('content_attribs').get('value');
    },

    changedType: function(a) {
      this.el.firstChild.className = this.model.get('class_name');
    },

    changedSource: function(a) {
      this.el.firstChild.src = this.model.get('content_attribs').get('src');
    },

    changedStyle: function() {
      this.el.firstChild.setAttribute('style', this.model.get('content_attribs').get('style'));
      this.el.firstChild.style.lineHeight = '1em';
    },

    resizing: function(e, ui) { 

    },

    resized: function(e, ui) {
      var left = Math.round((ui.position.left / GRID_WIDTH));
      var deltaHeight = Math.round((ui.size.height + 6) / GRID_HEIGHT);
      var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);

      this.model.get('layout').set('width', deltaWidth);
      this.model.get('layout').set('height', deltaHeight);
      this.model.get('layout').set('left', left);

      this.el.style.width ='';
      this.el.style.height = '';
      this.el.style.left = '';
      this.changedWidth();
      this.changedHeight();
      this.changedLeft();

      this.model.select();
    },

    moving: function(e, ui) {
      var top = Math.round((ui.position.top / GRID_HEIGHT));
      var left = Math.round((ui.position.left / GRID_WIDTH));
      this.model.get('layout').set('top', top);
      this.model.get('layout').set('left', left);
    },

    moved: function(e, ui) {
      this.el.style.left ='';
      this.el.style.top = '';
      this.changedLeft();
      this.changedTop();
      this.model.select();
    },

    staticsAdded: function(files) {
      _(files).each(function(file){
        file.name = file.filename;
        statics.push(file);
      });
      this.model.get('content_attribs').set('src', _.last(files).url);
      //this.show(this.model);
    },

    keyHandler: function (e) {
      switch(e.keyCode) {
        case 13: //enter
          break;
        case 27:
          break;
      }
      return false;
    }
  });

  return WidgetView;
});