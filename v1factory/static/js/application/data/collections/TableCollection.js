define([
  'models/TableModel'
],
function(TableModel) {

  var TableCollection = Backbone.Collection.extend({
    model: TableModel,

    getTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
    }
  });

  return TableCollection;
});
