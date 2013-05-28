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
      'mouseover li' : 'hovered',
      'mouseover .updown-handle' : 'hovered'
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
      this.list = _.map(uieState[this.model.get('type')], function(obj) { return obj.class_name; });
      this.currentVal = this.model.get('class_name');
      this.render();
    },

    classChanged: function(e) {
      var newClass = (e.target.id||e.target.parentNode.id);
      this.model.set('class_name', newClass);
      this.closeModal();
    },

    render: function() {
      WidgetClassPickerView.__super__.render.call(this);
      this.expand();
      this.hide();
    },

    hovered: function(e) {
      if(e.target.className == "updown-handle")  {
        this.model.set('class_name', this.currentVal);
        return;
      }
      var ind = String(e.target.id).replace('li-' + this.cid + '-', '');
      this.model.set('class_name', this.list[ind]);
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