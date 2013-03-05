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
    'height' : 2,
    'width'  : 2
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
    'lib_id'         : 1
  },

  initialize: function(bone) {
    console.log(bone);

    this.set('content', new ContentModel(this.get('content')));
    this.set('layout', new LayoutModel(this.get('layout')));
    this.set('attribs', new AttribsModel(this.get('attribs')));

    _.bindAll(this, 'select', 'assignCoord');

    if(this.get('container_info')&&this.get('container_info').uielements == undefined) {
      // this['handle' + this.get('container_info').action]
      console.log(this);
      this.containerHandler[this.get('container_info').action].call(this);
    }
    else {

    }
  },

  select: function() {
    this.collection.unselectAll();
    this.collection.selectedEl = this;
    this.set('selected', true);
    //widgetInfoView.show(this);
  },

  toJSON : function() {
    var json = _.clone(this.attributes);
    json.attribs = this.get('attribs').toJSON();
    json.content = this.get('content').toJSON();
    json.layout  = this.get('layout').toJSON();

    return json;
  },

  moveLeft: function() {
    if(this.get('layout').get('left') < 1) return;
    this.get('layout').set('left', this.get('layout').get('left') - 1);
  },

  moveRight: function() {
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
    'entity-list' : function() {
      var self = this;
      self.get('container_info').uielements = [];

      _(this.get('container_info').entity.get('fields')).each(function(v, ind, li){

        var coordinates = iui.unite({x: 1,
                                     y: 1 + (ind * 4)},
                                    {x: self.get('layout').get('width') + 1,
                                     y: 1 + ((ind+1) * 4)});
        var type = "text";
        var widgetProps = uiLibrary['text'][0];
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
    'form' : function() {
      var self = this;
      var container_info = self.get('container_info');
      container_info.uielements = [];
      self.set('container_info', container_info);

      _(this.get('container_info').entity.get('fields')).each(function(v, k, ind){

        var coordinates = iui.unite({x: 1,
                                     y: 1 + (ind * 2)},
                                    {x: self.get('layout').get('width') + 1,
                                     y: 1 + ((ind+1) * 2)});
        var type = "text-input";
        var widgetProps = uiLibrary[type][0];
        widgetProps.type = type;
        widgetProps.layout = {
            top   : coordinates.topLeft.y,
            left  : coordinates.topLeft.x,
            width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
            height: 4
        };
        widgetProps.attribs.placeholder = '{{'+self.get('container_info').entity.get('name')+'_'+v.name+'}}';
        var widget = new WidgetModel(widgetProps);
        self.get('container_info').uielements.push(widget);
      });

      var ind = this.get('container_info').entity.get('fields').length;
      var coordinates = iui.unite({x: 1,
                                   y: 1 + (ind * 2)},
                                  {x: self.get('layout').get('width') + 1,
                                   y: 1 + ((ind+1) * 2)});
      var type = "button";
      var widgetProps = uiLibrary[type][0];
      widgetProps.type = type;
      widgetProps.layout = {
          top   : coordinates.topLeft.y,
          left  : coordinates.topLeft.x,
          width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
          height: 4
      };
      widgetProps.attribs.value = 'Create';
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
      var widgetProps = uiLibrary[type][0];
      widgetProps.type = type;
      widgetProps.layout = {
          top   : coordinates.topLeft.y,
          left  : coordinates.topLeft.x,
          width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
          height: 4
      };
      console.log(self);
      widgetProps.attribs.value = 'Add ' + this.get('container_info').entity.get('name');
      var widget = new WidgetModel(widgetProps);
      self.get('container_info').uielements.push(widget);
    },
    'login' : function() {
      var self = this;
          console.log(self);
      var coordinates = iui.unite({x: 1,
                                   y: 1 },
                                  {x: self.get('layout').get('width') + 1,
                                   y: 1 });
      var type = "text-input";
      var widgetProps = uiLibrary[type][0];
      widgetProps.type = type;
      widgetProps.attribs.placeholder = "Username...";
      widgetProps.layout = {
          top   : coordinates.topLeft.y,
          left  : coordinates.topLeft.x,
          width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
          height: 4
      };

      var widget = new WidgetModel(widgetProps);
      self.get('uielements').push(widget);

      var coordinates = iui.unite({x: 1,
                                   y: 5 },
                                  {x: self.get('layout').get('width') + 1,
                                   y: 5 });
      var type = "password";
      var widgetProps = uiLibrary['password'][0];
      widgetProps.type = type;
      widgetProps.attribs.placeholder = "Password...";
      widgetProps.layout = {
          top   : coordinates.topLeft.y,
          left  : coordinates.topLeft.x,
          width : coordinates.bottomRight.x - coordinates.topLeft.x -1,
          height: 4
      };
      console.log(self);
      widgetProps.attribs.value = 'Add ' + this.get('container_info').entity.get('name');
      var widget = new WidgetModel(widgetProps);
      self.get('uielements').push(widget);
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