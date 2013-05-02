define([
  'app/editor/TableQueryView',
  'app/editor/ListEditorView'
],
function(TableQueryView, ListEditorView) {

  var WidgetInfoEditorView = Backbone.View.extend({
    el     : document.getElementById('content-editor'),
    className : 'content-editor',
    tagName : 'ul',
    events : {
      'click .edit-query-button' : 'queryEditClicked',
      'click .edit-row-button'   : 'rowEditClicked'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
                      'renderQueryButton',
                      'rowEditClicked',
                      'queryEditClicked');

      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;

      this.el.appendChild(this.renderQueryButton());

      if(this.model.get('container_info').has('row')) {
        this.el.appendChild(this.renderRowButton());
      }
    },

    renderQueryButton: function() {
      var li       = document.createElement('li');
      li.className = 'option-button edit-query-button';
      li.innerHTML = 'Edit Query';
      return li;
    },

    renderRowButton: function() {
      var li       = document.createElement('li');
      li.className = 'option-button edit-row-button';
      li.innerHTML = 'Edit Row View';
      return li;
    },

    queryEditClicked: function() {
      var type = 'table';
      if(this.model.get('container_info').has('row')) {
        type = 'list';
      }

      new TableQueryView(this.model, type);
    },

    rowEditClicked: function() {
      //widgetModel, queryModel, rowModel
      console.log(this.model);
      console.log(this.model.get('container_info').get('query'));
      new ListEditorView(this.model,
                         this.model.get('container_info').get('query'),
                         this.model.get('container_info').get('row'));
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
      this.remove();
    }

  });

  return WidgetInfoEditorView;
});

