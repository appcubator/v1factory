define([
  'editor/WidgetView',
  'mixins/BackboneModal'
],
function(WidgetView) {

  var RowEditorView = Backbone.View.extend({
    el     : null,
    className : 'row-editor-view',
    events : {
    },

    initialize: function(rowModel, entityModel){
      _.bindAll(this, 'render', 'placeWidget', 'removedWidget');
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
      this.el.innerHTML = "<h3>List Editor<div class='list-view list-type'>List View</div><div class='grid-view list-type'>Grid View</div></h3>";

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
      console.log(widgetModel);
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
    }

  });

  return RowEditorView;
});

