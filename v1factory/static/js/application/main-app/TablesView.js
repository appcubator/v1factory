define([
  'models/FieldModel',
  'models/FormModel',
  'app/TableView',
  'app/FormEditorView',
  'app/UploadExcelView',
  'app/ShowDataView',
  'app/templates/TableTemplates',
  'prettyCheckable'
],
function(FieldModel, FormModel, TableView, FormEditorView, UploadExcelView, ShowDataView) {

  var TableView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,

    events : {
      'click .tab'                 : 'clickedNavItem',
    },


    initialize: function(){
      _.bindAll(this);

      this.tables = v1State.get('tables');
      this.listenTo(this.tables, 'add', this.newTable);
      this.tableView = new TableView();
      if(this.tables.length > 0) {
        this.tableView.model = this.tables.get(0);
      }
    },

    render: function() {
      var self = this;
      this.tableView.render();
      this.renderNav();
      return this;
    },

    renderNav: function() {
      var nav = document.createElement('ul');
      this.$nav = nav;
      nav.className.addClass('span58 hoff1');
      this.tables.each(this.appendNavItem);

      if(this.model) {
        this.$nav.find('#navtab-' + this.tableView.model.cid).addClass('active');
      }
    },

    appendNavItem: function(model) {
      this.$nav[0].innerHTML += '<li class="tab" id="navtab-'+ model.cid +'"><a href="#">' + model.get('name') + '</a></li>';
    },

    clickedNavItem: function(e) {
      var cid = (e.currentTarget.id).replace('navtab-','');
      e.currentTarget.className.addClass('active');
      this.$('.active').removeClass('active');
      var newModel = this.tables.get(cid);
      this.tableView.remove();
      this.tableView = new TableView(newModel);
      this.tableView.render();
    },

    newTable: function(newModel) {
      this.appendNavItem(newModel);
      this.$nav.children().removeClass('active')
          .filter('#navtab-'+newModel.cid).addClass('active');
      this.tableView.remove()
      this.tableView = new TableView(newModel);
      this.tableView.render();
    }
  });

  return TableView;
});
