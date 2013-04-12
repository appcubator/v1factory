define([
  'editor/WidgetView',
  'mixins/BackboneModal'
],
function(WidgetView) {

  var RowEditorView = Backbone.View.extend({
    el     : null,
    className : 'row-editor-view',
    events : {
      'keydown' : 'keydown'
    },

    initialize: function(rowModel, entityModel){
      _.bindAll(this, 'render',
                      'placeWidget',
                      'removedWidget',
                      'resizing',
                      'keydown');
      var self = this;

      this.rowModel = rowModel;
      this.entity = entityModel;

      this.widgetsCollection = rowModel.get('uielements');
      this.widgetsCollection.bind('add', this.placeWidget);

      this.render();

      _(self.widgetsCollection.models).each(function(widgetModel) {
        self.placeWidget(widgetModel);
      });
    },

    render: function() {
      var self = this;
      this.el.innerHTML = "<h3>List Editor</h3>";
      //<div class='list-view list-type'>List View</div><div class='grid-view list-type'>Grid View</div>

      var rowWidget = document.createElement('div');
      this.rowWidget = rowWidget;
      rowWidget.className = 'editor-window container-wrapper';
      rowWidget.className += (' hi' + this.rowModel.get('layout').get('height'));

      if(this.rowModel.get('isListOrGrid') == "list") {
        iui.resizableVertical(rowWidget, self);
        rowWidget.style.width = '100%';
      }
      else {
        iui.resizable(rowWidget, self);
        rowWidget.className += (' span' + this.rowModel.get('layout').get('width'));
      }


      this.el.appendChild(rowWidget);

      return this;
    },

    placeWidget: function(widgetModel) {
      var curWidget = new WidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.rowWidget.appendChild(curWidget.el);
      curWidget.resizableAndDraggable();
    },

    removedWidget: function(fieldId) {
      var self = this;
      var cid = String(fieldId).replace('field-', '');
      console.log(cid);
      console.log(this.widgetsCollection);
      var widget = this.widgetsCollection.where({field: cid})[0];

      if(!widget) {
        var model = this.entity.get('fields').get(cid);
        widget = this.widgetsCollection.where({content: "{{" + self.entity.get('name') + '.' + model.get('name') + '}}'})[0];
      }

      this.widgetsCollection.remove(widget);
      $('#widget-wrapper-' + widget.cid).remove();
      widget.remove();
    },

    resizing: function(e, ui) {
      console.log("YOLO");
      var dHeight = (ui.size.height + 2) / GRID_HEIGHT;
      var dWidth = (ui.size.width + 2) / GRID_WIDTH;

      var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
      var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);

      this.rowModel.get('layout').set('width', deltaWidth);
      this.rowModel.get('layout').set('height', deltaHeight);
    },

    keydown: function(e) {
      console.log("row editor");
      console.log(e);
    }

  });

  return RowEditorView;
});

