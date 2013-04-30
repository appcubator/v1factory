define([
  'app/editor/TableQueryView',
  'backbone'
],
function(TableQueryView) {

  var WidgetInfoEditorView = Backbone.View.extend({
    el     : document.getElementById('content-editor'),
    className : 'content-editor',
    tagName : 'ul',
    events : {
      'click .edit-query-button' : 'queryEditClicked'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
                      'renderQueryButton',
                      'queryEditClicked');

      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;

      this.el.appendChild(this.renderQueryButton());
    },

    renderQueryButton: function() {
      var li       = document.createElement('li');
      li.className = 'option-button edit-query-button';
      li.innerHTML = 'Edit Query';
      return li;
    },

    queryEditClicked: function() {
      new TableQueryView(this.model);
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
      this.remove();
    }

  });

  return WidgetInfoEditorView;
});

