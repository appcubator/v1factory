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
  el     : document.getElementById('item-info-section'),
  model  : null,
  events : {
    'change input'          : 'inputChanged',
    'keydown input'         : 'keydownInput',
    'change select.statics' : 'staticsChanged'
  },

  initialize: function(widgetsCollection){
    _.bindAll(this, 'render',
                    'show',
                    'showAttribute',
                    'staticsAdded',
                    'inputChanged',
                    'keydownInput',
                    'staticsChanged',
                    'showModel',
                    'selectChanged',
                    'changedProp',
                    'changedContent',
                    'changedLayout');

    this.widgetsCollection = widgetsCollection;
    this.model = widgetsCollection.selectedEl;
    this.widgetsCollection.bind('change', this.selectChanged, this);
    if(this.widgetsCollection.selectedEl) {
      this.render();
    }
  },

  selectChanged : function(chg, ch2) {
    console.log(this.widgetsCollection.selectedEl );
    if(this.widgetsCollection.selectedEl === null) {
      this.model = null;
      this.el.innerHTML = '';
    }
    else if(this.widgetsCollection.selectedEl != this.model) {
      console.log("YOLO");
      this.el.innerHTML = '';
      this.model = this.widgetsCollection.selectedEl;
      this.render();
      this.show();
    }
  },

  render: function() {
    var span = document.createElement('span');
    span.className = "title";
    span.innerText = this.model.get('type')+" Info";
    this.list = document.createElement('ul');
    this.el.appendChild(span);
    this.el.appendChild(this.list);
    iui.draggable(this.el);
    this.show();
  },

  show: function() {
    var self = this;
    self.list.innerHTML =  '';

    this.model.bind("change", this.changedProp, this);
    this.model.bind("remove", this.hide, this);
    this.model.get('layout').bind("change", this.changedLayout, this);
    this.model.get('content').bind("change", this.changedContent, this);

    _(this.model.attributes).each(function(val, key){
      if(key == 'id' || key == 'selected'
                     || key == 'lib_id'
                     || key == 'container_info'
                     || key == 'isSingle'
                     || key == 'tagName') return;

      if(val && val.attributes) {
        self.list.appendChild(self.showModel(val, key));
      }
      else {
        self.list.appendChild(self.showAttribute(val, key, String('')));
      }
    });
  },

  showModel: function(model, modelName) {
    var self = this;
    var li = document.createElement('li');
    li.className = 'model';


    var span = document.createElement('span');
    span.innerText = lang[modelName]||modelName;
    span.className = "title";

    var ul = document.createElement('ul');
    ul.className = 'prop-' + modelName;

    _(model.attributes).each(function(val, key) {
      ul.appendChild(self.showAttribute(val, key, key, modelName));
    });

    li.appendChild(span);
    li.appendChild(ul);
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
        li.innerHTML = '<span class="key">'+(lang[key]||key)+'</span>' + html;
      }
      else if(key == 'src') {
        temp         = document.getElementById('temp-source-select').innerHTML;
        html         = _.template(temp, {val : val, prop: prop});
        li.innerHTML = '<span class="key">'+(lang[key]||key)+'</span>'+ html;
      }
      else {
        var hash     = modelName + '-' + key;
        li.innerHTML =  '<span class="key">'+(lang[key]||key)+'</span>' +
                        '<input type="text" class="'+ hash +
                        '" id="prop-'+ hash + '"  value="' + val + '">';
      }
    }

    return li;
  },

  inputChanged: function(e) {
    var prop = e.target.id.replace('prop-', '');
    var props = prop.split('-');

    if(props.length > 1) {
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
      this.model.get('attribs').set(prop, e.target.value);
    }
  },

  staticsAdded: function(files) {
    _(files).each(function(file){
      file.name = file.filename;
      statics.push(file);
    });
    this.model.get('attribs').set('src', _.last(files).url);
    this.show(this.model);
  },

  changedProp: function(changedModel) {
    _(changedModel.changed).each(function(val, key) {
      if(document.getElementById('prop-' + key)) {
        $('input', document.getElementById('prop-' + key)).val(val);
      }
    });
  },

  changedContent: function(changedContextModel) {
    _(changedContextModel.changed).each(function(val, key) {
      $(document.getElementById('prop-context-' + key)).val(val);
    });
  },

  changedLayout: function(changedLayoutModel) {
    _(changedLayoutModel.attributes).each(function(val, key) {
      $(document.getElementById('prop-layout-' + key)).val(val);
    });
  },

  keydownInput: function(e) {
    if(e.keyCode == 13) { e.target.blur(); }
    e.stopPropagation();
  }
});
