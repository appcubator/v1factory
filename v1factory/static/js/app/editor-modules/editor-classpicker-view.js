/*
 *  Editor - Widget Info
 *  Written by icanberk
 *
 *  Abstract:
 *  This module creates the info view on the right of
 *  the page. On any change, it changes the related
 *  attribute of the currently selected widget.
 *
 *  Includes:
 *  - WidgetInfoView
 *
 */

var WidgetClassPickerView = Backbone.View.extend({
  el     : document.getElementById('class-picker'),
  events : {
    // 'change input'          : 'inputChanged',
    // 'keydown input'         : 'keydownInput',
    // 'change select.statics' : 'staticsChanged',
    // 'change select'         : 'inputChanged',
    'click .class-name-item'     : 'classChanged'
  },

  initialize: function(widgetsCollection){
    _.bindAll(this, 'render',
                    'clear',
                    'selectChanged',
                    'classChanged');

    this.widgetsCollection = widgetsCollection;
    this.model = widgetsCollection.selectedEl;
    this.widgetsCollection.bind('change', this.selectChanged, this);
    if(this.widgetsCollection.selectedEl) {
      this.render();
    }
  },

  classChanged: function(e) {
    var newClass = (e.target.id||e.target.parentNode.id);
    console.log(newClass);
    this.model.set('class_name', newClass);
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
    var self = this;
    this.list = document.createElement('ul');
    var type = this.model.get('type');

    _(uieState[type]).each(function(uie){

      var li = document.createElement('li');
      li.className = 'class-name-item';
      if(self.model.get('class_name') == uie.class_name) {
        li.className +=' selected';
      }

      li.id = uie.class_name;

      if(type == 'image') {
       li.innerHTML = (uie.name||uie.class_name);
      }
      else {
        li.innerHTML = '<div class="node" id="'+ uie.class_name+'">'+ self.renderNode(uie)+'</div>';
      }

      self.list.appendChild(li);
    });

    this.el.appendChild(this.list);
  },

  renderNode: function(uie) {
    var temp = document.getElementById('temp-node').innerHTML;
    var el = _.template(temp, { element: uie});
    return el;
  },

  clear: function() {
    this.el.innerHTML = '';
    this.model = null;
  }
});