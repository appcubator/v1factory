define([
  'models/FieldModel',
  'app/EntityView',
  'app/FormEditorView',
  'app/UploadExcelView',
  'app/ShowDataView',
  'models/UserEntityModel',
  'collections/EntityCollection',
  'tutorial/TutorialView',
  'app/templates/EntitiesTemplates'
],
  function( FieldModel,
            EntityView,
            FormEditorView,
            UploadExcelView,
            ShowDataView,
            UserEntityModel,
            EntityCollection,
            TutorialView) {

    var UserEntityView = EntityView.extend({

      events: {
        'click .tab'                 : 'clickedNavItem',
        'change .cb-login'           : 'checkedBox',
        'click .add-property-button' : 'clickedAdd',
        'submit .add-property-form'  : 'formSubmitted',
        'click .prop-cross'          : 'clickedPropDelete',
        'change .attribs'            : 'changedAttribs',
        'click .remove-form'         : 'clickedFormRemove',
        'click .excel'               : 'clickedUploadExcel',
        'click .show-data'           : 'showData',
        'click .edit-form'           : 'clickedEditForm',
        'click .add-form-button'     : 'clickedAddForm',
        'submit .add-form-form'      : 'formFormSubmitted',
        'blur  .property-name-input' : 'formSubmitted',
        'click .q-mark-circle'        : 'showTutorial',
        'change .attrib-required-check' : 'changedRequiredField'
      },

      initialize: function(options) {
        _.bindAll(this);
        this.el = document.getElementById('user-entity');

        this.userRoles = v1State.get('users');
        this.entities = v1State.get('entities');

        this.model = options.model || this.userRoles.get(0) || new UserEntityModel({role: 'User'});
        this.name = this.model.get('name');

        this.listenTo(this.model.get('fields'), 'add', this.appendField);
        this.listenTo(this.userRoles, 'add remove', this.renderNav);

      },

      render: function() {
        var self = this;
        this.$el.html(_.template(EntitiesTemplates.UserEntity, this.model.toJSON()));
        console.log(this.model);
        _(this.model.get('fields').models).each(function(fieldModel) {
          if(fieldModel.get('name') == 'First Name' ||
             fieldModel.get('name') == 'Last Name'  ||
             fieldModel.get('name') =='Email') return;

          var page_context = {};
          page_context.name = fieldModel.get('name');
          page_context.type = fieldModel.get('type');
          page_context.required = fieldModel.get('required');
          page_context.cid = fieldModel.cid;
          page_context.entityName = "User";
          page_context.other_models = v1State.get('entities').models;

          var template = _.template(EntitiesTemplates.Property, page_context);
          self.$el.find('.property-list').append(template);
        });

        iui.loadCSS('prettyCheckable');
        this.$el.find('input[type=checkbox]').prettyCheckable();
        this.adjustTableWidth();
        this.renderNav();
        return this;
      },

      renderNav: function() {
        var self = this;
        var $nav = this.$('.entity-nav');
        var htmlString = '';
        this.userRoles.each(function (role) {
          var active = "";
          console.log(role.get('role'));
          console.log(self.model.get('role'));
          if(role.cid == self.model.cid) {
            active = ' active';
            console.log('found active role');
          }
          console.log(active);
          htmlString += '<li class="tab'+active+'" id="navtab-'+ role.cid +'"><a href="#">' + role.get('role') + '</a></li>';
        });
        $nav.html(htmlString);
      },

      clickedNavItem: function(e) {
        console.log(e.currentTarget);
        var cid = (e.currentTarget.id).replace('navtab-','');
        console.log(cid);
        var model = this.userRoles.get(cid);
        this.setModel(model);
        this.render();
        $('#navtab-' + cid).addClass('active');
        return false;
      },

      checkedBox: function(e) {
        this.model.set(e.target.value, e.target.checked);
      },

      appendField: function(fieldModel) {
        if(fieldModel.get('name') == 'First Name' ||
           fieldModel.get('name') == 'Last Name'  ||
           fieldModel.get('name') =='Email') return;

        var page_context = {};
        page_context = _.clone(fieldModel.attributes);
        page_context.cid = fieldModel.cid;
        page_context.entityName = "User";
        page_context.other_models = this.entities.models;

        var template = _.template(EntitiesTemplates.Property, page_context);

        $('.property-list', this.el).append(template);
        this.adjustTableWidth();
      },

      formSubmitted: function(e) {
        e.preventDefault();
        var name = $('.property-name-input', this.el).val();

        if(name.length !== 0) {
          this.model.get('fields').add(new FieldModel({
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
      },

      showTutorial: function() {
        new TutorialView([3, 1]);
      },

      adjustTableWidth: function() {
        var width = (this.model.get('fields').length + 4 + 3) * 94;
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

  return UserEntityView;
});
