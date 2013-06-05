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
        'click #users .tab': 'clickedUserNavItem',
        'click #tables .tab': 'clickedTableNavItem',
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

        this.listenTo(this.tables, 'add remove', this.renderTablesNav);
        this.listenTo(this.userRoles, 'add remove', this.renderUserRolesNav);

        // subviews
        this.userView = new UserEntityView({
          model: this.userRoles.get(0) || null,
          entities: this.tables
        });
        this.tableView = new EntityView({
          model: this.tables.get(0) || null,
          entities: this.tables
        });

        this.title = "Tables";
      },

      render : function() {
        var self = this;
        this.$el.html(_.template(iui.getHTML('entities-page'), {}));
        this.renderUserView();
        this.renderUserRolesNav();
        this.renderTableView();
        this.renderTablesNav();
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

      renderUserRolesNav: function() {
        var $nav = this.$('#user-entity .entity-nav');
        var htmlString = '';
        this.userRoles.each(function (role) {
          htmlString += '<li class="tab" id="navtab-'+ role.cid +'"><a href="#" data-target="'+role.cid+'">' + role.get('role') + '</a></li>';
        });
        $nav.html(htmlString);
      },

      renderTablesNav: function() {
        var $nav = this.$('#tables-nav');
        var htmlString = '';
        this.tables.each(function (table) {
          htmlString += '<li class="button hoff2"><a href="#" data-target="'+table.cid+'">' + table.get('name') + '</a></li>';
        });
        $nav.html(htmlString);
      },

      clickedUserNavItem: function(e) {
        e.preventDefault();
        var cid = String(e.target.id||e.target.parentNode.id).replace('navtab-','');
        var model = this.userRoles.get(cid);
        this.userView.model = model;
        this.userView.render();
        this.renderUserRolesNav();
        $(e.target).addClass('active');
        return false;
      },

      clickedTableNavItem: function(e) {
        e.preventDefault();
        var $clicked = $(e.target);
        var cid = e.target.dataset.target;
        var model = this.tables.get(cid);
        this.tableView.setModel(model);
        this.tableView.render();

        $clicked.addClass('active').siblings().removeClass('active');
        return false;
      },

      clickedAddUserRole: function(e) {
        $(e.currentTarget).fadeOut();
        $('#add-role-form').fadeIn().focus();
      },

      createUserRole: function(e) {
        if(e.keyCode != 13) {
          return;
        }

        var elem = new UserEntityModel({
          role: e.target.value,
        });
        console.log(elem.toJSON());
        this.userRoles.add(elem);
        this.userView.setModel(elem);
        this.renderUserView();

        e.target.value = '';
        $('#add-role').fadeIn();
        $(e.target).fadeOut();
      },

      clickedAddEntity: function(e) {
        $(e.currentTarget).hide()
        $('#add-entity-form').show().focus();
      },

      createEntity: function(e) {
        if(e.keyCode != 13) {
          return;
        }

        var elem = new EntityModel({
          name: e.target.value,
          fields: []
        });
        console.log(elem.toJSON());
        this.tables.add(elem);
        this.tableView.setModel(elem);
        this.renderTableView();

        e.target.value = '';
        $('.add-button').show();
        $(e.target).hide();
      }

    });

    return EntitiesView;

});
