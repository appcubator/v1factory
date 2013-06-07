define([
  'models/TableModel'
],
function(TableModel) {

  var TableCollection = Backbone.Collection.extend({
    model: TableModel,

    getTableWithName: function(tableNameStr) {
      var table = this.where({name : tableNameStr })[0];
      return table;
    },

    getRelationsWithName: function(tableNameStr) {
      var arrFields = [];
      this.each(function(table) {
        if(table.get('name') == tableNameStr) return;
        table.get('fields').each(function(fieldModel) {
          if(fieldModel.has('entity_name') && fieldModel.get('entity_name') == tableNameStr) {
            var obj = fieldModel.toJSON();
            obj.entity = table.get('name');
            obj.entity_cid = table.cid;
            arrFields.push(obj);
          }
        });
      });

      return arrFields;
    }
  });

  return TableCollection;
});
