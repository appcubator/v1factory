define([
  'models/FieldModel',
  'app/UploadExcelView',
  'app/ShowDataView',
  'app/templates/EntitiesTemplates',
  'prettyCheckable'
],
function(FieldModel, UploadExcelView, ShowDataView) {

  var UserTableView = TableView.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span64 entity',

    events : {
      'click .add-property-button' : 'clickedAddProperty',
      'submit .add-property-form'  : 'propertyFormSubmitted',
      'change .attribs'            : 'changedAttribs',
      'click  .delete'             : 'clickedDelete',
      'click .prop-cross'          : 'clickedPropDelete',
      'click .excel'               : 'clickedUploadExcel',
      'click .show-data'           : 'showData',
      'click .edit-form'           : 'clickedEditForm',
      'change .attrib-required-check' : 'changedRequiredField'
    },


    initialize: function(userTableModel){
      _.bindAll(this);
      this.model  = userTableModel;
      this.listenTo(this.model.get('fields'), 'add', this.appendField);
      this.listenTo(this.model.get('fields'), 'remove', this.removeField);

      this.tables= v1State.get('tables').pluck('name');
      this.otherUserRoles = _(v1State.get('users').pluck('role')).without(this.model.get('role'));
    },

    render: function() {
      var self = this;
      this.el.innerHTML= _.template(EntitiesTemplates.UserTable, self.model.toJSON());

      this.renderProperties();

      iui.loadCSS('prettyCheckable');
      this.$el.find('input[type=checkbox]').prettyCheckable();
      this.adjustTableWidth();
      return this;
    }

  });

  return UserTableView;
});
