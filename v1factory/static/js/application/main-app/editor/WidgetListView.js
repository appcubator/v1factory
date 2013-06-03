define([
  'editor/ListEditorView',
  'editor/WidgetContainerView',
  'editor/WidgetView',
  'editor/WidgetSelectorView',
  'dicts/constant-containers',
  'editor/editor-templates'
],
function( ListEditorView,
          WidgetContainerView,
          WidgetView,
          WidgetSelectorView ) {

  var WidgetListView = WidgetContainerView.extend({
    el: null,
    className: 'container-create',
    tagName : 'div',
    entity: null,
    type: null,
    events: {
      'click'         : 'select',
      'click .delete' : 'remove',
      'mouseover'     : 'hovered',
      'mouseout'      : 'unhovered'
    },

    initialize: function(widgetModel) {

      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      _.bindAll(this, 'render',
                      'renderShadowElements',
                      'placeWidget',
                      'renderElements',
                      'showDetails',
                      'highlightFirstRow');

      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.placeWidget);
      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.renderShadowElements);

      var action = this.model.get('data').get('container_info').get('action');

      //this.model.get('data').get('container_info').get('row').get('layout').bind('change', this.reRender);
      //this.model.get('container_info').get('uielements').bind('change', this.rowBindings);
      this.model.bind('highlight', this.highlightFirstRow);
      this.widgetSelectorView = new WidgetSelectorView(this.model.get('data').get('container_info').get('row').get('uielements'));
      this.rowBindings();
    },

    rowBindings: function() {
      var self = this;
      _(self.model.get('data').get('container_info').get('row').get('uielements').models).each(function(element) {
        console.log(element);
        element.unbind();
        element.get('layout').unbind("change", self.reRender);
        element.bind('change', self.reRender);
        element.get('layout').bind('change', self.reRender);
      });
    },

    render: function() {
      var self = this;
      var form;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(GRID_HEIGHT * this.model.get('layout').get('top'));
      this.setLeft(GRID_WIDTH * this.model.get('layout').get('left'));
      this.setHeight(height * GRID_HEIGHT);

      this.el.className += ' widget-wrapper span'+width;
      this.el.id = 'widget-wrapper-' + this.model.cid;

      var row = this.model.get('data').get('container_info').get('row');

      var editorRow = document.createElement('div');
      editorRow.className = "row block hi" + row.get('layout').get('height');
      this.editorRow = editorRow;

      row.get('uielements').map(function(widgetModel) {
        self.placeWidget(widgetModel);
      });

      this.el.appendChild(editorRow);

      var listDiv = document.createElement('div');
      this.listDiv = listDiv;
      this.el.appendChild(this.renderShadowElements());

      this.el.appendChild(this.widgetSelectorView.render().el);

      return this;
    },

    renderShadowElements: function() {
      var row = this.model.get('data').get('container_info').get('row');
      var uielements = _.map(row.get('uielements').models, function(obj) { return obj.attributes; });
      this.listDiv.innerHTML = _.template(Templates.listNode, {layout: row.get('layout'),
                                                          uielements: uielements,
                                                          isListOrGrid: row.get('isListOrGrid')});
      return this.listDiv;
    },

    renderElements : function() {
      var self  =this;
      _(this.model.get('data').get('container_info').get('row').get('uielements').models).each(function(widgetModel) {
        //self.placeWidget(widgetModel);
      });

      if(this.model.get('data').get('container_info').has('form')) {
        _(this.formModel.get('fields').models).each(function(field) {
          self.placeFormElement(field);
        });
      }
    },

    showDetails: function() {
      new ListEditorView( this.model,
                          this.model.get('data').get('container_info').get('query'),
                          this.model.get('data').get('container_info').get('row'));
    },

    highlightFirstRow: function() {
      this.$el.find('.row').first().addClass('highlighted');
    },

    placeWidget: function(widgetModel) {
      var widgetView = new WidgetView(widgetModel);
      this.editorRow.appendChild(widgetView.render().el);
    }

  });

  return WidgetListView;
});
