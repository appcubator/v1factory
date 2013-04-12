define([
  'app/collections/ElementCollection'
],
function(ElementCollection) {

  var RowGalleryView = Backbone.View.extend({
    el       : null,
    className: 'elements-list',
    events : {
    },

    initialize: function(rowModel, entityModel){
      _.bindAll(this, 'render', 'dropped');
      this.entity = entityModel;
      this.row = rowModel;
      this.elementsCollection   = new ElementCollection(defaultElements);
      this.render();
    },

    render: function() {
      var self = this;

      var list = document.createElement('ul');
      list.className = 'section';
      this.el.appendChild(list);
      this.allList = list;

      this.appendContextEntity(this.entity);

      _(self.elementsCollection.models).each(function(element) {
        self.appendElement(element);
      });

      //this.el.innerHTML += "<h3><div class='list-view list-type'>List View</div><div class='grid-view list-type'>Grid View</div></h3>";

      // var rowWidget = document.createElement('div');
      // this.rowWidget = rowWidget;
      // rowWidget.className = 'editor-window container-wrapper';
      // rowWidget.className += (' hi' + this.rowModel.get('layout').get('height'));
      // editorDiv.appendChild(rowWidget);

      // if(this.rowModel.get('isListOrGrid') == "list") {
      //   iui.resizableVertical(rowWidget, self);
      //   rowWidget.style.width = '100%';
      // }
      // else {
      //   iui.resizable(rowWidget, self);
      //   rowWidget.className += (' span' + this.rowModel.get('layout').get('width'));
      // }

      this.$el.find('.entity').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });

      this.$el.find('.single-data').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });

      return this;
    },

    appendContextEntity : function(entityModel) {
      // Form, Data elements belonging to the entity
      var self = this;

      _(entityModel.get('fields').models).each(function(model, ind) {
        var context = {
          name : entityModel.get('name'),
          cid  : entityModel.cid,
          attr : model.get('name'),
          type : model.get('type')
        };

        $(self.allList).append(_.template(Templates.tempLiSingleData, context));
      });
    },

    appendElement: function(elementModel) {
      var self = this;
      var li = document.createElement('li');
      li.className = elementModel.get('className');
      li.innerHTML = '<span class="name">'+ elementModel.get('text')+'</span>';

      $(this.allList).append(li);

      this.$el.find('.' + elementModel.get('className')).draggable({
        cursor  : "move",
        cursorAt: { top: 0, left: 0 },
        helper: function( event ) {
          return $(elementModel.get('el')).css('position','fixed');
        },
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });

      $(li).on('click', self.dropped);
    },

    dropped: function(e) {
        var self = this;
      var widget = {};
      var left, top, offsetLeft;

      this.dragActive = false;

      // if(e.type != 'click') {
      //   offsetLeft = document.getElementById('page-wrapper').offsetLeft + 100;
      //   left = Math.round((e.pageX - offsetLeft)/GRID_WIDTH);
      //   top  = Math.round((e.pageY - $('.page')[0].offsetTop - 180)/GRID_HEIGHT);

      //   if(top < 0) top = 0;
      //   if(left < 0) left = 0;
      //   if(left + 4 > 12) left = 8;
      // }
      // else {
      //   left = 0;
      //   top = 1;
      //   window.scrollTo(0,0);
      // }

      left = 0;
      top = 1;

      widget.layout = {
        top   : top,
        left  : left
      };

      var className = e.target.className;
      var id = e.target.id;

      var hash, entityCid, formCid, action;
      var entity, form, field;

      if (/(single-data)/.exec(className)) {
        id = String(id).replace('entity-','');
        var cid = id.split('-')[0];

        if(cid === this.userModel.cid) {
          entity = new UserEntityModel(appState.users);
        }
        else {
          entity = this.entitiesCollection.get(cid);
        }

        field          = id.split('-')[1];

        widget         = _.extend(widget, uieState['texts'][0]);
        widget.content =  '{{'+entity.get('name')+'.'+field+'}}';
        this.row.get('uielements').push(widget);
      }
      else {
        var type;
        type        = className.replace(' ui-draggable','');
        widget      = _.extend(widget, uieState[type][0]);
        widget.type = type;
        this.row.get('uielements').push(widget);
      }
    }

  });

  return RowGalleryView;
});

