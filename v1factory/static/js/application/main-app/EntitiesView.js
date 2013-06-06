define([
  'collections/TableCollection',
  'models/UserTableModel',
  'models/TableModel',
  'app/ShowDataView',
  'app/UserTableView',
  'app/TablesView'
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
        'click #add-role'        : 'clickedAddUserRole',
        'submit #add-role-form'  : 'createUserRole',
        'click #add-entity'      : 'clickedAddTable',
        'submit #add-entity-form': 'createTable'
      },

      initialize: function() {
        _.bindAll(this);
        iui.loadCSS(this.css);
        this.tablesView     = new TablesView(v1State.get('tables'), false);
        this.userTablesView = new TablesView(v1State.get('users'), true);
        this.title = "Tables";
      },

      render : function() {
        var self = this;
        this.$el.html(_.template(iui.getHTML('entities-page'), {}));
        this.renderTables();
        return this;
      },

      renderTables: function() {
        iui.get('tables').appendChild(this.tablesView.render().el);
        iui.get('users').appendChild(this.userTablesView.render().el);
      },

      clickedAddUserRole: function(e) {
        $(e.currentTarget).hide();
        $('#add-role-form').fadeIn().focus();
      },

      createUserRole: function(e) {
        var elem = new UserTableModel({
          role: e.target.value
        });
        v1State.get('users').add(elem);
        this.userView.setModel(elem);
        this.renderUserView();

        e.target.value = '';
        $('#add-role').fadeIn();
        $(e.target).hide();

        e.preventDefault();
      },

      clickedAddTable: function(e) {
        $(e.currentTarget).hide();
        $('#add-entity-form').fadeIn().focus();
      },

      createTable: function(e) {
        var elem = new TableModel({
          name: e.target.value,
          fields: []
        });
        v1State.get('tables').add(elem);

        e.target.value = '';
        $('#add-entity').fadeIn();
        $(e.target).hide();

        e.preventDefault();
      }
    });

    return EntitiesView;

});
