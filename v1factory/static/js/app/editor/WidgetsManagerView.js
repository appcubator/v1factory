define([
  'editor/WidgetView',
  'editor/WidgetContainerView',
  'app/models/WidgetModel',
  'app/editor/WidgetEditorView',
  'app/editor/WidgetListView',
  'app/editor/WidgetSelectorView',
  'backbone'
],
function(WidgetView, WidgetContainerView, WidgetModel, WidgetEditorView, WidgetListView, WidgetSelectorView) {

  var WidgetManagerView = Backbone.View.extend({
    el : $('.page'),
    widgetsContainer : null,
    events : {

    },

    initialize: function(widgetsCollection) {
      _.bindAll(this, 'render',
                      'placeWidget',
                      'placeContainer',
                      'placeUIElement');

      var self = this;

      this.widgetsCollection = widgetsCollection;
      this.widgetsCollection.bind('add', this.placeUIElement);

      this.widgetSelectorView = new WidgetSelectorView(this.widgetsCollection);

      this.widgetsCollection.bind('change', function() { iui.askBeforeLeave(); });
      this.widgetsCollection.bind('add',  function() { iui.askBeforeLeave(); });
    },

    render: function() {
      var self = this;
      this.widgetsContainer = document.getElementById('elements-container');
      this.widgetsContainer.innerHTML = '';
      _(self.widgetsCollection.models).each(function(widget) {
        self.placeUIElement(widget);
      });
      this.widgetSelectorView.setElement(this.widgetsContainer).render();
    },

    // this function decides if widget or container
    placeUIElement: function(model) {
      var self = this;

      if(model.has('container_info') && model.get('container_info').has('row')) {
        self.placeList(model);
      }
      if(model.has('container_info')) {
        self.placeContainer(model);
      }
      else {
        self.placeWidget(model);
      }
      model.trigger('rendered');
    },

    placeWidget: function(widgetModel) {
      var curWidget = new WidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
    },

    placeContainer: function(containerWidgetModel) {
      var curWidget= new WidgetContainerView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
    },

    placeList: function(containerWidgetModel) {
      var curWidget= new WidgetListView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
    }
  });

  return WidgetManagerView;
});