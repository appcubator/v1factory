define([
  'backbone',
  'app/models/FieldModel',
  'app/models/FormModel',
  'app/views/FormEditorView'
],
function(Backbone, FieldModel, FormModel, FormEditorView) {

  var EntityView = Backbone.View.extend({
    el         : null,
    tagName    : 'li',
    collection : null,
    parentName : "",
    className  : 'span64 entity',

    events : {
      'click .add-property-button' : 'clickedAdd',
      'click .add-form-button'     : 'clickedAddForm',
      'submit .add-property-form'  : 'formSubmitted',
      'submit .add-form-form'      : 'formFormSubmitted',
      'change .attribs'            : 'changedAttribs',
      'click #cross'               : 'clickedDelete',
      'click .prop-cross'          : 'clickedPropDelete',
      'click .remove-form'         : 'clickedFormRemove',
      'click .upload-excel'        : 'clickedUploadExcel',
      'click .show-data'           : 'showData',
      'click .edit-form'           : 'clickedEditForm'
    },


    initialize: function(item, name, entitiesColl){
      _.bindAll(this, 'render',
                      'doBindings',
                      'appendField',
                      'appendForm',
                      'clickedAdd',
                      'formSubmitted',
                      'formFormSubmitted',
                      'changedAttribs',
                      'addedEntity',
                      'clickedDelete',
                      'modelRemoved',
                      'clickedPropDelete',
                      'clickedUploadExcel',
                      'clickedFormRemove',
                      'clickedEditForm',
                      'showData');

      this.model = item;
      this.model.bind('change:owns', this.ownsChangedOutside);
      this.model.bind('change:belongsTo', this.belongsToChangedOutside);

      this.parentCollection = item.collection;
      this.parentCollection.bind('initialized', this.doBindings);

      this.name = item.get('name');
      this.parentName = name;

      this.model.get('fields').bind('add', this.appendField);
      this.model.get('forms').bind('add', this.appendForm);
      this.render();
    },

    doBindings: function() {
      this.parentCollection.bind('add', this.addedEntity);
      this.parentCollection.bind('remove', this.modelRemoved);
    },

    render: function() {
      var self = this;
      var page_context = { name: self.name,
                           attribs: self.model.get('fields').models,
                           other_models: self.parentCollection.models,
                           forms: self.model.get('forms').models };

      var template = _.template(Templates.Entity, page_context);
      $(this.el).append(template);
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

      var curFields = this.model.get('fields') || [];

      curFields.add(new FieldModel({
        name: name,
        type: 'text',
        required: true
      }));

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

      var template = _.template( Templates.Property, {  name: fieldModel.get('name'),
                                                        cid : fieldModel.cid,
                                                        type: fieldModel.get('type'),
                                                        entityName : self.model.get('name'),
                                                        other_models: self.parentCollection.models});

      this.$el.find('.property-list').append(template);
    },

    appendForm: function(formModel) {
      var self = this;
      var template = _.template(Templates.Form, { form: formModel});
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
      this.parentCollection.remove(this.model.cid);
    },

    modelRemoved: function(model) {
      if (model == this.model) {
        this.remove();
      }
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
      new UploadExcelView();
    },

    clickedEditForm: function(e) {
      var cid = String(e.target.id).replace('edit-', '');
      var formModel = this.model.get('forms').get(cid);
      new FormEditorView(formModel, this.model);
    },

    showData: function(e) {
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/entities/fetch_data/',
        data: {
          model_name : this.model.get('name')
        },
        success: function(data) { console.log(data.responseText); },
        dataType: "JSON"
      });
    }
  });

  return EntityView;
});