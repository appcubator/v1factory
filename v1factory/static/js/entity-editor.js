var EntityModel = Backbone.Model.extend({
  initialize: function(key, value) {
    this.name = key;
  }
});

var EntityCollection = Backbone.Collection.extend({
  model: EntityModel,
  initialize: function(items) {
    _(items).each(function(item){
      item['attributes'] = item.fields;
      item.fields = null;
    });
    this.add(items);
  }
});

var EntityView = Backbone.View.extend({
  el : null,
  tagName: 'li',
  collection: null,
  parentName: "",
  className: 'offset1 span7 entity',

  events : {
    'click .add-property-button' : 'clickedAdd',
    'submit .add-property-form' : 'formSubmitted',
    'change .attribs' : 'changedAttribs',
    'click #cross' : 'clickedDelete',
    'click #prop-cross' : 'clickedPropDelete'
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
    //console.log(this.model);
    var template = _.template( $("#template-entity").html(), { name: this.name,
                                                               attribs: this.model.get('attributes'),
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

    this.model.set(name, "text");
    var template = _.template( $("#template-property").html(), { name: name,
                                                                 key : name,
                                                                 other_models: this.parentCollection.models});

    $('.property-list',this.el).append(template);
    $('.property-name-input', this.el).val('');
    $('.add-property-form', this.el).hide();
    $('.add-property-button', this.el).fadeIn();
    return false;
  },

  changedAttribs: function(e) {
    console.log(e.target.id);
    this.model.set(e.target.id, e.target.options[e.target.selectedIndex].value);
  },

  addedEntity: function(item) {
    $('.belongs-to', this.el).append('<option>'+ item.get('name') + '</option>');
    $('.owns', this.el).append('<option>'+ item.get('name') + '</option>');
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

var EntityListView = Backbone.View.extend({
  el: $('#entities'),
  collection: null,
  entities: [ ],
  counter: 0,
  initialize: function(){
    self = this;
    _.bindAll(this, 'render', 'appendItem', 'addEntity');
    _(initialEntities).each(function(entity) {
      entity.id = self.counter;
      self.counter++;
    });
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
    var entityView = new EntityView(item, 'entity-list-');
    $(this.el).append(entityView.el);
    $('.add-property-button', entityView.el).on('click', entityView.clickedAdd);
    entityView.delegateEvents();
  },

  addEntity: function(item) {
    console.log(item);
    item.id = this.counter;
    this.counter++;
    var newModel = new EntityModel(item);
    this.collection.add(newModel);
    this.appendItem(newModel);
  }
});

var EntitiesEditorView = Backbone.View.extend({
  el : $('#entities-page'),
  addButton: $('#add-entity-button'),
  addForm: $('#add-entity-form'),
  events : {
    'click #save-entities' : 'serializeEntities',
    'click #add-entity-button' : 'clickedAdd',
    'submit #add-entity-form' : 'formSubmitted'
  },
  initialize: function() {
    _.bindAll(this, 'render', 'clickedAdd', 'formSubmitted', 'serializeEntities');
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
    var elem = {
      name : $('#entity-name-input').val(),
      fields : {}
    };
    entityList.addEntity(elem);
    $('#entity-name-input').val('');
    $(this.addButton).fadeIn();
    $(e.target).remove();
    return false;
  },

  serializeEntities : function(e) {
    console.log("serialized");
    var serialized = [ ];
    _(entityList.collection.models).each(function(entity){

      var ent = {};
      ent.name = entity.get('name');
      ent.fields = { };
      _(entity.attributes).each(function(val, key){
        if (key == "id") return;
        if (key == "name") return;
        if (key == "attributes") return;
        if (key == "fields") return;
        ent.fields[key] = val;
      });
    
      serialized.push(ent);
    });

    console.log(JSON.stringify(serialized));
    $.ajax({
      type: "POST",
      url: '/app/1/syncschema/',
      data: JSON.stringify(serialized),
      success: function() {

      },
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


var rightEditor = new EntitiesEditorView();
var entityList = new EntityListView();
var entityLibrary = new EntitiesLibraryView();

