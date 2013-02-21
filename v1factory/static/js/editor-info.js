var WidgetInfoView = Backbone.View.extend({
  el : document.getElementById('item-info-list'),
  model: null,
  events : {
    'change input' : 'inputChanged'
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

  show: function(model) {
    this.el.innerHTML = '';
    var self = this;
    this.model = model;
    this.model.bind("change", this.changedProp, this);

    _(model.attributes).each(function(val, key){
      if(key == 'id' || key == 'selected') return;
      self.el.appendChild(self.showAttribute(val, key, String('')));
    });
  },

  showAttribute: function(val, key, prop) {
    var self = this;
    var li = document.createElement('li');
    li.innerHTML = key + ' : '+ '<input type="text" id="' + prop + '"value=' + val + '>';
    li.id = 'prop-'+ key;
    return li;
  },

  inputChanged: function(e) {
    var prop = e.target.parentNode.id.replace('prop-', '') + e.target.id;
    this.model.set(prop, e.target.value);
  },

  changedProp: function(a, b) {
    _(a.changed).each(function(val, key) {
      if(document.getElementById('prop-' + key)) {
        $('input', document.getElementById('prop-' + key)).val(val);
      }
    });
  }
});