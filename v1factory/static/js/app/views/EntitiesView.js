define([
  '../models/EntityModel',
  '../models/UserEntityModel',
  '../models/FieldModel',
  './UploadExcelView',
  'backbone',
  'jquery-ui'
],

function(EntityModel, UserEntityModel, FieldModel, UploadExcelView) {

  var EntityCollection = Backbone.Collection.extend({
    model: EntityModel
  });


  var EntityView = Backbone.View.extend({
    el         : null,
    tagName    : 'li',
    collection : null,
    parentName : "",
    className  : 'span64 entity',

    events : {
      'click .add-property-button' : 'clickedAdd',
      'submit .add-property-form'  : 'formSubmitted',
      'change .attribs'            : 'changedAttribs',
      'click #cross'               : 'clickedDelete',
      'click .prop-cross'          : 'clickedPropDelete',
      'click .upload-excel'        : 'clickedUploadExcel'
    },


    initialize: function(item, name, entitiesColl){
      _.bindAll(this, 'render',
                      'doBindings',
                      'appendField',
                      'clickedAdd',
                      'formSubmitted',
                      'changedAttribs',
                      'addedEntity',
                      'clickedDelete',
                      'modelRemoved',
                      'clickedPropDelete',
                      'clickedUploadExcel');

      this.model = item;
      this.model.bind('change:owns', this.ownsChangedOutside);
      this.model.bind('change:belongsTo', this.belongsToChangedOutside);

      this.parentCollection = item.collection;
      this.parentCollection.bind('initialized', this.doBindings);

      this.name = item.get('name');
        this.parentName = name;

        console.log(this.model.get('fields'));
        this.model.get('fields').bind('add', this.appendField);
        this.render();
      },

      doBindings: function() {
        this.parentCollection.bind('add', this.addedEntity);
        this.parentCollection.bind('remove', this.modelRemoved);
      },

      render: function() {
        var self = this;
        console.log(self.parentCollection.models);

        var page_context = { name: self.name,
                             attribs: self.model.get('fields').models,
                             other_models: self.parentCollection.models };

        var template = _.template(Templates.Entity, page_context);
        $(this.el).append(template);
      },


      clickedAdd: function(e) {
        $('.add-property-button', this.el).hide();
        $('.add-property-form', this.el).fadeIn();
        $('.property-name-input', this.el).focus();
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

      appendField: function (fieldModel) {
        var self = this;
        console.log(self.parentCollection.models);

        var template = _.template( Templates.Property, {  name: fieldModel.get('name'),
                                                          cid : fieldModel.cid,
                                                          type: fieldModel.get('type'),
                                                          entityName : self.model.get('name'),
                                                          other_models: self.parentCollection.models});

        this.$el.find('.property-list').append(template);
      },

      changedAttribs: function(e) {
        var props = String(e.target.id).split('-');
        var cid = props[1];
        var attrib = props[0];
        //var value = 
        this.model.get('fields').get(cid).set(attrib, e.target.options[e.target.selectedIndex].value||e.target.value);
      },

      addedEntity: function(item) {
        $('.attribs', this.el).append('<option value="{{'+item.get('name')+'}}">List of '+ item.get('name') + 's</option>');
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

      clickedUploadExcel: function(e) {
        new UploadExcelView();
      }
    });


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
        appState.entities = this.entityList.collection.toJSON();
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
