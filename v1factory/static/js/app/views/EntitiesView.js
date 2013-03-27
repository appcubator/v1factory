define([
  'app/models/EntityModel',
  'app/models/UserEntityModel',
  'app/models/FieldModel',
  'app/views/UploadExcelView',
  'app/views/EntityView',
  'app/collections/EntityCollection',
  'backbone',
  'jquery-ui'
],

function(EntityModel,
         UserEntityModel,
         FieldModel,
         UploadExcelView,
         EntityView,
         EntityCollection) {

    var UserEntityView = EntityView.extend({
      el : document.getElementById('user-entity'),

      events: {
        'change .cb-login' : 'checkedBox',
        'click .add-property-button' : 'clickedAdd',
        'submit .add-property-form'  : 'formSubmitted',
        'click .prop-cross'          : 'clickedPropDelete',
        'change .attribs'            : 'changedAttribs'
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

        this.model = userEntityModel;
        this.name = userEntityModel.get('name');
        this.entitiesColl = entitiesColl;

        this.model.get('fields').bind('add', this.appendField);
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


    var EntityListView = Backbone.View.extend({
      el         : $('#entities'),

      initialize: function(entitiesColl) {
        _.bindAll(this, 'render', 'appendItem');

        var self = this;
        var initialEntities = appState.entities || [];

        this.render();

        this.collection = entitiesColl;
        this.collection.bind("add", this.appendItem);
        this.collection.add(initialEntities);

        this.userModel = new UserEntityModel(appState.users);
        new UserEntityView(this.userModel, this.collection);

        this.collection.trigger('initialized');
      },

      render: function(){

      },

      appendItem: function(entityModel) {
        var entityView = new EntityView(entityModel, 'entity-list-', this.collection);
        this.el.appendChild(entityView.el);
      }
    });


    var EntitiesView = Backbone.View.extend({
      el        : document.body,
      addButton : $('#add-entity-button'),
      addForm   : $('#add-entity-form'),

      events : {
        'click #save-entities'     : 'saveEntities',
        'click #add-entity-button' : 'clickedAdd',
        'submit #add-entity-form'  : 'formSubmitted'
      },

      initialize: function() {
        _.bindAll(this, 'render',
                        'clickedAdd',
                        'formSubmitted',
                        'saveEntities');

        this.collection = new EntityCollection();
        this.entityList = new EntityListView(this.collection);
      },

      render : function() {

      },

      clickedAdd: function(e) {
        var newForm = this.addForm.clone();
        $(newForm).appendTo('#entities');
        $(newForm).fadeIn();
        $(this.addButton).hide();
        $('#entity-name-input').focus();
      },

      formSubmitted: function(e) {
        e.preventDefault();

        var elem = {};
        elem.name = $('#entity-name-input').val();
        elem.fields = [];
        this.collection.add(elem);

        $('#entity-name-input').val('');
        $(this.addButton).fadeIn();
        $(e.target).remove();
      },

      saveEntities : function(e) {
        appState.entities = this.collection.toJSON();
        appState.users = this.entityList.userModel.toJSON();

        $.ajax({
          type: "POST",
          url: '/app/'+appId+'/state/',
          data: JSON.stringify(appState),
          success: function() { },
          dataType: "JSON"
        });
      }
    });

    return EntitiesView;

});
