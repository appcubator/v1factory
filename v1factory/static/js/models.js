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
    this.set('content', new ContentModel(this.get('content')));
    this.set('layout', new LayoutModel(this.get('layout')));
    this.set('attribs', new AttribsModel(this.get('attribs')));

    _.bindAll(this, 'select', 'assignCoord');
  },

  select: function() {
    this.collection.unselectAll();
    this.collection.selectedEl = this;
    this.set('selected', true);
    //widgetInfoView.show(this);
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
