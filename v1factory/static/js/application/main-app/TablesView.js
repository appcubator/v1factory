define([
  'models/FieldModel',
  'models/FormModel',
  'app/TableView',
  'app/UserTableView',
  'app/FormEditorView',
  'app/UploadExcelView',
  'app/ShowDataView',
  'app/templates/TableTemplates',
  'prettyCheckable'
],
function( FieldModel,
          FormModel,
          TableView,
          UserTableView,
          FormEditorView,
          UploadExcelView,
          ShowDataView) {

  var TablesView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    currentTable : null,
    className : 'pane entity-pane',
    tableDiv: null,

    events : {
      'click .tab.nav-tab' : 'clickedNavItem'
    },

    initialize: function(tablesCollection, isUsers){
      _.bindAll(this);

      this.collection = tablesCollection;
      this.isUsers = isUsers;

      this.listenTo(this.collection, 'add', this.newTable);
    },

    render: function() {
      var self = this;
      this.renderNav();
      this.renderTable();
      return this;
    },

    renderNav: function() {
      this.tableDiv = document.createElement('div');

      this.navBar = document.createElement('ul');
      this.navBar.className = 'entity-nav span58';
      this.collection.each(this.appendNavItem);

      $(this.navBar).append('<li class="tab" id="add-role"><a><span class="add-icon"></span>Add User Role</a></li>');
      this.el.appendChild(this.tableDiv);
      this.el.appendChild(this.navBar);

      return this;
    },

    renderTable: function(newModel) {
      if(this.currentTable) {
        this.currentTable.remove();
      }
      if(this.collection.length === 0) {
        this.renderEmptyTable();
      }
      if(newModel) {
        var model = newModel;
      }
      else {
        var model = this.collection.models[0];
      }

      if(this.isUsers) this.currentTable = new UserTableView(model);
      else this.currentTable = new TableView(model);

      this.tableDiv.appendChild(this.currentTable.render().el);
      this.activateTab(model);

      return this;
    },

    renderEmptyTable: function() {
      alert('not supposed to happen');
    },

    appendNavItem: function(tableModel) {
      this.navBar.innerHTML += '<li class="tab nav-tab" id="navtab-'+ tableModel.cid +'"><a>' + (tableModel.get('name')||tableModel.get('role')) + '</a></li>';
    },

    activateTab: function(tableModel) {
      this.$el.find('.active').removeClass('active');
      this.$el.find('#navtab-'+ tableModel.cid).addClass('active');
    },

    clickedNavItem: function(e) {
      var cid = (e.target.id||e.target.parentNode.id).replace('navtab-','');
      var newModel = this.collection.get(cid);
      this.currentTable.remove();

      if(this.isUsers) this.currentTable = new UserTableView(newModel);
      else this.currentTable = new TableView(newModel);

      this.tableDiv.innerHTML = '';
      this.tableDiv.appendChild(this.currentTable.render().el);

      this.activateTab(newModel);
    },

    newTable: function(newModel) {
      this.appendNavItem(newModel);
      this.$('.tab').removeClass('active')
          .filter('#navtab-'+newModel.cid).addClass('active');
      this.renderTable(newModel);
    }
  });

  return TablesView;
});
