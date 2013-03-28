define([
  'backbone',
  'app/models/FieldModel',
  'app/models/FormModel',
  'app/views/EntityView',
  'app/views/FormEditorView',
  'app/views/UploadExcelView',
  'app/collections/EntityCollection'
], 
function(Backbone, FieldModel, FormModel, EntityView, FormEditorView, UploadExcelView, EntityCollection) {

    var UserEntityView = EntityView.extend({
      el : document.getElementById('user-entity'),

      events: {
        'change .cb-login'           : 'checkedBox',
        'click .add-property-button' : 'clickedAdd',
        'submit .add-property-form'  : 'formSubmitted',
        'click .prop-cross'          : 'clickedPropDelete',
        'change .attribs'            : 'changedAttribs',
        'click .remove-form'         : 'clickedFormRemove',
        'click .upload-excel'        : 'clickedUploadExcel',
        'click .show-data'           : 'showData',
        'click .edit-form'           : 'clickedEditForm',
        'click .add-form-button'     : 'clickedAddForm',
        'submit .add-form-form'      : 'formFormSubmitted'
      },

      initialize: function(userEntityModel, entitiesColl) {
        _.bindAll(this, 'render',
                        'appendField',
                        'clickedAdd',
                        'checkedBox',
                        'formSubmitted',
                        'changedAttribs',
                        'addedEntity',
                        'clickedDelete',
                        'modelRemoved',
                        'clickedPropDelete',
                        'changedAttribs');

        this.el = document.getElementById('user-entity');
        this.model = userEntityModel;
        this.name = userEntityModel.get('name');
        this.entitiesColl = entitiesColl;

        this.model.get('fields').bind('add', this.appendField);
        this.model.get('forms').bind('add', this.appendForm, this);

        this.render();
      },

      render: function() {
        var self = this;

        _(this.model.get('fields').models).each(function(fieldModel) {
          if(fieldModel.get('name') == 'First Name' ||
             fieldModel.get('name') == 'Last Name'  ||
             fieldModel.get('name') =='Email') return;

          var page_context = {};
          page_context.name = fieldModel.get('name');
          page_context.type = fieldModel.get('type'),
          page_context.cid = fieldModel.cid;
          page_context.entityName = "User";
          page_context.other_models = (new EntityCollection(appState.entities)).models;

          var template = _.template(Templates.Property, page_context);
          self.$el.find('.property-list').append(template);
        });

        document.getElementById('facebook').checked = this.model.get('facebook');
        document.getElementById('linkedin').checked = this.model.get('linkedin');
        document.getElementById('local').checked = this.model.get('local');

        var formsHtml = '';
        _(self.model.get('forms').models).each(function(form){
          formsHtml += _.template(Templates.Form, {form: form});
        });
        self.$el.find('.form-list').append(formsHtml);
      },

      checkedBox: function(e) {
        this.model.set(e.target.value, e.target.checked);
      },

      appendField: function(fieldModel) {

        if(fieldModel.get('name') == 'First Name' ||
           fieldModel.get('name') == 'Last Name'  ||
           fieldModel.get('name') =='Email') return;

        var page_context = {};
        page_context.name = fieldModel.get('name');
        page_context.cid = fieldModel.cid;
        page_context.type = fieldModel.get('type');
        page_context.entityName = "User";
        page_context.other_models = this.entitiesColl.models;

        var template = _.template(Templates.Property, page_context);

        $('.property-list', this.el).append(template);
      },

      formSubmitted: function(e) {
        e.preventDefault();
        var name = $('.property-name-input', this.el).val();

        this.model.get('fields').add(new FieldModel({
          name: name,
          type: 'text',
          required: true
        }));

        $('.property-name-input', this.el).val('');
        $('.add-property-form', this.el).hide();
        $('.add-property-button', this.el).fadeIn();
        return false;
      },

      clickedPropDelete: function(e) {
        var cid = String(e.target.id||e.target.parentNode.id).replace('delete-','');
        this.model.get('fields').remove(cid);
        $('#column-' + cid).remove();
      },

      changedAttribs: function(e) {
        var props = String(e.target.id).split('-');
        var cid = props[1];
        var attrib = props[0];
        var value = e.target.options[e.target.selectedIndex].value||e.target.value;
        this.model.get('fields').get(cid).set(attrib, value);
      }
    });

  return UserEntityView;
});