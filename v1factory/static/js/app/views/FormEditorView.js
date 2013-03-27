define([
  'backbone',
  'backboneui',
  'app/models/FormFieldModel',
  'app/templates/FormEditorTemplates',
  'jquery-ui'
],
function(Backbone, BackboneUI, FormFieldModel) {

  var FormEditorView = BackboneUI.ModalView.extend({
    tagName: 'div',
    width: 900,
    padding: 0,
    className: 'form-editor',

    events: {
      'change .field-name-box' : 'fieldBoxChanged',
      'click .field-li-item'   : 'clickedField',
      'change .field-type'     : 'changedFieldType',
      'keydown .field-placeholder-input' : 'changedPlaceholder',
      'keydown .field-label-input' : 'changedLabel'
    },

    initialize: function(formModel, entityModel) {
      _.bindAll(this, 'render',
                      'fieldBoxChanged',
                      'fieldAdded',
                      'fieldRemoved',
                      'selectedNew',
                      'changedFieldType',
                      'renderField',
                      'clickedField',
                      'changedPlaceholder',
                      'changedLabel');

      this.model = formModel;
      this.entity = entityModel;

      this.model.get('fields').bind('add', this.fieldAdded);
      this.model.get('fields').bind('remove', this.fieldRemoved);

      this.render();

      if(this.model.get('fields').models.length > 0) {
        this.selectedNew(_.last(this.model.get('fields').models));
      }

    },

    render : function(text) {
      var self = this;
      var html = _.template(FormEditorTemplates.template, { form: self.model, entity: self.entity});
      this.el.innerHTML = html;
      $('.form-fields-list').sortable();
      return this;
    },

    fieldBoxChanged: function(e) {
      if(e.target.checked) {
        var fieldModel = new FormFieldModel({name: e.target.value, type: "single-line-text"});
        this.model.get('fields').add(fieldModel);
      }
      else {
        var removedField = this.model.get('fields').where({ name : e.target.value});
        this.model.get('fields').remove(removedField);
      }
    },

    fieldAdded: function(fieldModel) {
      var html = _.template(FormEditorTemplates.field, { field: fieldModel});
      this.$el.find('.form-fields-list').append(html);
      this.selectedNew(fieldModel);
    },

    fieldRemoved: function(fieldModel) {
      this.$el.find('#field-' + fieldModel.cid).remove();
    },

    selectedNew: function(fieldModel) {
      console.log(fieldModel);
      var html = _.template(FormEditorTemplates.details, {field : fieldModel});
      this.selected = fieldModel;
      this.selected.bind('change', this.renderField);

      this.$el.find('.details-panel').html(html);
      this.$el.find('.selected').removeClass('selected');
      this.$el.find('#field-' + fieldModel.cid).addClass('selected');
    },

    clickedField: function(e) {
      e.preventDefault();
      var cid = String(e.target.id||e.target.parentNode.id).replace('field-','');
      var fieldModel = this.model.get('fields').get(cid);
      this.selectedNew(fieldModel);
    },

    renderField: function() {
      var field = this.selected;
      this.$el.find('#field-' + field.cid).html('<label>' + field.get('label') + '<br>' + _.template(FieldTypes[field.get('type')], {field: field}) + '</label>');
    },

    changedFieldType: function(e) {
      e.preventDefault();
      if(e.target.checked) {
        this.selected.set('type', e.target.value);
      }
    },

    changedPlaceholder: function(e) {
      this.selected.set('placeholder', e.target.value);
    },

    changedLabel: function(e) {
      this.selected.set('label', e.target.value);
    }
  });

  return FormEditorView;
});