define([
  'models/FieldModel',
  'models/FormModel',
  'app/FormEditorView',
  'app/UploadExcelView',
  'app/ShowDataView',
  'app/templates/EntitiesTemplates',
  'prettyCheckable'
],
function(FieldModel, FormModel, FormEditorView, UploadExcelView, ShowDataView) {

  var EntityView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span64 entity',

    events : {
      'click .add-property-button' : 'clickedAdd',
      'click .add-form-button'     : 'clickedAddForm',
      'submit .add-property-form'  : 'formSubmitted',
      'submit .add-form-form'      : 'formFormSubmitted',
      'change .attribs'            : 'changedAttribs',
      'click  .delete'             : 'clickedDelete',
      'click .prop-cross'          : 'clickedPropDelete',
      'click .remove-form'         : 'clickedFormRemove',
      'click .excel'               : 'clickedUploadExcel',
      'click .show-data'           : 'showData',
      'click .edit-form'           : 'clickedEditForm',
      'blur  .property-name-input' : 'formSubmitted',
      'change .attrib-required-check' : 'changedRequiredField'
    },


    initialize: function(options){
      _.bindAll(this);

      if(options.model) {
        this.setModel(options.model);
      }

      this.entities = v1State.get('entities');
      this.listenTo(this.entities, 'initialized', this.doBindings);
      this.listenTo(this.entities, 'add', this.addedEntity);

      this.parentName = options.name || "Parent Name";

    },

    render: function() {
      var self = this;
      var page_context = { name: self.model.get('name'),
                           attribs: self.model.get('fields').models,
                           entities: self.entities,
                           forms: null };

                           //forms: self.model.get('forms').models };

      var template = _.template(EntitiesTemplates.Entity, page_context);
      $(this.el).html(template);
      iui.loadCSS('prettyCheckable');
      this.$el.find('input[type=checkbox]').prettyCheckable();
      this.adjustTableWidth();
    },


    clickedAdd: function(e) {
      $('.add-property-button', this.el).hide();
      $('.add-property-form', this.el).fadeIn();
      $('.property-name-input', this.el).focus();
    },

    clickedAddForm: function(e) {
      $('.add-form-button', this.el).hide();
      $('.add-form-form', this.el).fadeIn();
      $('.form-name-input', this.el).focus();
    },

    formSubmitted: function(e) {
      e.preventDefault();
      var name = $('.property-name-input', this.el).val();

      if(name.length !== 0) {

        var curFields = this.model.get('fields') || [];

        curFields.push(new FieldModel({
          name: name,
          type: 'text',
          required: false
        }));
      }

      $('.property-name-input', this.el).val('');
      $('.add-property-form', this.el).hide();
      $('.add-property-button', this.el).fadeIn();
      return false;
    },

    formFormSubmitted: function(e) {
      e.preventDefault();
      var name = $('.form-name-input', this.el).val();

      var curForm = {};
      curForm.name = name;
      var formModel = new FormModel(curForm, this.model);
      this.model.get('forms').add(formModel);

      $('.form-name-input', this.el).val('');
      $('.add-form-form', this.el).hide();
      $('.add-form-button', this.el).fadeIn();
      return false;
    },

    appendField: function (fieldModel) {
      var self = this;

      var page_context = {};
      page_context = _.clone(fieldModel.attributes);
      page_context.cid = fieldModel.cid;
      page_context.entityName = self.model.get('name');
      page_context.entities = self.entities.models;
      var template = _.template(EntitiesTemplates.Property, page_context);

      this.$el.find('.property-list').append(template);
      this.adjustTableWidth();
    },

    appendForm: function(formModel) {
      var self = this;
      var template = _.template(EntitiesTemplates.Form, { form: formModel});
      self.$el.find('.form-list').append(template);
    },

    changedAttribs: function(e) {
      var props = String(e.target.id).split('-');
      var cid = props[1];
      var attrib = props[0];
      var value = e.target.options[e.target.selectedIndex].value||e.target.value;
      this.model.get('fields').get(cid).set(attrib, value);
    },

    addedEntity: function(item) {
      var optString = '<option value="{{'+item.get('name')+'}}">List of '+ item.get('name') + 's</option>';
      $('.attribs', this.el).append(optString);
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

    clickedFormRemove: function(e) {
      e.preventDefault();
      var cid = String(e.target.id||e.target.parentNode.id).replace('remove-', '');
      this.model.get('forms').remove(cid);
      $('#form-'+cid).remove();
    },

    clickedUploadExcel: function(e) {
      new UploadExcelView(this.model);
    },

    clickedEditForm: function(e) {
      var cid = String(e.target.id).replace('edit-', '');
      var formModel = this.model.get('forms').get(cid);
      new FormEditorView(formModel, this.model);
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
    },

    setModel: function(model) {
      this.model = model;
      this.listenTo(this.model, 'change:owns', this.ownsChangedOutside);
      this.listenTo(this.model, 'change:belongsTo', this.belongsToChangedOutside);

      this.listenTo(this.model.get('fields'), 'add', this.appendField);
      this.listenTo(this.model.get('forms'), 'add', this.appendForm);
      return this;
    }
  });

  return EntityView;
});
