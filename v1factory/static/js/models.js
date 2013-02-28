/*
 *  Models
 *  Written by icanberk
 *
 *  Abstract:
 *  Contains all the front-end modules
 *
 *  Includes:
 *  - DesignProperty
 *  - EntityModel
 *  - Widget
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


var Widget = Backbone.Model.extend({
  selected: false,

  defaults: {
    'container_info' : null,
    'context'        : {},
    'lib_id'         : 1,
    'top'            : 0,
    'left'           : 0,
    'height'         : 2,
    'width'          : 2
  },

  initialize: function() {
    _.bindAll(this, 'select', 'assignCoord');
  },

  select: function() {
    if(this.collection){ this.collection.unselectAll()};
    this.collection.selectedElement = this;
    if(pagesView.widgetEditor) {
      pagesView.widgetEditor.selectedElement = this;
    }
    this.set('selected', true);
    widgetInfoView.show(this);
  },

  moveLeft: function() {
    this.set('left', this.get('left') - 1);
  },

  moveRight: function() {
    this.set('left', this.get('left') + 1);
  },

  moveUp: function() {
    this.set('top', this.get('top') - 1);
  },

  moveDown: function() {
    this.set('top', this.get('top') + 1);
  },


  assignCoord: function() {
    var coordinates = currentCoord? pagesView.unite(currentCoord.initCor, currentCoord.lastCor):
                                    pagesView.unite({x: 0, y:2}, {x: 16, y: 10});

    this.set('top', coordinates.topLeft.y + 1);
    this.set('left', coordinates.topLeft.x + 1);
    this.set('width', coordinates.bottomRight.x - coordinates.topLeft.x);
    this.set('height', coordinates.bottomRight.y - coordinates.topLeft.y);
  }
});


var EntityModel = Backbone.Model.extend();


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


var PageModel = Backbone.Model.extend({
  defaults : {
    "name"             : "default-page",
    "design-props"     : [
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
    "access-level" : "all",
    "uielements" : []
  }
});
