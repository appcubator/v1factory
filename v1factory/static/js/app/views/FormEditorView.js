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
    height: 500,
    padding: 0,
    className: 'form-editor',

    events: {
      'change .field-name-box' : 'fieldBoxChanged',
      'click .field-li-item'   : 'clickedField',
      'change .field-type'     : 'changedFieldType',
      'keydown .field-placeholder-input' : 'changedPlaceholder',
      'keydown .field-label-input' : 'changedLabel',
      'keydown .options-input' : 'changedOptions'
    },

    initialize: function(formModel, entityModel, callback) {
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

      this.callback = callback;
    },

    render : function(text) {
      var self = this;
      var html = _.template(FormEditorTemplates.template, { form: self.model, entity: self.entity});
      this.el.innerHTML = html;
      $('.form-fields-list').sortable();
      return this;
    },

    fieldBoxChanged: function(e) {
      var self = this;
      if(e.target.checked) {
        var cid = e.target.id.replace('field-', '');
        var fieldModel = self.entity.get('fields').get(cid);
        var formFieldModel = new FormFieldModel({name: e.target.value, displayType: "single-line-text", type: fieldModel.get('type')});

        if(fieldModel.get('type') == "email") {
          formFieldModel.set('displayType', "email-text");
        }
        if(fieldModel.get('type') == "image") {
          formFieldModel.set('displayType', "image-uploader");
        }
        if(fieldModel.get('type') == "date") {
          formFieldModel.set('displayType', "date-picker");
        }


        this.model.get('fields').add(formFieldModel);
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
      this.$el.find('#field-' + field.cid).html('<label>' + field.get('label') + '<br>' + _.template(FieldTypes[field.get('displayType')], {field: field}) + '</label>');
    },

    changedFieldType: function(e) {
      e.preventDefault();
      if(e.target.checked) {
        var newType = e.target.value;
        this.selected.set('displayType', newType);

        var curOptions = (this.$el.find('.options-input').val() || '');
        this.$el.find('.options-input-area').remove();
        if(newType == "option-boxes" || newType == "dropdown") {
          this.selected.set('options', curOptions.split(','));
          this.$el.find('.field-types').append('<span class="options-input-area">Options<br><input class="options-input" type="text" value="' + curOptions + '"></span>');
        }
      }
    },

    changedPlaceholder: function(e) {
      this.selected.set('placeholder', e.target.value);
    },

    changedLabel: function(e) {
      this.selected.set('label', e.target.value);
    },

    changedOptions: function(e) {
      var options = String(this.$el.find('.options-input').val()).split(',');
      this.selected.set('options', options);
    }
  });

  return FormEditorView;
});