define([
  'app/models/LayoutModel',
  'backbone'
], function(LayoutModel, Backbone) {

  var RowModel = Backbone.Model.extend({

    initialize: function(bone) {
      this.set('isListOrGrid', "list");
      this.set('layout', new LayoutModel({height:10, width: 4}));
      this.set('uielements', new WidgetsCollection());
    }

  });

  return RowModel;
});