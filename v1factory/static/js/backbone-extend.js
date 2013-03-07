Backbone.UIView = Backbone.View.extend({

  resizableAndDraggable: function() {
    var self = this;

    $(self.el).resizable({
      handles: "n, e, s, w, se",
      grid: 15,
      resize: self.resized
    });

    $(self.el).draggable({
      grid: [ 15,15 ],
      drag: self.moved
    });

    this.setPosition("absolute");
  },

  resizable: function() {
    var self = this;
    $(this.el).resizable({
      handles: "n, e, s, w, se",
      grid: 30,
      resize: self.resized
    });
  },

  clear : function() {
    this.el.innerHTML = '';
  },

  setLeft : function(val) {
    this.el.style.left = val + "px";
  },

  setRight : function(val) {
    this.el.style.right = val + "px";

  },

  setTop: function(val) {
    this.el.style.top = val + "px";
  },

  setHeight: function(val) {
    this.el.style.height = val + "px";
  },

  setWidth: function(val) {
    this.el.style.width = val + "px";
  },

  setBottom: function(val) {
    this.el.style.bottom = val + "px";
  },

  setPosition: function(val) {
    this.el.style.position = val;
  }

});