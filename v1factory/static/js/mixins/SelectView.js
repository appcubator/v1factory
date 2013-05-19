define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  SelectView = Backbone.View.extend({
    tagName: 'div',
    className : 'select-view',

    events: {
      'click' : 'expand'
    },

    initialize: function(list, currentVal, isNameVal) {
      _.bindAll(this, 'render', 'expand');

      this.list = list;
      this.currentVal = currentVal;
      this.isNameVal = isNameVal || false;

      this.render();
      return this;
    },

    render: function() {
      var self = this;
      var list = document.createElement('ul');

      var currentLi = document.createElement('li');
      currentLi.innerText = this.currentVal;
      currentLi.className = 'selected';
      list.appendChild(currentLi);

      _(this.list).each(function(val, ind) {
        if(val == self.currentVal) return;
        var li = document.createElement('li');
        li.id = 'li-' + self.cid + '-' + ind;
        val = val;
        if(self.isNameVal) { val = val.name; }
        li.innerText = val;
        list.appendChild(li);
      });

      var handle = document.createElement('div');
      handle.className = "updown-handle";
      this.handle = handle;

      this.el.appendChild(handle);
      this.el.appendChild(list);

      return this;
    },

    expand: function(e) {
      this.el.style.height = this.list.length * 40 + 'px';
      e.stopPropagation();
    }

  });

  return SelectView;

});
