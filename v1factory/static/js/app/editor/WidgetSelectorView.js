define([
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor, WidgetLayoutEditor, WidgetInfoEditorView) {

  var WidgetSelectorView = Backbone.UIView.extend({
    el     : document.getElementById('elements-container'),
    className : 'editor-page',
    tagName : 'div',
    selectedEl : null,
    events : {
      'mousedown' : 'mousedown'
    },

    initialize: function(widgetsCollection){
      _.bindAll(this, 'render',
                      'clear',
                      'setLayout',
                      'widgetHover',
                      'widgetUnhover',
                      'newSelected',
                      'resizing',
                      'resized',
                      'moving',
                      'moved',
                      'bindWidget',
                      'mousedown',
                      'deselect');

      this.widgetsCollection    = widgetsCollection;
      this.widgetsCollection.bind('add', this.bindWidget);
      var self = this;
      _(this.widgetsCollection.models).each(self.bindWidget);

    },

    mousedown: function(e) { console.log("YO"); e.stopImmediatePropagation(); },

    render: function() {
      var self = this;

      var hoverDiv = document.createElement('div');
      hoverDiv.id = "hover-div";
      hoverDiv.style.width = 0;
      hoverDiv.style.height = 0;
      this.hoverDiv = hoverDiv;
      this.el.appendChild(hoverDiv);

      var selectDiv = document.createElement('div');
      selectDiv.id = "select-div";
      selectDiv.style.width = 0;
      selectDiv.style.height = 0;
      this.selectDiv = selectDiv;
      this.el.appendChild(selectDiv);

      $(selectDiv).resizable({
        handles: "n, e, s, w, se",
        // grid: [80, 15],
        containment: "parent",
        resize: self.resizing,
        stop  : self.resized
      });

      $(selectDiv).draggable({
        containment: "parent",
        //grid: [80, 15],
        drag: self.moving,
        stop: self.moved,
        snapMode : "outer"
      });

      selectDiv.style.zIndex = "2002";

      $('.page.fdededfcbcbcd').on('mousedown', this.deselect);
      console.log($('#elements-container'));
      $('#elements-container').on('mousedown', this.deselect);

      return this;
    },

    bindWidget: function(widget) {
      console.log(widget);
      console.log(this);
      var self = this;
      widget.bind('hovered', function() {
        self.widgetHover(widget);
      });

      widget.on('unhovered', function() {
        self.widgetUnhover(widget);
      });

      widget.on('selected', function() {
        self.newSelected(widget);
      });
    },

    setLayout: function(node, widgetModel) {
      $(this.selectDiv).fadeIn();
      node.style.width = widgetModel.get('layout').get('width') * 80;
      node.style.height = widgetModel.get('layout').get('height') * 15;
      node.style.left = widgetModel.get('layout').get('left') * 80;
      node.style.top = widgetModel.get('layout').get('top') * 15;
      return node;
    },

    widgetHover: function(widgetModel) {
      if(this.selectedEl && widgetModel.cid === this.selectedEl.cid) return;
      this.setLayout(this.hoverDiv, widgetModel);
    },

    widgetUnhover: function(widgetModel) {
      this.hoverDiv.style.height = 0;
      this.hoverDiv.style.width = 0;
    },

    bindLocation: function() { },

    newSelected: function(widgetModel) {
      console.log(widgetModel);

      if(this.selectedEl != null && this.selectedEl.cid == widgetModel.cid) return;
            console.log("SELECTED");
      console.log(this);
      this.selectedEl = widgetModel;
      this.setLayout(this.selectDiv, widgetModel);
    },

    resizing: function(e, ui) {
      var elem = iui.get('widget-wrapper-' + this.selectedEl.cid);
      elem.style.width = ui.size.width + 'px';
      elem.style.height = ui.size.height + 'px';
      elem.style.left = ui.position.left + 'px';
    },

    resized: function(e, ui) {
      var left = Math.round((ui.position.left / GRID_WIDTH));
      var deltaHeight = Math.round((ui.size.height + 6) / GRID_HEIGHT);
      var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);
      this.selectedEl.get('layout').set('width', deltaWidth);
      this.selectedEl.get('layout').set('height', deltaHeight);
      this.selectedEl.get('layout').set('left', left);
      this.setLayout(this.selectDiv, this.selectedEl);
    },

    moving: function(e, ui) {
      console.log(this);
      console.log(this.selectedEl);
      console.log(this.selectedEl.cid);
      var elem = iui.get('widget-wrapper-' + this.selectedEl.cid);
      elem.style.top = ui.position.top + 'px';
      elem.style.left = ui.position.left+ 'px';
    },

    moved: function(e, ui) {
      var top = Math.round((ui.position.top / GRID_HEIGHT));
      var left = Math.round((ui.position.left / GRID_WIDTH));
      this.selectedEl.get('layout').set('top', top);
      this.selectedEl.get('layout').set('left', left);
      this.setLayout(this.selectDiv, this.selectedEl);
    },

    deselect: function() {
      this.selectedEl = null;
      this.selectDiv.style.height = 0;
      this.selectDiv.style.width = 0;
      $(this.selectDiv).fadeOut();
    },

    clear: function() {
    }

  });

  return WidgetSelectorView;

});
