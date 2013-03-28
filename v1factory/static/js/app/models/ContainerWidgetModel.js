define([
  'app/models/WidgetModel',
  'app/models/ContentModel',
  'app/models/LayoutModel',
  'app/models/ContainerInfoModel',
  'editor/TableQueryView',
  'app/models/QueryModel',
  'app/collections/WidgetCollection',
  'backboneui',
  'backbone',
  'dicts/constant-containers'
],
function(WidgetModel, ContentModel, LayoutModel, ContainerInfoModel, TableQueryView, QueryModel, WidgetCollection, BackboneUI, Backbone) {


  var ContainerWidgetModel = WidgetModel.extend({
    selected: false,

    defaults: {
      'container_info' : null,
      'deletable' : true
    },

    initialize: function(bone) {
      ContainerWidgetModel.__super__.initialize.call(this, bone);

      var self = this;

      this.set('container_info', new ContainerInfoModel(this.get('container_info')));

      if(this.get('container_info').get('uielements').length || this.get('container_info').has('query')) {
        return;
      }

      if(this.get('container_info').has('form')) {
        console.log(this.get('container_info').get('form'));
      }
      else if(constantContainers[this.get('container_info').get('action')]) {
        this.get('container_info').set('uielements',  new WidgetCollection());

        _(constantContainers[this.get('container_info').get('action')]).each(function(element){
          elementDefault = uieState[element.type][0];
          element = _.extend(elementDefault, element);
          self.get('container_info').get('uielements').push(element);
          //self.get('container_info')widgetsCollections.push(element);
        });
      }
      else {
        console.log(this.get('container_info').get('action'));
        this.containerHandler[this.get('container_info').get('action')].call(this);
        if(this.get('container_info').get('action') == 'table') { };
      }

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


    containerHandler: {
      'show' : function() {
        console.log(this);
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
      },
      'table-gal' : function() {
        var self = this;
        var isNew = false;

        //console.log(self.get('container_info').get('entity'));

        if(!self.get('container_info').has('query')) {
          var queryModel = new QueryModel({}, this.get('container_info').get('entity'));
          self.get('container_info').set('query', queryModel);
          console.log(queryModel);
          new TableQueryView(self, queryModel);
        }
        //this.get('container_info').set('query', queryModel);

      }
    }
  });

  return ContainerWidgetModel;
});