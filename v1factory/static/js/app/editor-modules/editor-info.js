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
    'change select.statics' : 'staticsChanged',
    'change select'         : 'inputChanged',
    'click .width-full'     : 'toggleFullWidth'
  },

  initialize: function(widgetsCollection){
    _.bindAll(this, 'render',
                    'clear',
                    'show',
                    'doBindings',
                    'showAttribute',
                    'showCollection',
                    'staticsAdded',
                    'inputChanged',
                    'selectChanged',
                    'keydownInput',
                    'staticsChanged',
                    'showModel',
                    'optionChanged',
                    'changedProp');

    this.widgetsCollection = widgetsCollection;
    this.model = widgetsCollection.selectedEl;
    this.widgetsCollection.bind('change', this.selectChanged, this);
    if(this.widgetsCollection.selectedEl) {
      this.doBindings(this.model);
      this.render();
    }

    this.globalModels = [];
  },

  doBindings: function(model) {
    model.bind("change", this.changedProp, this);
    model.bind("remove", this.clear, this);
  },

  selectChanged : function(chg, ch2) {

    if(this.widgetsCollection.selectedEl === null) {
      this.model = null;
      this.el.innerHTML = '';
    }
    else if(this.widgetsCollection.selectedEl != this.model) {
      this.el.innerHTML = '';
      this.model = this.widgetsCollection.selectedEl;
      this.render();
    }
  },

  render: function() {

    this.list = document.createElement('ul');
    this.el.appendChild(this.list);
    iui.draggable(this.el);
    this.list.appendChild(this.showModel(this.model, this.model.get('type')||"Container"));
  },

  show: function(alphaVal, key, cid) {

    var li = document.createElement('li');

    if(alphaVal.models) {
      return this.showCollection(alphaVal, key);
    }
    else if(alphaVal.attributes) {
      return this.showModel(alphaVal, key);
    }
    else {
      //alert('yolo');
      return (this.showAttribute(alphaVal, key, cid));
    }

    return li;
  },

  showModel: function(widgetModel, key) {
    this.globalModels.push(widgetModel);
    this.doBindings(widgetModel);

    var list = document.createElement('ul');

    var self = this;

    var span = document.createElement('span');
    span.className = "title";
    span.innerText = (key) +" Info";
    list.appendChild(span);

    if(widgetModel.get('type')) {
      var elemPicker = document.createElement('select');
      elemPicker.id = 'prop-'+ widgetModel.cid +'-class_name';
      elemPicker.innerHTML = '';
      _(uieState[widgetModel.get('type')]).each(function(uie){

        selected = (uie.class_name == widgetModel.get('class_name'))? 'selected' : '';

        elemPicker.innerHTML += '<option '+ selected +'>' + uie.class_name + '</option>';
      });
      list.appendChild(elemPicker);
    }

    _(widgetModel.attributes).each(function(val, key){
      if( key == 'id' ||
          key == 'selected' ||
          key == 'lib_id' ||
          key == 'isSingle' ||
          key == 'tagName' ||
          key == 'tagType' ||
          key == 'type' ||
          key == 'Style' ||
          key == 'class_name' ||
          key == 'name' ||
          key == 'deletable') return;

      if(val === null) {
        return;
      }

      list.appendChild(self.show(val, key, widgetModel.cid));
    });

    return list;

  },

  showCollection: function(coll, collectionName) {

    var self = this;
    var li = document.createElement('li');
    li.className = 'model';

    var span = document.createElement('span');
    span.innerText = lang[collectionName]||"Sub-Elements";
    span.className = "title";

    var ul = document.createElement('ul');
    ul.className = 'sub-list';
    li.appendChild(span);
    li.appendChild(ul);

    _(coll.models).each(function(model) {
      var elem = self.show(model, (model.get('type')||"SubElement"));
      elem.className += 'sub-element';
      ul.appendChild(elem);
    });

    return li;
  },

  showAttribute: function(val, key, cid) {
    var temp, html;
    var self = this;
    var li = document.createElement('li');

    if(val!==null) {
      if(key == 'href') {
        var hash     = cid + '-' + key;
        temp         = document.getElementById('temp-href-select').innerHTML;
        html         = _.template(temp, {val : val, hash: hash});
        li.innerHTML = '<span class="key">'+(lang[key]||key)+'</span>' + html;
      }
      else if(key == 'src') {
        var hash     = cid + '-' + key;
        temp         = document.getElementById('temp-source-select').innerHTML;
        html         = _.template(temp, {val : val, hash: hash});
        li.innerHTML = '<span class="key">'+(lang[key]||key)+'</span>'+ html;
      }
      else if(key == 'width') {
        var hash     = cid + '-' + key;
        li.innerHTML =  '<span class="key">'+(lang[key]||key)+'</span>' +
                        '<input type="text" class="'+ hash +
                        '" id="prop-'+ hash + '"  value="' + val + '"><div class="width-full"></div>';
      }
      else {
        var hash     = cid + '-' + key;
        li.innerHTML =  '<span class="key">'+(lang[key]||key)+'</span>' +
                        '<input type="text" class="'+ hash +
                        '" id="prop-'+ hash + '"  value="' + val + '">';
      }
    }

    return li;
  },

  toggleFullWidth: function() {
    var isFull = this.model.get('layout').get('isFull');
    this.model.get('layout').set('isFull', !isFull);
  },

  inputChanged: function(e) {

    var hash = e.target.id.replace('prop-', '');
    var info = hash.split('-');
    var model = _.findWhere(this.globalModels, { cid : info[0] });

    if(model && info[1]) {
      model.set(info[1], e.target.value);
    }
    else {
      alert('something went wrong');
    }
  },

  optionChanged: function() {
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
      iui.openFilePick(function(files, f) {f(files);}, this.staticsAdded, appId);
    }
    else {
      this.model.get('content_attribs').set(prop, e.target.value);
    }
  },

  staticsAdded: function(files) {
    _(files).each(function(file){
      file.name = file.filename;
      statics.push(file);
    });
    this.model.get('content_attribs').set('src', _.last(files).url);
    //this.show(this.model);
  },

  changedProp: function(changedModel) {

    _(changedModel.changed).each(function(val, key) {
      if(document.getElementById('prop-' + changedModel.cid + '-' + key)) {
        $(document.getElementById('prop-' + changedModel.cid + '-' + key)).val(val);
      }
    });
  },

  keydownInput: function(e) {
    if(e.keyCode == 13) { e.target.blur(); }
    e.stopPropagation();
  },

  clear: function() {
    this.el.innerHTML = '';
    this.model = null;
  }
});
