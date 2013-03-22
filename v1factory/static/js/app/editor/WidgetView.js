define([
  'backbone',
  'backboneui'
],function(Backbone, BackboneUI) {

  var WidgetView = BackboneUI.UIView.extend({
    el: null,
    className: 'pseudo-outline widget-wrapper',
    tagName : 'div',
    widgetsContainer :null,
    selected : false,
    editable : false,
    editMode : false,
    shadowElem : null,

    events: {
      'click' : 'select',
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
                      'switchOffEditModeWithoutSave',
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

      //this.model.select();

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      // if(this.model.get('type') == 'box') {this.el.style.zIndex = 0;}
      this.setTop(GRID_HEIGHT * (this.model.get('layout').get('top')));
      this.setLeft(GRID_WIDTH * (this.model.get('layout').get('left')));
      this.setHeight(height * GRID_HEIGHT);
      this.el.className += " span" + width;
      this.el.style.textAlign = this.model.get('layout').get('alignment');
      this.el.innerHTML = this.renderElement();
      this.el.firstChild.style.lineHeight = '1em';

      if(this.model.isFullWidth()) this.switchOnFullWidth();

      this.resizableAndDraggable();

      return this;
    },

    renderElement: function() {
      var temp = Templates.tempNode;
      var node_context = _.clone(this.model.attributes);
      node_context.content_attribs = this.model.get('content_attribs').attributes;
      var el = _.template(temp, { element: node_context});
      return el;
    },

    select: function(e) {
      this.model.select();
      e.stopPropagation();
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
      this.el.firstChild.innerHTML = this.model.get('content');
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
      var left = Math.round((ui.position.left / GRID_WIDTH));
      this.model.get('layout').set('top', top);
      this.model.get('layout').set('left', left);
    },

    moved: function () {
      // console.log(this);
      // this.render();
      // this.model.select();
      // this.resizableAndDraggable();
    },

    staticsAdded: function(files) {
      _(files).each(function(file){
        file.name = file.filename;
        statics.push(file);
      });
      this.model.get('content_attribs').set('src', _.last(files).url);
      //this.show(this.model);
    },

    switchOnEditMode: function(e) {

      if(this.model.get('type') == "image") {
        iui.openFilePick(function(files, f) {f(files);}, this.staticsAdded, appId);
        return;
      }

      this.model.collection.editMode = true;

      var editedElem = this.el.firstChild;
      var top = $(editedElem).offset().top;
      var left = $(editedElem).offset().left;
      this.editedElem = editedElem;


      elem = document.createElement('input');
      elem.setAttribute('type', "text");
      //editedElem.cloneNode(true);
      //elem.setAttribute('contenteditable', true);
      elem.style.position = 'absolute';
      elem.style.top = top;
      elem.style.left = left;
      elem.style.zIndex = 1001;
      this.shadowElem = elem;

      elem.value = editedElem.value||editedElem.innerText;
      //$(editedElem).hide();

      document.body.appendChild(elem);
      elem.focus();
      elem.select();

    },

    switchOffEditMode: function() {

      this.model.collection.editMode = false;

      if(this.model.get('type') == "text" || this.model.get('type') == "header-text" || this.model.get('type') == "link" ) {
        this.model.set('content', this.shadowElem.value);
      }
      else if(this.model.get('type') == "button") {
        this.model.get('content_attribs').set('value', this.shadowElem.value);
      }

      $(this.shadowElem).remove();
      $(this.editedElem).fadeIn();
    },

    switchOffEditModeWithoutSave: function() {
      this.model.collection.editMode = false;
      $(this.shadowElem).remove();
      $(this.editedElem).fadeIn();
    },

    keyHandler: function (e) {
      //if(this.editMode === false) return;
      switch(e.keyCode) {
        case 13: //enter
          this.switchOffEditMode();
          //return false;
          break;
        case 27:
          this.switchOffEditModeWithoutSave();
          break;
      }

      return false;
    }
  });

  return WidgetView;
});