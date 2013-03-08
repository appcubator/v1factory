/*
 *  Editor - Widget Info
 *  Written by icanberk
 *
 *  Abstract:
 *  This module creates the list of widgets
 *  that appears on the lef ofthe page.
 *  On any select, it triggers the select method
 *  of the related widget.
 *
 *  Includes:
 *
 */

var WidgetMenuView = Backbone.View.extend({
  el : document.getElementById('widget-list'),

  initialize: function(widgetCollection){
    _.bindAll(this, 'render',
                    'addMenuItem',
                    'removeListItem',
                    'change');

    this.render();
    this.collection = widgetCollection;
    this.collection.bind('remove', this.removeListItem);
    this.collection.bind('add', this.addMenuItem);
    this.collection.bind('change', this.change);
  },

  render: function() {
    this.el.innerHTML = '';
  },

  addMenuItem: function(elem) {
    var item = document.createElement('li');
    item.innerHTML = elem.get('type');
    item.id = 'item-'+ elem.cid;
    $(item).on('click', elem.select);
    $(this.el).append(item);
  },

  removeListItem: function(item) {
    elem = document.getElementById('item-' + item.cid);
    $(elem).remove();
  },

  change: function(item) {
    if(item.changed.selected === false) {
      $('#item-' + item.cid).removeClass('selected');
    }
    if(item.changed.selected === true) {
      $('#item-' + item.cid).addClass('selected');
    }
  }
});
