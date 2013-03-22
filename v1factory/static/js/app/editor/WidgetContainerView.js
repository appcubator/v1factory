define([
  '../collections/WidgetCollection',
  './TableQueryView',
  './WidgetView',
  'backbone',
  './editor-templates'
],function(WidgetCollection, TableQueryView, WidgetView) {

  var WidgetContainerView = WidgetView.extend({
    el: null,
    className: 'container-create',
    tagName : 'div',
    entity: null,
    type: null,
    events: {
      'click'         : 'select',
      'click .delete' : 'remove',
      'dblclick'      : 'showDetails'
    },

    initialize: function(widgetModel) {
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      _.bindAll(this, 'placeWidget', 'renderElements', 'showDetails');

      var collection = new WidgetCollection();
      //this.model.set('uielements', collection);
      this.model.get('container_info').get('uielements').bind("add", this.placeWidget);

      //this.model.get('container_info').get('uielements').add(widgetModel.)
      //var uielements = widgetModel.get('container_info').uielements;
      //this.model.get('uielements').add(uielements);
      if(this.model.get('container_info').has('query')) {
        this.model.get('container_info').get('query').bind('change', this.render);
      }

      this.render();
      this.resizableAndDraggable();
      this.renderElements();
    },

    render: function() {
      var self = this;
      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(GRID_HEIGHT * this.model.get('layout').get('top'));
      this.setLeft(GRID_WIDTH * this.model.get('layout').get('left'));
      this.setHeight(height * GRID_HEIGHT);

      this.el.className += ' widget-wrapper span'+width;

      if(this.model.get('container_info').has('query')) {
        var tableDiv = document.createElement('div');
        tableDiv.innerHTML = _.template(Templates.tableNode, this.model.get('container_info').get('query').attributes);
        this.el.appendChild(tableDiv);
      }

      //this.resizableAndDraggable();

      return this;
    },

    placeWidget: function(model, a) {
      var widgetView = new WidgetView(model);
      this.el.appendChild(widgetView.el);
    },

    renderElements : function() {
      var self  =this;
      _(this.model.get('container_info').get('uielements').models).each(function(widgetModel) {
        self.placeWidget(widgetModel);
      });
    },

    showDetails: function() {
      console.log(this.model);
      if(this.model.get('container_info').get('action') === "table-gal") {
        new TableQueryView(this.model, this.model.get('container_info').get('query'));
      }
    }
  });

  return WidgetContainerView;
});