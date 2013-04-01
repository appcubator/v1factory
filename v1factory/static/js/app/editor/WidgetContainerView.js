define([
  'app/collections/WidgetCollection',
  'editor/TableQueryView',
  'editor/ListQueryView',
  'editor/WidgetView',
  'editor/SubWidgetView',
  'app/views/FormEditorView',
  'backbone',
  'backboneui',
  'editor/editor-templates'
],
function(WidgetCollection,
        TableQueryView,
        ListQueryView,
        WidgetView,
        SubWidgetView,
        FormEditorView,
        BackboneUI,
        Backbone) {

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
      var self = this;
      _.bindAll(this, 'render', 'reRender', 'placeWidget', 'placeFormElement', 'renderElements', 'showDetails');

      var collection = new WidgetCollection();
      this.model.get('container_info').get('uielements').bind("add", this.placeWidget);


      if(this.model.get('container_info').has('query')) {
        this.model.get('container_info').get('query').bind('change', this.reRender);
      }

      if(this.model.get('container_info').has('row')) {
        this.model.get('container_info').get('row').get('layout').bind('change', this.reRender);
        //this.model.get('container_info').get('uielements').bind('change', this.rowBindings);
        //this.rowBindings();
      }

      this.render();
      console.log(this.resizableAndDraggable);
      this.resizableAndDraggable();
      this.renderElements();
    },

    rowBindings: function() {
      console.log("BIND");
      _(this.model.get('container_info').get('row').get('uielements').models).each(function(element) {
        element.bind('change', self.reRender);
      });
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

      if(this.model.get('container_info').get('action') == "table-gal") {
        var tableDiv = document.createElement('div');
        tableDiv.innerHTML = _.template(Templates.tableNode, this.model.get('container_info').get('query').attributes);
        this.el.appendChild(tableDiv);
      }

      if(this.model.get('container_info').get('action') == "show") {
        var listDiv = document.createElement('div');
        var row = this.model.get('container_info').get('row');
        listDiv.innerHTML = _.template(Templates.listNode, {layout: row.get('layout'), uielements: row.get('uielements').models});
        this.el.appendChild(listDiv);
        // tableDiv.innerHTML = _.template(Templates.tableNode, this.model.get('container_info').get('query').attributes);
        // this.el.appendChild(tableDiv);
      }

      //this.resizableAndDraggable();

      return this;
    },

    reRender: function() {
      $( this.el ).resizable( "destroy" );
      $( this.el ).draggable( "destroy" );

      this.render();
      console.log(this.resizableAndDraggable);
      this.resizableAndDraggable();
      this.renderElements();
    },

    placeWidget: function(model, a) {
      var widgetView = new SubWidgetView(model);
      this.el.appendChild(widgetView.el);
    },

    placeFormElement: function(fieldModel) {
      var fieldHtml = _.template(Templates.fieldNode, { field: fieldModel });
      $(this.el).append(fieldHtml);
    },

    renderElements : function() {
      var self  =this;
      _(this.model.get('container_info').get('uielements').models).each(function(widgetModel) {
        self.placeWidget(widgetModel);
      });

      if(this.model.get('container_info').has('form')) {
        _(this.model.get('container_info').get('form').get('fields').models).each(function(field) {
          self.placeFormElement(field);
        });
      }
    },

    showDetails: function() {
      if(this.model.get('container_info').get('action') === "table-gal") {
        new TableQueryView(this.model, this.model.get('container_info').get('query'));
      }
      if(this.model.get('container_info').has('form')) {
        new FormEditorView(this.model.get('container_info').get('form'),
                           this.model.get('container_info').get('entity'));
      }

      if(this.model.get('container_info').has('row')) {
        new ListQueryView(this.model,
                          this.model.get('container_info').get('query'),
                          this.model.get('container_info').get('row'));
      }
    }
  });

  return WidgetContainerView;
});