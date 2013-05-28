define([
  'editor/WidgetEditorView',
  'mixins/BackboneUI',
  'iui'
],
function(WidgetEditorView) {

  var WidgetSelectorView = Backbone.UIView.extend({
    className : 'marquee-view',
    tagName : 'div',
    isDrawing: false,
    origin: {
      x: 0,
      y: 0
    },

    events : {

    },

    initialize: function(){
      _.bindAll(this, 'render',
                      'mouseup',
                      'mousedown',
                      'mousemove',
                      'setZero');
    },

    mousedown: function(e) {
      this.isDrawing = true;
      this.setTop(e.offsetY);
      this.setLeft(e.offsetX);

      this.setWidth(6);
      this.setHeight(6);

      this.origin.x = e.offsetX;
      this.origin.y = e.offsetY;
    },

    mouseup: function(e) {
      this.isDrawing = false;
      this.setZero();
    },

    mousemove: function(e) {
      if(!this.isDrawing) return;

      var distWidth = this.origin.x - e.offsetX;
      var distHeight = this.origin.y - e.offsetY;
      var diffWidth = Math.abs(this.origin.x - e.offsetX);
      var diffHeight = Math.abs(this.origin.y - e.offsetY);

      this.setWidth(diffWidth);
      if(distWidth == diffWidth) {
        this.setLeft(this.origin.x - diffWidth);
      }
      else {
        this.setLeft(this.origin.x);
      }

      this.setHeight(diffHeight);
      if(distHeight == diffHeight) {
        this.setTop(this.origin.y - diffHeight);
      }
      else {
        this.setTop(this.origin.y);
      }

      e.returnValue = false;

    },

    setZero: function() {
      this.setWidth(0);
      this.setHeight(0);
    },

    render: function() {

      document.getElementById('elements-container').addEventListener('mousedown', this.mousedown);
      document.getElementById('elements-container').addEventListener('mouseup', this.mouseup);
      document.getElementById('elements-container').addEventListener('mousemove', this.mousemove);
      this.el.className = 'marquee-view';
      this.setWidth(0);
      this.setHeight(0);
      return this;
    }

  });

  return WidgetSelectorView;

});
