define([
  'backbone',
  'mixins/BackboneModal',
  'app/models/FormFieldModel',
  'app/templates/FormEditorTemplates',
  'jquery-ui'
],
function(Backbone, FormFieldModel) {

  var FormEditorView = Backbone.ModalView.extend({
    tagName: 'div',
    width: 882,
    height: 500,
    padding: 0,
    className: 'form-editor',

    events: {
      'change  .field-name-box'          : 'fieldBoxChanged',
      'click   .field-li-item'           : 'clickedField',
      'change  .field-type'              : 'changedFieldType',
      'keydown .field-placeholder-input' : 'changedPlaceholder',
      'keydown input.field-label-input'  : 'changedLabel',
      'keyup   .field-placeholder-input' : 'changedPlaceholder',
      'keyup   input.field-label-input'  : 'changedLabel',
      'keyup  .options-input'            : 'changedOptions',
      'change .goto'                     : 'changedGoto',
      'change .form-type-select'         : 'changedFormAction',
      'change .belongs-to'               : 'changedBelongsTo'
    },

    initialize: function(formModel, entityModel, callback) {
      _.bindAll(this, 'render',
                      'fieldBoxChanged',
                      'fieldAdded',
                      'fieldRemoved',
                      'changedGoto',
                      'selectedNew',
                      'changedFieldType',
                      'renderField',
                      'reRenderFields',
                      'clickedField',
                      'changedPlaceholder',
                      'changedLabel',
                      'changedOrder',
                      'changedFormAction',
                      'findPossibleOwners',
                      'changedBelongsTo');

      this.model = formModel;
      this.entity = entityModel;

      this.model.get('fields').bind('add', this.fieldAdded);
      this.model.get('fields').bind('remove', this.fieldRemoved);
      this.model.bind('change:action', this.reRenderFields);


      this.render();

      if(this.model.get('fields').models.length > 0) {
        this.selectedNew(_.last(this.model.get('fields').models));
      }

      this.callback = callback;
    },

    render : function(text) {
      var self = this;

      var temp_context = {};
      temp_context.form = self.model;
      temp_context.entity = self.entity;
      temp_context.pages = appState.pages;
      temp_context.possibleEntities = this.findPossibleOwners();

      var html = _.template(FormEditorTemplates.template, temp_context);
      this.el.innerHTML = html;

      $('.form-fields-list').sortable({
        stop: this.changedOrder
      });
      return this;
    },

    reRenderFields: function() {
      var self = this;
      _(self.model.get('fields').models).each(function(field) {
        var value = "";
        if(self.model.get('action') == "edit"){ value = "{{" + self.entity.get('name') + "_" + field.get('name') +"}}"; }
        self.$el.find('#field-' + field.cid).html('<label>' + field.get('label') + '<br>' + _.template(FieldTypes[field.get('displayType')], {field: field, value: value}) + '</label>');
      });
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
      var self = this;
      var html = _.template(FormEditorTemplates.field, { field: fieldModel, form: self.model, entity: self.entity});
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
      var cid = String(e.target.id||e.target.parentNode.id||e.target.parentNode.parentNode.id).replace('field-','');
      var fieldModel = this.model.get('fields').get(cid);
      this.selectedNew(fieldModel);
    },

    renderField: function() {
      var self = this;
      var field = this.selected;

      var value = "";
      if(self.model.get('action') == "edit"){ value = "{{" + self.entity.get('name') + "_" + field.get('name') +"}}"; }

      this.$el.find('#field-' + field.cid).html('<label>' + field.get('label') + '<br>' + _.template(FieldTypes[field.get('displayType')], {field: field, value: value}) + '</label>');
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
          this.$el.find('.field-types').append('<span class="options-input-area">Options<br><input class="options-input" placeholder="E.g. Cars,Birds,Trains..." type="text" value="' + curOptions + '"></span>');
        }
      }
    },

    changedPlaceholder: function(e) {
      this.selected.set('placeholder', e.target.value);
      e.stopPropagation();
    },

    changedLabel: function(e) {
      this.selected.set('label', e.target.value);
      e.stopPropagation();
    },

    changedOptions: function(e) {
      var options = String(this.$el.find('.options-input').val()).split(',');
      this.selected.set('options', options);
      e.stopPropagation();
    },

    changedOrder:function(e, ui) {
      var sortedIDs = $( '.form-fields-list' ).sortable( "toArray" );
      for(var ii = 0; ii < sortedIDs.length; ii++) {
        var cid = sortedIDs[ii].replace('field-','');
        var elem = this.model.get('fields').get(cid);
        this.model.get('fields').remove(elem);
        this.model.get('fields').push(elem);
      }
    },

    changedGoto: function(e) {
      var page_val = '{{' + $(e.target).val() + '}}';
      this.model.set('goto', page_val);
    },

    changedFormAction: function(e) {
      this.model.set('action', e.target.value);
    },

    changedBelongsTo: function(e) {
      this.model.set('belongsTo', e.target.value);
    },

    findPossibleOwners: function() {
      var self = this;
      var fields = [];
      _(appState.entities).each(function(entity) {
        _(entity.fields).each(function(field) {
          if(field.type  == '{{' + self.entity.get('name') + '}}') {
            var str = '{{'+entity.name+'.'+field.name+'}}';
            fields.push(str);
          }
        });
      });

      return fields;
    }
  });

  return FormEditorView;
});