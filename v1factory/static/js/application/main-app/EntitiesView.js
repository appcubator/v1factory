define([
  'collections/EntityCollection',
  'models/UserEntityModel',
  'models/EntityModel',
  'app/ShowDataView',
  'app/UserEntityView',
  'app/EntityView',
  'app/EntitiesListView'
],

function(EntityCollection,
         UserEntityModel,
         EntityModel,
         ShowDataView,
         UserEntityView,
         EntityView,
         EntitiesListView) {

    var EntitiesView = Backbone.View.extend({
      css: 'entities',

      events : {
        'click #add-role' : 'clickedAddUserRole',
        'keyup #add-role-form'  : 'createUserRole',
        'click #add-entity' : 'clickedAddEntity',
        'keyup #add-entity-form'  : 'createEntity'
      },

      initialize: function() {
        _.bindAll(this);

        iui.loadCSS(this.css);

        this.tables = v1State.get('entities');
        this.userRoles = v1State.get('users');

        // subviews
        var self = this;
        this.userView = new UserEntityView({
          model: self.userRoles.models[0] || null,
          entities: self.tables
        });

        this.tableView = new EntityView({
          model: self.tables.models[0] || null,
          entities: self.tables
        });

        this.title = "Tables";
      },

      render : function() {
        var self = this;
        this.$el.html(_.template(iui.getHTML('entities-page'), {}));
        this.renderUserView();
        this.renderTableView();
        return this;
      },

      renderUserView: function() {
        if(this.userRoles.length > 0) {
          this.userView.setElement(self.$('#user-entity')).render();
        }
      },

      renderTableView: function() {
        if(this.tables.length > 0) {
          this.tableView.setElement(self.$('.table')).render();
        }
      },

      clickedAddUserRole: function(e) {
        $(e.currentTarget).hide();
        $('#add-role-form').fadeIn().focus();
      },

      createUserRole: function(e) {
        if(e.keyCode != 13) {
          return;
        }
        var elem = new UserEntityModel({
          role: e.target.value
        });
        v1State.get('users').add(elem);
        this.userView.setModel(elem);
        this.renderUserView();
        // reset
        e.target.value = '';
        $('#add-role').fadeIn();
        $(e.target).hide();
      },

      clickedAddEntity: function(e) {
        $(e.currentTarget).hide();
        $('#add-entity-form').fadeIn().focus();
      },

      createEntity: function(e) {
        if(e.keyCode != 13) {
          return;
        }
        var elem = new EntityModel({
          name: e.target.value,
          fields: []
        });
        v1State.get('entities').add(elem);
        this.tableView.setModel(elem);
        this.renderTableView();
        // reset
        e.target.value = '';
        $('#add-entity').fadeIn();
        $(e.target).hide();
      }
    });

    return EntitiesView;

});
