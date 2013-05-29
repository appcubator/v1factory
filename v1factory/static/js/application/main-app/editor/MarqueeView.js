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
      if(mouseDispatcher.isMousedownActive) {
        return;
      }

      this.$el.show();
      this.isDrawing = true;

      var coorX = e.offsetX;
      var coorY = e.offsetY;

      if(e.target.id == 'marquee-view') {
        coorX += document.getElementById('marquee-view').offsetLeft;
        coorY += document.getElementById('marquee-view').offsetTop;
      }

      this.setTop(coorY);
      this.setLeft(coorX);

      this.origin.x = coorX;
      this.origin.y = coorY;

    },

    mouseup: function(e) {
      this.isDrawing = false;
      this.setZero();
    },

    mousemove: function(e) {
      e.returnValue = false;
      if(!this.isDrawing) return;

      var coorX = e.offsetX;
      var coorY = e.offsetY;

      if(e.target.id != 'elements-container') {
        coorX += e.target.offsetLeft;
        coorY += e.target.offsetTop;
      }

      var distWidth = this.origin.x - coorX;
      var distHeight = this.origin.y - coorY;
      var diffWidth = Math.abs(this.origin.x - coorX);
      var diffHeight = Math.abs(this.origin.y - coorY);


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

    },

    setZero: function() {
      this.$el.hide();
      this.setWidth(0);
      this.setHeight(0);
    },

    render: function() {
      document.getElementById('page').addEventListener('mousedown', this.mousedown);
      document.getElementById('page').addEventListener('mouseup', this.mouseup);
      document.getElementById('page').addEventListener('mousemove', this.mousemove);
      this.el.className = 'marquee-view';
      this.el.id = 'marquee-view';
      this.setZero();
      return this;
    }

  });

  return WidgetSelectorView;

});
