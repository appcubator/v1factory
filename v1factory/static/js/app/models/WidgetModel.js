define(
[
  'app/models/ContentModel',
  'app/models/LayoutModel',
  'app/collections/PageCollection',
  'dicts/constant-containers'
],
function(ContentModel, LayoutModel, PageCollection) {

  var WidgetModel = Backbone.Model.extend({
    selected: false,

    defaults: {
      'container_info' : null,
      'deletable' : true
    },

    initialize: function(bone) {
      console.log(this.cid);
      var self = this;
      _.bindAll(this, 'select', 'isFullWidth');

      this.set('content_attribs', new ContentModel(this.get('content_attribs')));
      this.set('layout', new LayoutModel(this.get('layout')));
      this.set('selected', false);
      this.set('context', bone.context);
    },

    select: function() {
      this.collection.select(this);
    },

    remove :function() {
      if(this.get('deletable') === false) return;
      if(this.collection) {
        this.collection.remove(this);
      }
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

    getListOfPages: function() {
      var pagesCollection = v1State.get('pages');

      if(this.get('context') === "") {
        return pagesCollection.getContextFreePages();
      }

      var listOfLinks = pagesCollection.getPagesWithEntityName(this.get('context'));
      return listOfLinks;
    }

  });

  return WidgetModel;
});
