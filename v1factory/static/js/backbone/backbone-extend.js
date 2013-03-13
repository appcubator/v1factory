Backbone.UIView = Backbone.View.extend({

  resizableAndDraggable: function() {
    var self = this;

    self.$el.resizable({
      handles: "n, e, s, w, se",
      containment: $('#elements-container'),
      resize: self.resizing,
      stop  : self.resized
    });

    self.$el.draggable({
      containment: $('#elements-container'),
      drag: self.moving,
      stop: self.moved
    });

    this.setPosition("absolute");
  },

  draggable: function() {
    var self = this;
    self.$el.draggable({
      containment: $('#elements-container'),
      drag: self.moving,
      stop: self.moved
    });
  },

  resizable: function() {
    var self = this;
    $(this.el).resizable({
      handles: "n, e, s, w, se",
      grid: 30,
      resize: self.resizing,
      stop: self.resized
    });
  },

  disableResizeAndDraggable: function() {
    if(this.$el.hasClass('ui-resizable')) {
      $(this.el).resizable("disable");
    }
    if(this.$el.hasClass('ui-draggable')) {
      $(this.el).draggable("disable");
    }
  },

  clear : function() {
    this.disableResizeAndDraggable();
    this.el.className = this.className;
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

Backbone.ModalView = Backbone.View.extend({

    events : {
      'click .modal-bg' : 'closeModal'
    },

    _configure: function(options) {
      Backbone.ModalView.__super__._configure.call(this, options);
      this.backgroundDiv = this.setupModal();
      this.modalWindow = this.setupModalWindow();

      _.bindAll(this, 'closeModal');
    },

    _ensureElement: function(options) {
      Backbone.ModalView.__super__._ensureElement.call(this, options);
      this.modalWindow.appendChild(this.el);
    },

    setupModal: function() {
      var self = this;
      var div = document.createElement('div');
      div.className = "modal-bg";
      div.style.position = 'fixed';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.top = '0';
      div.style.left = '0';
      div.style.backgroundColor = '#222';
      div.style.opacity = '0.6';
      document.body.appendChild(div);

      $(div).on('click', function() {
        self.$el.remove();
        $(self.backgroundDiv).remove();
        $(self.modalWindow).remove();
        self.stopListening();
      });

      return div;
    },

    setupModalWindow: function() {
      var div = document.createElement('div');
      div.style.position = 'fixed';
      div.className = 'modal';
      div.style.width = '500px';
      div.style.minHeight = '300px';
      div.style.top = '50%';
      div.style.left = '50%';
      div.style.marginLeft= '-250px';
      div.style.marginTop = '-250px';
      document.body.appendChild(div);
      return div;
    },

    closeModal: function() {
      this.remove();
    }

});