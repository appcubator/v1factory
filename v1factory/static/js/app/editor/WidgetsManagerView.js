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
    widgets : [],
    selectedEl: null,
    copiedEl: null,
    events : {

    },

    initialize: function(widgetsCollection) {
      _.bindAll(this, 'render',
                      'changed',
                      'placeWidget',
                      'placeContainer',
                      'placeUIElement',
                      'style',
                      'copy',
                      'paste');

      var self = this;

      this.widgetsCollection = widgetsCollection;
      this.widgetsCollection.bind('add', this.placeUIElement);
      this.widgetsCollection.bind('change', this.changed);

      this.widgetEditorView = new WidgetEditorView(this.widgetsCollection);
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

      this.widgetEditorView.render();
      this.widgetSelectorView.render();
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
      curWidget.resizableAndDraggable();
    },

    placeList: function(containerWidgetModel) {
      var curWidget= new WidgetListView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
      curWidget.resizableAndDraggable();
    },

    style: function (props) {

      _(props).each(function(prop) {

        if(document.getElementById('style-' + prop.type)) {
          $(document.getElementById('style-' + prop.type)).remove();
        }

        var styleTag = document.createElement('style');
        styleTag.id = 'style-' + prop.type;

        var styleContent = '' + (designOptions[prop.type].tag||'.sample') + ' {';
        styleContent += designOptions[prop.type].css.replace(/<%=content%>/g, prop.value);
        styleContent += '}';

        styleTag.innerHTML = styleContent;
        this.styleTag = styleTag;

        document.getElementsByTagName('head')[0].appendChild(styleTag);
      });
    },

    changed: function(el) {
      this.selectedEl = el;
    },

    copy: function() {
      if(this.selectedEl) {
        this.copiedEl = this.selectedEl.toJSON();
        return true;
      }

      return false;
    },

    paste: function() {
      if(this.copiedEl) {
        this.copiedEl.layout.left += this.copiedEl.layout.width;
        var widgetModel = new WidgetModel(this.copiedEl);
        this.widgetsCollection.push(widgetModel);
      }
    }
  });

  return WidgetManagerView;
});