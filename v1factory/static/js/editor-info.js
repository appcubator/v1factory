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
                    'staticsAdded',
                    'inputChanged',
                    'staticsChanged',
                    'showModel',
                    'changedProp',
                    'changedContext',
                    'changedLayout');
    this.render();
  },

  render: function() {

  },

  show: function(widgetModel) {
    $(this.el).fadeIn();
    var self = this;

    console.log(this);


    this.el.innerHTML = '';
    this.model = widgetModel;
    this.model.bind("change", this.changedProp, this);
    this.model.bind("remove", this.hide, this);
    this.model.get('layout').bind("change", this.changedLayout, this);
    this.model.get('context').bind("change", this.changedContext, this);

    _(widgetModel.attributes).each(function(val, key){
      if(key == 'id' || key == 'selected' || key == 'lib_id') return;

      if(val && val.attributes) {
        self.el.appendChild(self.showModel(val, key));
      }
      else {
        self.el.appendChild(self.showAttribute(val, key, String('')));
      }
    });
  },

  showModel: function(model, modelName) {
    var self = this;
    var li = document.createElement('li');
    li.className = 'model';
    

    var span = document.createElement('span');
    span.innerText = lang[modelName];
    span.className = "title";

    var ul = document.createElement('ul');
    ul.className = 'prop-' + modelName;

    _(model.attributes).each(function(val, key) {
      ul.appendChild(self.showAttribute(val, key, key, modelName));
    });

    li.appendChild(span);
    li.appendChild(ul);
    console.log(li);
    return li;
  },

  showAttribute: function(val, key, prop, modelName) {
    var temp, html;
    var self = this;
    var li = document.createElement('li');
    
    if(val!==null) {
      if(key == 'href') {
        temp         = document.getElementById('temp-href-select').innerHTML;
        html         = _.template(temp, {val : val, prop: prop});
        li.innerHTML = '<span class="key">'+lang[key]+'</span>' + html;
      }
      else if(key == 'source') {
        temp         = document.getElementById('temp-source-select').innerHTML;
        html         = _.template(temp, {val : val, prop: prop});
        li.innerHTML = '<span class="key">'+lang[key]+'</span>'+ html;
      }
      else {
        var hash     = modelName + '-' + key;
        li.innerHTML =  '<span class="key">'+lang[key]+'</span>' +
                        '<input type="text" class="'+ hash +
                        '" id="prop-'+ hash + '"  value=' + val + '>';
      }
    }

    return li;
  },

  inputChanged: function(e) {
    var prop = e.target.id.replace('prop-', '');
    var props = prop.split('-');

    if(props.length > 1) {
      console.log(props);
      this.model.get(props[0]).set(props[1], e.target.value);
    }
    else {
      this.model.set(prop, e.target.value);
    }
  },

  staticsChanged: function(e) {
    var prop = e.target.id.replace('prop-', '');
    
    if(e.target.value == "upload-image") {
      iui.openFilePick(function(files, f) {f(files);}, this.staticsAdded);
    }
    else {
      this.model.get('context').set(prop, e.target.value);
    }
  },

  staticsAdded: function(files) {
    _(files).each(function(file){
      file.name = file.filename;
      statics.push(file);
    });
    this.model.get('context').set('source', _.last(files).url);
    this.show(this.model);
  },

  changedProp: function(changedModel) {
    _(changedModel.changed).each(function(val, key) {
      if(document.getElementById('prop-' + key)) {
        $('input', document.getElementById('prop-' + key)).val(val);
      }
    });
  },

  changedContext: function(changedContextModel) {
    _(changedContextModel.changed).each(function(val, key) {
      if(document.getElementById('prop-context-' + key)) {
        $(document.getElementById('prop-context-' + key)).val(val);
      }
    });
  },

  changedLayout: function(changedLayoutModel) {
    _(changedLayoutModel.attributes).each(function(val, key) {
      if(document.getElementById('prop-layout-' + key)) {
        $(document.getElementById('prop-layout-' + key)).val(val);
      }
    });
  }
});
