define([
  'editor/EditorGalleryView',
  'collections/ElementCollection'
],
function(EditorGalleryView, ElementCollection) {

  var RowGalleryView = EditorGalleryView.extend({
    el       : null,
    tagName  : 'ul',
    // allList  : iui.get('elements-list item-gallery'),
    events : {
    },

    initialize: function(rowModel, entityModel){
      this.entity = entityModel;
      this.row = rowModel;
      this.widgetsCollection = this.row.get('uielements');
      this.editorContext = "loop";

      _.bindAll(this, 'render', 'dropped', 'renderContextEntity');
      this.allList = this.el;

      RowGalleryView.__super__.initialize.call(this, rowModel.get('uielements'));

    },

    render: function() {
      // Basic UI Elements
      // Context Entity Elements and Update Forms
      var self = this;
      this.allList = this.el;

      this.renderUIElementList();
      this.renderContextEntity();

      this.$el.find('li:not(.ui-draggable)').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
      this.$el.find('li').on('click', self.dropped);
      return this;
    },

    renderContextEntity : function() {
      // Form, Data elements belonging to the entity
      var self = this;

      var tempLi = ['<li class="context-entity" id="context-field-<%= entity_id %>-<%= field_id %>">',
                      '<span class="plus-icon"></span>',
                      '<span class="wide-text"><%= entity_name %> <%= field_name %></span>',
                    '</li>'].join('\n');

      var entityName = self.entity.get('name');
      var entityId = self.entity.cid;
      var context = {entity_id : entityId, entity_name : entityName};
      //$(self.allList).append(_.template(tempLiForm, context));

      _(self.entity.get('fields').models).each(function(field) {
        var context = { entity_id : entityId, entity_name : entityName,
                        field_id : field.cid, field_name: field.get('name') };
        $(self.allList).append(_.template(tempLi, context));
      });
    }
  });

  return RowGalleryView;
});

