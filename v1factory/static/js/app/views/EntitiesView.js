define([
  'app/models/EntityModel',
  'app/collections/EntityCollection',
  'app/models/UserEntityModel',
  'app/models/FieldModel',
  'app/views/UploadExcelView',
  'app/views/ShowDataView',
  'app/views/EntityView',
  'app/views/UserEntityView',
  'app/views/EntitiesListView'
],

function(EntityModel,
         EntityCollection,
         UserEntityModel,
         FieldModel,
         UploadExcelView,
         ShowDataView,
         EntityView,
         UserEntityView,
         EntitiesListView) {

    var EntitiesView = Backbone.View.extend({

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

        this.entitiesColl = new EntityCollection(appState.entities);
        this.userEntityModel = new UserEntityModel(appState.users);

        // subviews
        this.entityList = new EntitiesListView(this.entitiesColl );
        this.userEntityView = new UserEntityView(this.userEntityModel, this.entitiesColl );

      },

      render : function() {
        var self = this;
        this.$el.html(_.template(iui.getHTML('entities-page'), {}  ));
        this.userEntityView.setElement(self.$('#user-entity')).render();
        this.entityList.setElement(self.$('#entities')).render();
        return this;
      },

      clickedAdd: function(e) {
        var newForm = this.$el.find('#add-entity-form');
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
