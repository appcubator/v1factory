/*
 *  Models
 *  Written by icanberk
 *
 *  Abstract:
 *  Contains all the front-end modules
 *
 *  Notes:
 *  Widgets are elements that are placed on the editor - they
 *  posses some context/information
 *  UIElementModel are purely type/style of interface elements.
 *
 *  Includes:
 *  - DesignProperty
 *  - EntityModel
 *  - WidgetModel
 *  - UIElementModel
 *  - EntityModel
 *  - UserEntityModel
 *  - PageModel
 *
 */

var DesignProperty = Backbone.Model.extend({});


var EntityModel = Backbone.Model.extend({
  defaults: {
    name: "default name",
    fields: []
  }
});

var UserEntityModel = EntityModel.extend({
  defaults : {
    facebook : false,
    linkedin : false,
    local : true,
    fields : [{
      "name"     :"description",
      "required" :false,
      "type"     : "text"
    }]
  }
});

var LayoutModel = Backbone.Model.extend({
  defaults: {
    'top'    : 0,
    'left'   : 0,
    'height' : 8,
    'width'  : 16
  }
});

var ContentModel = Backbone.Model.extend({
});

var AttribsModel = Backbone.Model.extend({
});

var WidgetModel = Backbone.Model.extend({
  selected: false,

  defaults: {
    'container_info' : null,
    'lib_id'         : 1,
    'attribs'        : {},
  },

  initialize: function(bone) {
    var self = this;

    this.set('content_attribs', new ContentModel(this.get('content_attribs')));
    this.set('layout', new LayoutModel(this.get('layout')));
    //this.set('attribs', new AttribsModel(this.get('attribs')));

    _.bindAll(this, 'select', 'assignCoord', 'isFullWidth');

    if(this.get('container_info')&&this.get('container_info').action&&this.get('container_info').uielements === undefined) {

      if(constantContainers[this.get('container_info').action]) {
        this.get('container_info').uielements = [];
        _(constantContainers[this.get('container_info').action]).each(function(element){
          var permAttribs = element.permAttribs;
          element = uieState[element.type][0];
          element.attribs = _.extend(element.attribs, permAttribs);
          self.get('container_info').uielements.push(element);
        });
      }
      else {
        console.log(this.get('container_info').action);
        this.containerHandler[this.get('container_info').action].call(this);
      }
    }
    else {

    }
  },

  select: function() {
    this.collection.select(this);
    this.set('selected', true);
  },

  toJSON : function() {
    var json = _.clone(this.attributes);
    json.content_attribs = this.get('content_attribs').toJSON()|| {};
    json.content = this.get('content')||'';
    json.layout  = this.get('layout').toJSON();

    if(this.get('container_info')) {

      if(this.get('container_info').entity && typeof this.get('container_info').entity !== "string") {
        json.container_info.entity = this.get('container_info').entity.get('name');
      }

      if(this.has('childCollection')) {
        json.container_info.uielements = this.get('childCollection');
        delete this.childCollection;
      }
    }

    return json;
  },

  isFullWidth: function() {
    return this.get('layout').get('isFull') === true;
  },

  moveLeft: function() {
    if(this.isFullWidth()) return;

    if(this.get('layout').get('left') < 1) return;
    this.get('layout').set('left', this.get('layout').get('left') - 1);
  },

  moveRight: function() {
    if(this.isFullWidth()) return;

    if(this.get('layout').get('left') + this.get('layout').get('width') > 63) return;
    this.get('layout').set('left', this.get('layout').get('left') + 1);
  },

  moveUp: function() {
    if(this.get('layout').get('top') < 1) return;
    this.get('layout').set('top', this.get('layout').get('top') - 1);
  },

  moveDown: function() {
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
      self.get('container_info').uielements = [];

      _(this.get('container_info').entity.get('fields')).each(function(v, ind, li){

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
        widgetProps.content = {
            text : '{{'+self.get('container_info').entity.get('name')+'_'+v.name+'}}'
        };
        var widget = new WidgetModel(widgetProps);
        self.get('container_info').uielements.push(widget);
      });
    },
    'create' : function() {
      var self = this;
      var container_info = self.get('container_info');
      container_info.uielements = [];
      self.set('container_info', container_info);
      self.get('container_info').uielements = [];

      _(this.get('container_info').entity.get('fields')).each(function(v, k, ind){

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
        widgetProps.content_attribs.placeholder = '{{'+self.get('container_info').entity.get('name')+'_'+v.name+'}}';
        widgetProps.content_attribs.name = v.name;

        var widget = new WidgetModel(widgetProps);
        self.get('container_info').uielements.push(widget);
      });

      var ind = this.get('container_info').entity.get('fields').length;
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
      self.get('container_info').uielements.push(widget);
    },
    'addbutton' : function() {
      var self = this;
      var container_info = self.get('container_info');
      container_info.uielements = [];
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

      widgetProps.content_attribs.value = 'Add ' + this.get('container_info').entity.get('name');
      var widget = new WidgetModel(widgetProps);
      self.get('container_info').uielements.push(widget);
    },
    'login' : function() {
      var self = this;
      self.get('container_info').uielements = [];

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
      self.get('container_info').uielements.push(widget);

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
      self.get('container_info').uielements.push(widget);
    },
    'signup' : function() {
      var self = this;
      self.get('container_info').uielements = [];

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
      self.get('container_info').uielements.push(widget);

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

      //widgetProps.content_attribs.value = 'Add ' + self.get('container_info').entity;
      var widget = new WidgetModel(widgetProps);
      console.log(widget);
      self.get('container_info').uielements.push(widget);

      var coordinates = iui.unite({x: 1,
                                   y: 9 },
                                  {x: self.get('layout').get('width') + 1,
                                   y: 9 });
      var type = "button";
      var widgetProps = uieState[type][0];
      widgetProps.type = type;
      widgetProps.content_attribs.value = "Sign Up";
      widgetProps.layout = {
          top   : coordinates.topLeft.y,
          left  : coordinates.topLeft.x,
          width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
          height: 4
      };

      var widget = new WidgetModel(widgetProps);
      self.get('container_info').uielements.push(widget);
    }
  }
});

var UIElementModel = Backbone.Model.extend({

});

var PageModel = Backbone.Model.extend({
  defaults : {
    "name"             : "default-page",
    "design_props"     : [
      {
        type  : "background-image",
        value : "/static/img/sample_bg.png"
      },
      {
        type  : "background-color",
        value : "#eee"
      },
      {
        type  : "text-color",
        value : "#000"
      },
      {
        type  : "text-size",
        value : '12px'
      },
      {
        type  : "text-family",
        value : '"Palatino Linotype", "Book Antiqua", Palatino, serif'
      },
      {
        type  : "header-color",
        value : "#666"
      },
      {
        type  : "header-size",
        value : "16px"
      },
      {
        type  : "header-family",
        value : '"Palatino Linotype", "Book Antiqua", Palatino, serif'
      }
    ],
    "access_level" : "all",
    "uielements" : []
  }
});

var UrlModel = Backbone.Model.extend({
  defaults : {
    urlparts : [],
    page_name : "defaults"
  }
});

