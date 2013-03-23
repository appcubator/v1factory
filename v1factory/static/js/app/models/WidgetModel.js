define(
 ['./ContentModel',
  './LayoutModel',
  'backboneui',
  'dicts/constant-containers',
  'backbone'],
  function(ContentModel, LayoutModel, QueryModel, BackboneUI) {

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

      _.bindAll(this, 'select', 'assignCoord', 'isFullWidth');
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
    }

  });

  return WidgetModel;
});
