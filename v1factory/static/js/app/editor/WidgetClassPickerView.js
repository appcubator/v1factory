define([
  'mixins/SelectView'
],
function(SelectView) {

  var WidgetClassPickerView = SelectView.extend({
    className : 'class-picker select-view',
    id: 'class-editor',
    tagName : 'div',
    css : 'widget-editor',

    events: {
      'click li' : 'select',
      'mouseover li' : 'hovered'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
                      'expand',
                      'shrink',
                      'select',
                      'show',
                      'hide',
                      'hovered');

      this.model = widgetModel;
      console.log(widgetModel);
      this.list = _.map(uieState[this.model.get('type')], function(obj) { return obj.class_name; });
      this.currentVal = this.model.get('class_name');
      this.render();
    },

    classChanged: function(e) {
      var newClass = (e.target.id||e.target.parentNode.id);
      this.model.set('class_name', newClass);
      this.closeModal();
    },

    selectChanged : function(chg, ch2) {
      if(this.widgetsCollection.selectedEl === null) {
        this.model = null;
        //this.el.innerHTML = '';
      }
      else if(this.widgetsCollection.selectedEl != this.model) {
        this.clear();
        this.model = this.widgetsCollection.selectedEl;
        this.render();
      }
    },

    render: function() {
      console.log(this.el);
      console.log(this.list);
      WidgetClassPickerView.__super__.render.call(this);
      this.expand();
      this.hide();
    },

    hovered: function() {
      console.log("HOVERED");
    },

    show: function() {
      this.$el.fadeIn();
    },

    hide: function() {
      this.$el.hide();
    }
  });

  return WidgetClassPickerView;
});