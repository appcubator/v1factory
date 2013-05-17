define([
  'app/models/WidgetModel'
],
function(WidgetModel) {

  var GuideView = Backbone.View.extend({
    events : {

    },

    nmrLines: 0,
    horizontalLinesDict: {},
    verticalLinesDict: {},
    show: false,

    initialize: function(widgetsCollection) {
      _.bindAll(this, 'render', 'placeHorizontal', 'placeVertical', 'showAll', 'hideAll', 'toggleGuides');

      var self = this;

      this.widgetsCollection = widgetsCollection;

      keyDispatcher.key(';', this.toggleGuides);
    },

    render: function() {
      var self = this;
      _(self.widgetsCollection.models).each(function(widget) {
        var layout = widget.get('layout');
        self.placeHorizontal(layout.get('top'));
        self.placeHorizontal((layout.get('top') + layout.get('height')));
        self.placeVertical(layout.get('left'));
        self.placeVertical(layout.get('left') + layout.get('width'));
      });
    },

    placeHorizontal: function(nmr) {
      if(this.horizontalLinesDict[nmr]) return;

      var line = document.createElement('div');
      line.className = 'guide-line-horizontal';
      line.style.top = (nmr * GRID_HEIGHT) + 'px';

      this.horizontalLinesDict[nmr] = line;
      this.$el.append(line);
    },

    placeVertical: function(nmr) {
      if(this.verticalLinesDict[nmr]) return;

      var line = document.createElement('div');
      line.className = 'guide-line-vertical';
      line.style.left = (nmr * GRID_WIDTH) + 'px';

      this.verticalLinesDict[nmr] = line;
      this.$el.append(line);
    },

    showAll: function() {
      _(this.horizontalLinesDict).each(function(val, key) {
        $(val).addClass('show');
      });

      _(this.verticalLinesDict).each(function(val, key) {
        $(val).addClass('show');
      });
    },

    hideAll : function() {
      _(this.horizontalLinesDict).each(function(val, key) {
        $(val).removeClass('show');
      });

      _(this.verticalLinesDict).each(function(val, key) {
        $(val).removeClass('show');
      });
    },

    toggleGuides: function() {
      if(this.show) {
        this.hideAll();
        this.show = false;
      }
      else{
        this.showAll();
        this.show = true;
      }
    }

  });

  return GuideView;
});