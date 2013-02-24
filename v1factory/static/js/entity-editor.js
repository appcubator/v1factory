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


var EntityModel = Backbone.Model.extend();

var EntityCollection = Backbone.Collection.extend({
  model: EntityModel
});

var EntityView = Backbone.View.extend({
  el         : null,
  tagName    : 'li',
  collection : null,
  parentName : "",
  className  : 'offset1 span7 entity',

  events : {
    'click .add-property-button' : 'clickedAdd',
    'submit .add-property-form'  : 'formSubmitted',
    'change .attribs'            : 'changedAttribs',
    'click #cross'               : 'clickedDelete',
    'click #prop-cross'          : 'clickedPropDelete'
  },


  initialize: function(item, name){
    _.bindAll(this, 'render',
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
    this.render();
  },


  render: function() {
    var self = this;
    var template = _.template( $("#template-entity").html(), { name: this.name,
                                                               attribs: this.model.get('fields'),
                                                               other_models: this.parentCollection.models } );
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
    console.log($('.property-name-input', this.el));

    console.log(this.model);
    var curFields = this.model.get('fields') || [];
    var ind = curFields.length;

    curFields.push({
      name: name,
      type: 'text',
      required: true
    });

    this.model.set('fields', curFields);
    var template = _.template( $("#template-property").html(), { name: name,
                                                                 ind : ind,
                                                                 other_models: this.parentCollection.models});

    $('.property-list',this.el).append(template);
    $('.property-name-input', this.el).val('');
    $('.add-property-form', this.el).hide();
    $('.add-property-button', this.el).fadeIn();
    return false;
  },

  changedAttribs: function(e) {
    //console.log(e.target.options[e.target.selectedIndex].value);
    var ind = String(e.target.id).replace('prop-', '');
    this.model.attributes.fields[ind].type = e.target.options[e.target.selectedIndex].value;
    //this.model.set(e.target.id, e.target.options[e.target.selectedIndex].value);
  },

  addedEntity: function(item) {
    $('.attribs', this.el).append('<option value="{{'+item.get('name')+'}}">List of '+ item.get('name') + 's</option>');
  },

  clickedDelete: function(e) {
    console.log('deleting');
    this.parentCollection.remove(this.model);
  },

  modelRemoved: function(model) {
    if (model == this.model) {
      this.remove();
    }
  },

  clickedPropDelete: function(e) {
    var name = e.target.previousSibling.innerHTML;
    this.model.unset(name);
    $(e.target.parentNode).remove();
  }
});


var UserEntityView = EntityView.extend({
  el : document.getElementById('user-entity'),
  
  events: {
    'change .cb-login' : 'checkedBox'
  },

  initialize: function(item) {
    _.bindAll(this, 'render',
                    'clickedAdd',
                    'checkedBox',
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
    this.render();
  },

  render: function() {
    var self = this;
    _(this.model.get('fields')).each(function(val, key){

      var page_context = {};
      page_context.name = key;
      page_context.key = val;
      page_context.other_models = self.parentCollection.models;

      var template = _.template( $("#template-property").html(), page_context);

      $('.property-list', this.el).append(template);
    });
  },

  checkedBox: function(e) {
    console.log(this.model);
    if(!this.model.get('loginTypes')) {
      this.model.set('loginTypes', { 'facebook' : false,
                                     'linkedin' : false,
                                     'local'    : false  });
    }
    this.model.get('loginTypes')[e.target.value] = e.target.checked;
  }
});


var EntityListView = Backbone.View.extend({
  el         : $('#entities'),
  collection : null,
  entities   : [ ],
  counter    : 0,

  initialize: function(){
    _.bindAll(this, 'render', 'appendItem', 'addEntity');

    var self = this;
    var initialEntities = appState.entities || [];

    this.collection = new EntityCollection(initialEntities);
    this.render();
  },

  render: function(){
    var self = this;
    _(this.collection.models).each(function(item) {
      self.appendItem(item);
    });
  },

  appendItem: function(item) {
    var entityView;

    if(item.get('name') == "User") {
      entityView = new UserEntityView(item);
    }
    else {
      entityView = new EntityView(item, 'entity-list-');
      $(this.el).append(entityView.el);
    }
    $('.add-property-button', entityView.el).on('click', entityView.clickedAdd);
    entityView.delegateEvents();
  },

  addEntity: function(item) {
    item.id = this.counter;

    var newModel = new EntityModel(item);
    this.collection.add(newModel);
    this.appendItem(newModel);
  }
});


var EntitiesEditorView = Backbone.View.extend({
  el        : $('#entities-page'),
  addButton : $('#add-entity-button'),
  addForm   : $('#add-entity-form'),

  events : {
    'click #save-entities'     : 'serializeEntities',
    'click #add-entity-button' : 'clickedAdd',
    'submit #add-entity-form'  : 'formSubmitted'
  },

  initialize: function() {
    _.bindAll(this, 'render',
                    'clickedAdd',
                    'formSubmitted',
                    'serializeEntities');

    $('#save-entities').on('click', this.serializeEntities);
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

    entityList.addEntity(elem);
    $('#entity-name-input').val('');
    $(this.addButton).fadeIn();
    $(e.target).remove();
  },

  serializeEntities : function(e) {
    console.log("serialized");
    var serialized = [ ];
    console.log(entityList.collection);
    _(entityList.collection.models).each(function(entity){

      var ent = {};
      ent.name = entity.get('name');
      ent.fields = [ ];
      _(entity.get('fields')).each(function(val, key){
        var field = {};
        if (key == "id") return;
        if (key == "name") return;
        if (key == "attributes") return;
        if (key == "fields") return;
        field.name = val.name;
        field.type = val.type;
        field.required = true;
        ent.fields.push(field);
      });

      if(ent.name == "User") {
        ent.loginTypes = entity.get('loginTypes');
      }
    
      serialized.push(ent);
    });

    console.log(serialized);
    appState.entities = serialized;
    $.ajax({
      type: "POST",
      url: '/app/1/state/',
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
    this.appendItem(new EntityModel(item));
  }
});
