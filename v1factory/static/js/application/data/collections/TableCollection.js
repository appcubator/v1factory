define([
  'backbone',
  'models/TableModel'
],
function(Backbone,
         TableModel) {

  var TableCollection = Backbone.Collection.extend({
    model: TableModel,

    // todo
    getTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
    }
  });

  return TableCollection;
});
