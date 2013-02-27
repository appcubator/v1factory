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

var WidgetInfoView = Backbone.View.extend({
  el     : document.getElementById('item-info-list'),
  model  : null,
  events : {
    'change input' : 'inputChanged',
    'change select.statics' : 'staticsChanged'
  },

  initialize: function(){
    _.bindAll(this, 'render',
                    'show',
                    'showAttribute',
                    'inputChanged',
                    'changedProp');
    this.render();
  },

  render: function() {

  },

  show: function(widgetModel) {
    var self = this;

    this.el.innerHTML = '';
    this.model = widgetModel;
    this.model.bind("change", this.changedProp, this);

    _(widgetModel.attributes).each(function(val, key){
      if(key == 'id' || key == 'selected') return;
      self.el.appendChild(self.showAttribute(val, key, String('')));
    });
  },

  showAttribute: function(val, key, prop) {
    var self = this;
    var li = document.createElement('li');
    

    if(val!==null) {
      if(key == 'href') {
        var temp = document.getElementById('temp-href-select').innerHTML;
        var html = _.template(temp, {val : val, prop: prop});
        li.innerHTML = key + ' : '+ html;
      }
      else if(key == 'source') {
        var temp = document.getElementById('temp-source-select').innerHTML;
        var html = _.template(temp, {val : val, prop: prop});
        li.innerHTML = key + ' : '+ html;
      }
      else {
        li.innerHTML = key + ' : '+ '<input type="text" id="' + prop + '"value=' + val + '>';
      }

      li.id = 'prop-'+ key;
    }

    return li;
  },

  inputChanged: function(e) {
    var prop = e.target.parentNode.id.replace('prop-', '') + e.target.id;
    this.model.set(prop, e.target.value);
  },

  staticsChanged: function(e) {

  },

  changedProp: function(a, b) {
    _(a.changed).each(function(val, key) {
      if(document.getElementById('prop-' + key)) {
        $('input', document.getElementById('prop-' + key)).val(val);
      }
    });
  }
});
