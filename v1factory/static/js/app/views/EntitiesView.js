define([
  'app/collections/EntityCollection',
  'app/models/UserEntityModel',
  'app/views/ShowDataView',
  'app/views/UserEntityView',
  'app/views/EntitiesListView'
],

function(EntityCollection,
         UserEntityModel,
         ShowDataView,
         UserEntityView,
         EntitiesListView) {

    var EntitiesView = Backbone.View.extend({
      css: 'entities',

      events : {
        'click #add-entity-button' : 'clickedAdd',
        'submit #add-entity-form'  : 'formSubmitted'
      },

      initialize: function() {
        _.bindAll(this, 'render',
                        'clickedAdd',
                        'formSubmitted');

        iui.loadCSS(this.css);

        this.entitiesColl = v1State.get('entities');
        this.userEntityModel = v1State.get('users');

        // subviews
        this.entityList = new EntitiesListView(this.entitiesColl);
        this.userEntityView = new UserEntityView(this.userEntityModel, this.entitiesColl );
      },

      render : function() {
        var self = this;
        this.$el.html(_.template(iui.getHTML('entities-page'), {}));
        this.userEntityView.setElement(self.$('#user-entity')).render();
        this.entityList.setElement(self.$('#entities')).render();
        return this;
      },

      clickedAdd: function(e) {
        alert('he');
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
        this.entitiesColl.add(elem);

        $('#entity-name-input').val('');
        $(this.addButton).fadeIn();
        $(e.target).hide();
      }

    });

    return EntitiesView;

});
