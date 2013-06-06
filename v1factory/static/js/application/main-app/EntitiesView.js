define([
  'collections/TableCollection',
  'models/UserTableModel',
  'models/TableModel',
  'app/ShowDataView',
  'app/UserTableView',
  'app/TablesView',
],

function(TableCollection,
         UserTableModel,
         TableModel,
         ShowDataView,
         UserTableView,
         TablesView) {

    var EntitiesView = Backbone.View.extend({
      css: 'entities',

      events : {
        'click #add-role' : 'clickedAddUserRole',
        'keyup #add-role-form'  : 'createUserRole',
        'click #add-entity' : 'clickedAddTable',
        'keyup #add-entity-form'  : 'createTable'
      },

      initialize: function() {
        _.bindAll(this);

        iui.loadCSS(this.css);

        this.tables = v1State.get('entities');
        //this.userRoles = v1State.get('users');

        // subviews
        var self = this;/*
        this.userView = new UserTableView({
          model: self.userRoles.models[0] || null,
          entities: self.tables
        });*/

        this.tablesView = new TablesView();
        this.title = "Tables";
      },

      render : function() {
        var self = this;
        this.$el.html(_.template(iui.getHTML('entities-page'), {}));
        //this.renderUserView();
        this.renderTableView();
        return this;
      },
/*
      renderUserView: function() {
        if(this.userRoles.length > 0) {
          this.userView.setElement(self.$('#user-entity')).render();
        }
      },
      */

      renderTableView: function() {
        if(this.tables.length > 0) {
          this.tableView.setElement(self.$('#tables')).render();
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
        var elem = new UserTableModel({
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

      clickedAddTable: function(e) {
        $(e.currentTarget).hide();
        $('#add-entity-form').fadeIn().focus();
      },

      createTable: function(e) {
        if(e.keyCode != 13) {
          return;
        }
        var elem = new TableModel({
          name: e.target.value,
          fields: []
        });
        v1State.get('tables').add(elem);

        // reset
        e.target.value = '';
        $('#add-entity').fadeIn();
        $(e.target).hide();
      }
    });

    return EntitiesView;

});
