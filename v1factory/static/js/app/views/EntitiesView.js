define([
  'app/models/EntityModel',
  'app/models/UserEntityModel',
  'app/models/FieldModel',
  'app/views/UploadExcelView',
  'app/views/EntityView',
  'app/views/UserEntityView',
  'app/collections/EntityCollection',
  'backbone',
  'jquery-ui'
],

function(EntityModel,
         UserEntityModel,
         FieldModel,
         UploadExcelView,
         EntityView,
         UserEntityView,
         EntityCollection) {

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
