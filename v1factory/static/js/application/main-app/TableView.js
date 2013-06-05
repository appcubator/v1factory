define([
  'models/FieldModel',
  'app/UploadExcelView',
  'app/ShowDataView',
  'app/templates/TableTemplates',
  'prettyCheckable'
],
function(FieldModel, UploadExcelView, ShowDataView) {

  var TableView = Backbone.View.extend({
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


    initialize: function(tableModel){
      _.bindAll(this);
      this.model  = tableModel;
      this.listenTo(this.model.get('fields'), 'add', this.appendField);
      this.listenTo(this.model.get('fields'), 'remove', this.removeField);

      this.otherEntities = _(this.entities.pluck('name')).without(this.model.get('name'));
      this.userRoles = v1State.get('users').pluck('role');
    },

    render: function() {
      var self = this;
      this.el.innerHTML= _.template(EntitiesTemplates.Table, self.model.toJSON());

      this.renderProperties();

      iui.loadCSS('prettyCheckable');
      this.$el.find('input[type=checkbox]').prettyCheckable();
      this.adjustTableWidth();
      return this;
    },

    renderProperties: function() {
      this.model.get('fields').each(this.appendField);
    },

    clickedAddProperty: function(e) {
      $('.add-property-button', this.el).hide();
      $('.add-property-form', this.el).fadeIn();
      $('.property-name-input', this.el).focus();
    },

    propertyFormSubmitted: function(e) {
      var name = $('.property-name-input', e.target).val();

      if(!name.length) return;

      var newField = new FieldModel({ name: name });
      this.model.get('fields').push(newField);

      $('.property-name-input', e.target).val('');
      $(e.target).hide();
      this.$el.find('.add-property-button').fadeIn();

      e.preventDefault();
    },

    appendField: function (fieldModel) {
      var page_context = {};
      page_context = _.clone(fieldModel.attributes);
      page_context.cid = fieldModel.cid;
      page_context.entityName = this.model.get('name');
      page_context.entities = this.userRoles.concat(this.otherEntities);
      var template = _.template(EntitiesTemplates.Property, page_context);

      this.$el.find('.property-list').append(template);
    },

    removeField: function(fieldModel) {

    },

    changedAttribs: function(e) {
      var props = String(e.target.id).split('-');
      var cid = props[1];
      var attrib = props[0];
      var value = e.target.options[e.target.selectedIndex].value||e.target.value;
      this.model.get('fields').get(cid).set(attrib, value);
    },

    clickedDelete: function(e) {
      v1State.get('entities').remove(this.model.cid);
      this.remove();
    },

    clickedPropDelete: function(e) {
      var cid = String(e.target.id||e.target.parentNode.id).replace('delete-','');
      this.model.get('fields').remove(cid);
      $('#column-' + cid).remove();
    },

    clickedUploadExcel: function(e) {
      new UploadExcelView(this.model);
    },

    changedRequiredField: function(e) {
      var fieldCid = String(e.target.id).replace('checkbox-field-','');
      var isRequired = e.target.checked;
      this.model.get('fields').get(fieldCid).set('required', isRequired);
    },

    showData: function(e) {
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/entities/fetch_data/',
        data: {
          model_name : this.model.get('name')
        },
        success: function(data) { new ShowDataView(data); },
        dataType: "JSON"
      });
    },

    adjustTableWidth: function() {
      var width = (this.model.get('fields').length + 3) * 94;
      this.width = width;
      this.$el.find('.tbl').css('width', width);
      if(width > 870 && !this.hasArrow) {
        this.hasArrow = true;
        var div = document.createElement('div');
        div.className = 'right-arrow';
        this.$el.find('.description').append(div);
      }
    }

  });

  return TableView;
});
