define(['backbone', 'jquery-ui'], function() {

  var BackboneUI = {};

  BackboneUI.UIView = Backbone.View.extend({

    resizableAndDraggable: function() {
      var self = this;

      $(self.el).resizable({
        handles: "n, e, s, w, se",
        grid: [80, 15],
        containment: "parent",
        resize: self.resizing,
        stop  : self.resized
      });

      self.$el.draggable({
        containment: "parent",
        grid: [80, 15],
        drag: self.moving,
        stop: self.moved,
        snapMode : "outer"
      });

      this.setPosition("absolute");
    },

    draggable: function() {
      var self = this;
      self.$el.draggable({
        containment: parent,
        grid: [80, 15],
        drag: self.moving,
        stop: self.moved
      });
    },

    resizable: function() {
      var self = this;
      self.$el.resizable({
        handles: "n, e, s, w, se",
        grid: 30,
        resize: self.resizing,
        stop: self.resized
      });

      this.setPosition("absolute");
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

  BackboneUI.ModalView = Backbone.View.extend({
    width: 500,
    events : {
      'click .modal-bg' : 'closeModal',
      'keydown'         : 'handleKey'
    },

    _configure: function(options) {
      BackboneUI.ModalView.__super__._configure.call(this, options);
      this.backgroundDiv = this.setupModal();
      this.modalWindow = this.setupModalWindow();

      _.bindAll(this, 'closeModal', 'handleKey');
    },

    _ensureElement: function(options) {
      BackboneUI.ModalView.__super__._ensureElement.call(this, options);
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
      var self = this;

      var div = document.createElement('div');
      div.style.position = 'fixed';
      div.className = 'modal';
      div.style.width = this.width + 'px';
      div.style.minHeight = '300px';
      div.style.top = '50%';
      div.style.left = '50%';
      div.style.marginLeft= '-'+ (this.width/2) +'px';
      div.style.marginTop = '-300px';

      var span = document.createElement('span');
      span.className = 'modal-cross';
      span.style.position = 'absolute';
      span.style.right = '15px';
      span.style.top = '15px';
      span.innerText = '×';
      div.appendChild(span);

      var content = document.createElement('div');
      content.style.width = '100%';
      div.appendChild(content);

      document.body.appendChild(div);

      $(span).on('click', function(){
        self.$el.remove();
        $(self.backgroundDiv).remove();
        $(self.modalWindow).remove();
        self.stopListening();
      });

      this.el = content;
      return div;
    },

    closeModal: function() {
      this.remove();
      $(this.modalWindow).remove();
    },

    handleKey: function(e) {
      console.log(e.keyCode);
      if(e.keyCode == 27) { //escape
        this.closeModal();
        e.stopPropagation();
      }
    }

  });

  return BackboneUI;
});
