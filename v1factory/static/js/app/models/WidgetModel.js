define(['backbone', './ContentModel', './LayoutModel', './ContainerInfoModel','../../dicts/constant-containers'],
  function(Backbone, ContentModel, LayoutModel, ContainerInfoModel) {

  var WidgetModel = Backbone.Model.extend({
    selected: false,

    defaults: {
      'container_info' : null,
      'deletable' : true
    },

    initialize: function(bone) {
      var self = this;

      this.set('content_attribs', new ContentModel(this.get('content_attribs')));
      this.set('layout', new LayoutModel(this.get('layout')));
      if(this.has('container_info')) {
        this.set('container_info', new ContainerInfoModel(this.get('container_info')));
      }
      //this.set('attribs', new AttribsModel(this.get('attribs')));

      _.bindAll(this, 'select', 'assignCoord', 'isFullWidth');

      if(this.get('container_info')&&this.get('container_info').has('action')) {

        if(this.get('container_info').get('uielements').length) {
          return;
        }

        if(constantContainers[this.get('container_info').get('action')]) {
          var WidgetCollection = require('../collections/WidgetCollection');
          this.get('container_info').set('uielements',  new WidgetCollection());

          _(constantContainers[this.get('container_info').get('action')]).each(function(element){
            elementDefault = uieState[element.type][0];
            element = _.extend(elementDefault, element);
            self.get('container_info').get('uielements').push(element);
          });
        }
        else {
          this.containerHandler[this.get('container_info').get('action')].call(this);
        }
      }
    },

    select: function() {
      this.collection.select(this);
      this.set('selected', true);
    },

    remove :function() {
      if(this.get('deletable') === false) return;
    },

    toJSON : function() {
      var json = _.clone(this.attributes);
      json = _.omit(json, 'selected', 'deletable');

      json.content_attribs = this.get('content_attribs').toJSON()|| {};
      json.content = this.get('content')||'';
      json.layout  = this.get('layout').toJSON();
      if(json.container_info) {
        json.container_info = this.get('container_info').toJSON();
      }

      if(this.has('container_info')) {
        json.container_info = this.get('container_info').toJSON();
      }

      return json;
    },

    isFullWidth: function() {
      return this.get('layout').get('isFull') === true;
    },

    moveLeft: function() {
      if(this.isFullWidth()) return;

      if(this.get('layout').get('left') < 1 || this.collection.editMode) return;
      this.get('layout').set('left', this.get('layout').get('left') - 1);
    },

    moveRight: function() {
      if(this.isFullWidth() || this.collection.editMode) return;

      if(this.get('layout').get('left') + this.get('layout').get('width') > 11) return;
      this.get('layout').set('left', this.get('layout').get('left') + 1);
    },

    moveUp: function() {
      if(this.get('layout').get('top') < 1 || this.collection.editMode) return;
      this.get('layout').set('top', this.get('layout').get('top') - 1);
    },

    moveDown: function() {
      if(this.collection.editMode) return;
      this.get('layout').set('top', this.get('layout').get('top') + 1);
    },


    assignCoord: function() {
      var coordinates = currentCoord? iui.unite(currentCoord.initCor, currentCoord.lastCor):
                                      iui.unite({x: 0, y:2}, {x: 16, y: 10});

      this.get('layout').set('top', coordinates.topLeft.y + 1);
      this.get('layout').set('left', coordinates.topLeft.x + 1);
      this.get('layout').set('width', coordinates.bottomRight.x - coordinates.topLeft.x);
      this.get('layout').set('height', coordinates.bottomRight.y - coordinates.topLeft.y);
    },

    containerHandler: {
      'show' : function() {
        var self = this;
        self.get('container_info').set('uielements', new WidgetCollection());

        _(this.get('container_info').get('entity').get('fields').models).each(function(model, ind){

          var coordinates = iui.unite({x: 1,
                                       y: 1 + (ind * 4)},
                                      {x: self.get('layout').get('width') + 1,
                                       y: 1 + ((ind+1) * 4)});
          var type = "text";
          var widgetProps = uieState['text'][0];
          widgetProps.type = 'text';
          widgetProps.layout = {
              top   : coordinates.topLeft.y,
              left  : coordinates.topLeft.x,
              width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
              height: 4
          };
          widgetProps.content = '{{'+self.get('container_info').get('entity').get('name')+'_'+model.get('name')+'}}';

          var widget = new WidgetModel(widgetProps);
          self.get('container_info').get('uielements').push(widget);
        });
      },
      'create' : function() {
        var self = this;
        var container_info = self.get('container_info');
        var WidgetCollection = require('../collections/WidgetCollection');

        container_info.set('uielements', new WidgetCollection());
        self.set('container_info', container_info);
        self.get('container_info').set('uielements', new WidgetCollection());

        _(self.get('container_info').get('entity').get('fields').models).each(function(model, ind){

          var coordinates = iui.unite({x: 1,
                                       y: 1 + (ind * 2)},
                                      {x: self.get('layout').get('width') + 1,
                                       y: 1 + ((ind+1) * 2)});
          var type = "text-input";
          var widgetProps = uieState[type][0];
          widgetProps.type = type;
          widgetProps.layout = {
              top   : coordinates.topLeft.y,
              left  : coordinates.topLeft.x,
              width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
              height: 4
          };

          widgetProps.content_attribs.placeholder = self.get('container_info').get('entity').get('name')+' '+model.get('name');
          widgetProps.content_attribs.name = model.get('name');

          var widget = new WidgetModel(widgetProps);
          self.get('container_info').get('uielements').push(widget);
        });

        var ind = this.get('container_info').get('entity').get('fields').length;
        var coordinates = iui.unite({x: 1,
                                     y: 1 + (ind * 2)},
                                    {x: self.get('layout').get('width') + 1,
                                     y: 1 + ((ind+1) * 2)});
        var type = "button";
        var widgetProps = uieState[type][0];
        widgetProps.type = type;
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };
        widgetProps.content_attribs.value = 'Create';
        var widget = new WidgetModel(widgetProps);
        self.get('container_info').get('uielements').push(widget);
      },
      'addbutton' : function() {
        var self = this;
        var container_info = self.get('container_info');
        container_info.set('uielements', new WidgetCollection());
        self.set('container_info', container_info);

        var coordinates = iui.unite({x: 1,
                                     y: 1 },
                                    {x: self.get('layout').get('width') + 1,
                                     y: 1 });
        var type = "button";
        var widgetProps = uieState[type][0];
        widgetProps.type = type;
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };

        widgetProps.content_attribs.value = 'Add ' + this.get('container_info').get('entity').get('name');
        var widget = new WidgetModel(widgetProps);
        self.get('container_info').get('uielements').push(widget);
      },
      'login' : function() {
        var self = this;
        self.get('container_info').set('uielements', new WidgetCollection());

        var coordinates = iui.unite({x: 1,
                                     y: 1 },
                                    {x: self.get('layout').get('width') + 1,
                                     y: 1 });
        var type = "text-input";
        var widgetProps = uieState[type][0];
        widgetProps.type = type;
        widgetProps.content_attribs.placeholder = "Username...";
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };

        var widget = new WidgetModel(widgetProps);
        self.get('container_info').get('uielements').push(widget);

        var coordinates = iui.unite({x: 1,
                                     y: 5 },
                                    {x: self.get('layout').get('width') + 1,
                                     y: 5 });
        var type = "password";
        var widgetProps = uieState['password'][0];
        widgetProps.type = type;
        widgetProps.content_attribs.placeholder = "Password...";
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };

        widgetProps.content_attribs.value = 'Add ' + self.get('container_info').entity;
        var widget = new WidgetModel(widgetProps);
        self.get('container_info').get('uielements').push(widget);
      },
      'signup' : function() {
        var self = this;
        self.get('container_info').set('uielements', new WidgetCollection());

        var coordinates = iui.unite({x: 1,
                                     y: 1 },
                                    {x: self.get('layout').get('width') + 1,
                                     y: 1 });
        var type = "text-input";
        var widgetProps = uieState[type][0];
        widgetProps.type = type;
        widgetProps.deletable = false;
        widgetProps.content_attribs.placeholder = "Username...";
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };

        var widget = new WidgetModel(widgetProps);
        self.get('container_info').get('uielements').push(widget);

        var coordinates = iui.unite({x: 1,
                                     y: 5 },
                                    {x: self.get('layout').get('width') + 1,
                                     y: 5 });
        var type = "password";
        var widgetProps = uieState['password'][0];
        widgetProps.type = type;
        widgetProps.deletable = false;
        widgetProps.content_attribs.placeholder = "Password...";
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };

        var widget = new WidgetModel(widgetProps);
        self.get('container_info').uielements.push(widget);

        var coordinates = iui.unite({x: 1,
                                     y: 9 },
                                    {x: self.get('layout').get('width') + 1,
                                     y: 9 });
        var type = "button";
        var widgetProps = uieState[type][0];
        widgetProps.type = type;
        widgetProps.deletable = false;
        widgetProps.content_attribs.value = "Sign Up";
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };

        var widget = new WidgetModel(widgetProps);
        self.get('container_info').get('uielements').push(widget);
      }
    }
  });

  return WidgetModel;
});
