define([
  'editor/WidgetsManagerView',
  'editor/WidgetView',
  'm-editor/MobileWidgetView',
  'm-editor/MobileWidgetContainerView',
  'models/WidgetModel',
  'editor/WidgetEditorView',
  'editor/WidgetListView',
  'm-editor/MobileWidgetSelectorView',
  'jquery-ui'
],
function(WidgetsManagerView,
         WidgetView,
         MobileWidgetView,
         MobileWidgetContainerView,
         WidgetModel,
         WidgetEditorView,
         WidgetListView,
         MobileWidgetSelectorView) {

  var MobileWidgetManagerView = WidgetsManagerView.extend({
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

      this.widgetSelectorView = new MobileWidgetSelectorView(this.widgetsCollection);

      this.widgetsCollection.bind('change', function() { iui.askBeforeLeave(); });
      this.widgetsCollection.bind('add',  function() { iui.askBeforeLeave(); });
    },

    render: function() {
      MobileWidgetManagerView.__super__.render.call(this);
      $( "#elements-container" ).sortable({
        placeholder: "ui-state-highlight"
      });
    },

    placeWidget: function(widgetModel) {
      var curWidget = new MobileWidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
    },

    placeContainer: function(containerWidgetModel) {
      var curWidget= new MobileWidgetContainerView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
    },

    placeList: function(containerWidgetModel) {
      var curWidget= new WidgetListView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
    }
  });

  return MobileWidgetManagerView;
});