Backbone.View = Backbone.View.extend({

  resizableAndDraggable: function() {
    var self = this;
    console.log(self);
    $(self.el).resizable({
      handles: "n, e, s, w, se",
      grid: 15,
      resize: self.resized
    });

    $(self.el).draggable({
      grid: [ 15,15 ],
      drag: self.moved
    });
  }

});