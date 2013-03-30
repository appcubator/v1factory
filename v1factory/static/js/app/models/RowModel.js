define([
  'app/models/LayoutModel',
  'app/collections/WidgetCollection',
  'backbone'
], function(LayoutModel, WidgetCollection, Backbone) {

  var RowModel = Backbone.Model.extend({

    initialize: function(bone) {
      this.set('isListOrGrid', "list");
      this.set('layout', new LayoutModel({height:10, width: 4}));
      this.set('uielements', new WidgetCollection());

      if(bone.uielements) {
        this.get('uielements').add(bone.uielements);
      }
    }

  });

  return RowModel;
});