define([
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor, WidgetLayoutEditor, WidgetInfoEditorView) {

  var WidgetSelectorView = Backbone.UIView.extend({
    el     : document.getElementById('elements-container'),
    className : 'editor-page fadeIn',
    tagName : 'div',
    selectedEl : null,

    initialize: function(widgetsCollection){
      _.bindAll(this, 'render',
                      'clear',
                      'setLayout',
                      'doBindings',
                      'widgetHover',
                      'widgetUnhover',
                      'newSelected',
                      'resizing',
                      'resized',
                      'moving',
                      'moved');

      this.widgetsCollection    = widgetsCollection;
      this.widgetsCollection.bind('selected', this.selectChanged, this);
      //this.widgetsCollection.bind('hovered', this.hoverChanged, this);

      this.doBindings();
    },

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

      selectDiv.style.zIndex = "2000";

      return this;
    },

    doBindings: function() {
      var self = this;
      _(this.widgetsCollection.models).each(function(widget) {
        widget.bind('hovered', function() {
          self.widgetHover(this);
        });

        widget.on('unhovered', function() {
          self.widgetUnhover(this);
        });

        widget.on('selected', function() {
          self.newSelected(this);
        });

      });
    },

    setLayout: function(node, widgetModel) {
      console.log('setting layout');
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
      console.log("selected");
      if(this.selectedEl && this.selectedEl.cid == widgetModel.cid) return;
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

    clear: function() {
    }
  });

  return WidgetSelectorView;

});
