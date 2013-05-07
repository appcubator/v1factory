define([
  'mixins/BackboneUI',
  'iui'
],
function(WidgetContentEditor, WidgetLayoutEditor, WidgetInfoEditorView) {

  var WidgetSelectorView = Backbone.UIView.extend({
    el     : document.getElementById('elements-container'),
    className : 'editor-page fadeIn',
    tagName : 'div',

    initialize: function(widgetsCollection){
      _.bindAll(this, 'render',
                      'clear',
                      'setLayout',
                      'doBindings',
                      'hoverChanged');

      this.widgetsCollection    = widgetsCollection;
      this.widgetsCollection.bind('selected', this.selectChanged, this);
      this.widgetsCollection.bind('hovered', this.hoverChanged, this);

      this.doBindings();
    },

    render: function() {
      var hoverDiv = document.createElement('div');
      hoverDiv.style.backgroundColor = 'red';
      hoverDiv.style.width = 0;
      hoverDiv.style.height = 0;
      hoverDiv.style.position = "absolute";
      this.hoverDiv = hoverDiv;
      this.el.appendChild(hoverDiv);

      var selectDiv = document.createElement('div');
      selectDiv.style.backgroundColor = 'blue';
      selectDiv.style.width = 0;
      selectDiv.style.height = 0;
      selectDiv.style.position = "absolute";

      this.selectDiv = selectDiv;
      this.el.appendChild(selectDiv);

      return this;
    },

    doBindings: function() {
      var self = this;
      _(this.widgetsCollection.models).each(function(widget) {
        widget.bind('hovered', self.hoverChanged);
      });
    },

    hoverChanged: function() {
      var widgetModel = this.widgetsCollection.hoveredEl;
      console.log(widgetModel);
      console.log(this.hoverDiv);
      this.setLayout(this.hoverDiv, widgetModel);
    },

    setLayout: function(node, widgetModel) {
      node.style.width = widgetModel.get('layout').get('width') * 80;
      node.style.height = widgetModel.get('layout').get('height') * 15;
      node.style.left = widgetModel.get('layout').get('left') * 80;
      node.style.top = widgetModel.get('layout').get('top') * 15;
      return node;
    },

    bindLocation: function() { },

    selectChanged : function(chg, ch2) {

    },

    clear: function() {
    }
  });

  return WidgetSelectorView;

});
