/*
 *  Widget Editor
 *  Written by icanberk
 *
 *  Abstract:
 *  This module controls the entities page.
 *
 *  Includes:
 *  - EntityModel
 *  - EntityCollection
 *  - EntityView
 *  - EntityListView
 *  - EntitiesEditorView
 *  - EntitiesLibraryView
 */

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
    'click .prop-cross'          : 'clickedPropDelete'
  },


  initialize: function(item, name){
    _.bindAll(this, 'render',
                    'appendField',
                    'clickedAdd',
                    'formSubmitted',
                    'changedAttribs',
                    'addedEntity',
                    'clickedDelete',
                    'modelRemoved',
                    'clickedPropDelete');

    this.model = item;
    this.model.bind('change:owns', this.ownsChangedOutside);
    this.model.bind('change:belongsTo', this.belongsToChangedOutside);

    this.parentCollection = item.collection;
    this.parentCollection.bind('add', this.addedEntity);
    this.parentCollection.bind('remove', this.modelRemoved);

    this.name = item.get('name');
    this.parentName = name;

    this.model.get('fields').bind('add', this.appendField);
    this.render();
  },


  render: function() {
    var self = this;
    var page_context = { name: self.name,
                         attribs: self.model.get('fields').models,
                         other_models: self.parentCollection.models };

    var template = _.template($("#template-entity").html(), page_context);
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
      var template = _.template( $("#template-property").html(), { name: fieldModel.get('name'),
                                                                 cid : fieldModel.cid,
                                                                 other_models: entityEditor.collection.models});
      this.$el.find('.property-list').append(template);
  },

  changedAttribs: function(e) {
    var ind = String(e.target.id).replace('prop-', '');
    this.model.attributes.fields[ind].type = e.target.options[e.target.selectedIndex].value;
    //this.model.set(e.target.id, e.target.options[e.target.selectedIndex].value);
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
    var cid = String(e.target.id).replace('delete-','');
    this.model.get('fields').remove(cid);
    $(e.target.parentNode).remove();
  }
});


var UserEntityView = EntityView.extend({
  el : document.getElementById('user-entity'),

  events: {
    'change .cb-login' : 'checkedBox',
    'click .add-property-button' : 'clickedAdd',
    'submit .add-property-form'  : 'formSubmitted',
    'click .prop-cross'          : 'clickedPropDelete'
  },

  initialize: function(userEntityModel) {
    _.bindAll(this, 'render',
                    'appendField',
                    'clickedAdd',
                    'checkedBox',
                    'formSubmitted',
                    'changedAttribs',
                    'addedEntity',
                    'clickedDelete',
                    'modelRemoved',
                    'clickedPropDelete');

    this.model = userEntityModel;
    this.name = userEntityModel.get('name');

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
      page_context.cid = fieldModel.cid;
      page_context.other_models = appState.entities;

      var template = _.template($("#template-property").html(), page_context);
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
    page_context.other_models = entityEditor.collection.models;

    var template = _.template( $("#template-property").html(), page_context);

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
  }
});


var EntityListView = Backbone.View.extend({
  el         : $('#entities'),

  initialize: function(entitiesColl) {
    _.bindAll(this, 'render', 'appendItem', 'addEntity');

    var self = this;
    var initialEntities = appState.entities || [];

    this.render();

    this.collection = entitiesColl;
    this.collection.bind("add", this.appendItem);
    this.collection.add(initialEntities);

    this.userModel = new UserEntityModel(appState.users);
    new UserEntityView(this.userModel);

  },

  render: function(){

  },

  appendItem: function(entityModel) {
    var entityView = new EntityView(entityModel, 'entity-list-');
    this.el.appendChild(entityView.el);
  },

  addEntity: function(item) {
    var newModel = new EntityModel(item);
    this.collection.add(newModel);
  }
});


var EntitiesEditorView = Backbone.View.extend({
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
    //this.entityLibrary = new EntitiesLibraryView();
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


var EntitiesLibraryView = Backbone.View.extend({
  el: $('#entities-library'),
  collection: null,
  entities: [ ],
  counter: 0,
  initialize: function(){
    _.bindAll(this, 'render', 'appendItem', 'addEntity');
    self = this;
    _(entitiesLibrary).each(function(entity) {
      entity.id = self.counter;
      self.counter++;
    });

    this.collection = new EntityCollection(entitiesLibrary);
    this.render();
  },

  render: function(){
    var self = this;
    _(this.collection.models).each(function(item) {
      self.appendItem(item);
    });
  },

  appendItem: function(item) {
    var entityView = new EntityView(item, 'entity-library-');
    this.entities.push(entityView);
    $(this.el).append(entityView.el);
    $('.add-property-button', entityView.el).on('click', entityView.clickedAdd);
  },

  addEntity: function(item) {
    this.collection.add(item);
  }
});
