define([
  'editor/WidgetView',
  'editor/WidgetContainerView',
  'backbone'
],
function(WidgetView, WidgetContainerView) {

  var WidgetEditorView = Backbone.View.extend({
    el : $('.page'),
    widgetsContainer : document.getElementById('elements-container'),
    widgets : [],
    selectedEl: null,

    events : {

    },

    initialize: function(widgetsCollection, containersCollection, contextEntities, page) {
      _.bindAll(this, 'render',
                      'placeWidget',
                      'placeContainer',
                      'style');

      var self = this;

      this.render();
      this.widgetsCollection = widgetsCollection;
      this.widgetsCollection.bind('add', this.placeWidget);

      this.containersCollection = containersCollection;
      this.containersCollection.bind('add', this.placeContainer);


      this.widgetsCollection.bind('selected', this.containersCollection.unselectAll);
      this.containersCollection.bind('selected', this.widgetsCollection.unselectAll);

      if(page.uielements) {
        _(page.uielements).each(function(element) {
          if(element.container_info) {
            self.containersCollection.add(element, self.widgetsCollection);
          }
          else {
            self.widgetsCollection.add(element);
          }
        });
      }

      this.widgetsCollection.bind('change', function() { iui.askBeforeLeave(); });
      this.widgetsCollection.bind('add',  function() { iui.askBeforeLeave(); });
    },

    render: function() {
      this.widgetsContainer.innerHTML = '';
    },

    placeWidget: function(widgetModel) {
      var curWidget = new WidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else iui.get('full-container').appendChild(curWidget.el);
      curWidget.resizableAndDraggable();
    },

    placeContainer: function(containerWidgetModel) {
      var curWidget= new WidgetContainerView(containerWidgetModel);
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
    }
  });

  return WidgetEditorView;
});