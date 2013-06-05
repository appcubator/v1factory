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

  var TableView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span64 entity',

    events : {
      'click .tab'                 : 'clickedNavItem',
      'click .add-property-button' : 'clickedAddProperty',
      'submit .add-property-form'  : 'formSubmitted',
      'change .attribs'            : 'changedAttribs',
      'click  .delete'             : 'clickedDelete',
      'click .prop-cross'          : 'clickedPropDelete',
      'click .excel'               : 'clickedUploadExcel',
      'click .show-data'           : 'showData',
      'click .edit-form'           : 'clickedEditForm',
      'change .attrib-required-check' : 'changedRequiredField'
    },


    initialize: function(options){
      _.bindAll(this);

      this.parentName = options.name || "Parent Name";
      this.tables = v1State.get('tables');
      this.listenTo(this.tables, 'add remove', this.renderNav);

      if(options.model) {
        this.setModel(options.model);
      }
    },

    render: function() {
      var self = this;
      var template = _.template(EntitiesTemplates.Table, self.model.toJSON());
      $(this.el).html(template);

      this.renderProperties();
      this.renderNav();

      iui.loadCSS('prettyCheckable');
      this.$el.find('input[type=checkbox]').prettyCheckable();
      this.adjustTableWidth();
      return this;
    },

    renderProperties: function() {
      this.model.get('fields').each(this.appendField);
    },

    renderNav: function() {
      console.log('rendering nav');
      var $nav = this.$('.entity-nav');
      var htmlString = '';
      this.tables.each(function (entity) {
        var active = "";
        if(this.model && role.cid === this.model.cid) {
          active = ' active';
        }
        htmlString += '<li class="tab'+active+'" id="navtab-'+ entity.cid +'"><a href="#">' + entity.get('name') + '</a></li>';
      });
      $nav.html(htmlString);
      if(this.model) {
        $nav.find('#navtab-' + this.model.cid).addClass('active');
      }
    },

    clickedNavItem: function(e) {
      var cid = (e.currentTarget.id).replace('navtab-','');
      var model = this.tables.get(cid);
      this.setModel(model);
      this.render();
    },

    clickedAddProperty: function(e) {
      $('.add-property-button', this.el).hide();
      $('.add-property-form', this.el).fadeIn();
      $('.property-name-input', this.el).focus();
    },

    formSubmitted: function(e) {
      console.log('form submitted');
      console.trace();

      var name = $('.property-name-input', this.el).val();

      if(name.length !== 0) {
        console.log(this.model);
        this.model.get('fields').push(new FieldModel({
          name: name,
          type: 'text',
          required: false
        }));
      }

      $('.property-name-input', this.el).val('');
      $('.add-property-form', this.el).hide();
      $('.add-property-button', this.el).fadeIn();

      e.preventDefault();
    },

    appendField: function (fieldModel) {
      var page_context = {};
      page_context = _.clone(fieldModel.attributes);
      page_context.cid = fieldModel.cid;
      page_context.entityName = this.model.get('name');
      page_context.tables = this.userRoles.concat(this.otherEntities)
      var template = _.template(EntitiesTemplates.Property, page_context);

      this.$el.find('.property-list').append(template);
    },

    changedAttribs: function(e) {
      var props = String(e.target.id).split('-');
      var cid = props[1];
      var attrib = props[0];
      var value = e.target.options[e.target.selectedIndex].value||e.target.value;
      this.model.get('fields').get(cid).set(attrib, value);
    },

    addedTable: function(item) {
      var optString = '<option value="{{'+item.get('name')+'}}">List of '+ item.get('name') + 's</option>';
      $('.attribs', this.el).append(optString);
    },

    clickedDelete: function(e) {
      v1State.get('tables').remove(this.model.cid);
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
        url: '/app/'+appId+'/tables/fetch_data/',
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
      console.log("BIND:" + model.cid);
      this.listenTo(this.model.get('fields'), 'add remove', this.appendField);
      this.userRoles = v1State.get('users').pluck('role');
      this.otherEntities = _(this.tables.pluck('name')).without(this.model.get('name'));
      return this;
    }
  });

  return TableView;
});
