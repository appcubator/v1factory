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

var WidgetContentEditorView = Backbone.View.extend({
  el     : document.getElementById('content-editor'),
  className : 'content-editor',
  tagName : 'ul',
  events : {
    'change select'   : 'inputChanged',
    'keyup input'   : 'inputChanged',
    'keyup textarea': 'inputChanged'
  },

  initialize: function(widgetsCollection){
    _.bindAll(this, 'render',
                    'clear',
                    'selectChanged',
                    'inputChanged');

    this.widgetsCollection = widgetsCollection;
    this.model = widgetsCollection.selectedEl;
    this.widgetsCollection.bind('change', this.selectChanged, this);
    if(this.widgetsCollection.selectedEl) {
      this.render();
    }
  },

  render: function() {
    var self = this;

    console.log(this.model);
    if(this.model.has('content') && this.model.get('content') !== null) {
      this.el.appendChild(this.renderFontPicker());
      this.el.appendChild(this.renderTextEditing());
    }
    if(this.model.get('content_attribs').has('href')) {
      this.el.appendChild(this.renderHrefInfo());
    }
  },

  renderHrefInfo: function() {
    var li       = document.createElement('li');
    var hash     = 'content_attribs' + '-' + 'href';
    temp         = Templates.tempHrefSelect;
    html         = _.template(temp, {val : this.model.get('content_attribs').get('href'), hash: hash});
    li.innerHTML = '<span class="key" style="display:block;">Target</span>' + html;
    return li;
  },

  renderTextEditing: function() {
    var li       = document.createElement('li');
    var hash     = 'content';
    html         = '<textarea id="prop-content">'+ this.model.get('content')+'</textarea>';
    li.innerHTML = '<span class="key" style="display:block;">Text</span>' + html;
    return li;
  },

  renderFontPicker: function() {
    var li       = document.createElement('li');
    var currentFont = (this.model.get('content_attribs').get('style')||'font-size:12px').replace('font-size:','');

    var hash     = 'content_attribs' + '-' + 'style';
    html         = '<select id="'+ hash +'">' +
                      '<option value="font-size:'+ currentFont +';">'+ currentFont +'</option>'+
                      '<option value="font-size:10px;">'+ '10px' +'</option>'+
                      '<option value="font-size:12px;">'+ '12px' +'</option>'+
                      '<option value="font-size:14px;">'+ '14px' +'</option>'+
                      '<option value="font-size:16px;">'+ '16px' +'</option>'+
                      '<option value="font-size:16px;">'+ '18px' +'</option>'+
                      '<option value="font-size:20px;">'+ '20px' +'</option>'+
                      '<option value="font-size:24px;">'+ '24px' +'</option>'+
                      '<option value="font-size:32px;">'+ '32px' +'</option>'+
                      '<option value="font-size:40px;">'+ '40px' +'</option>'+
                      '<option value="font-size:48px;">'+ '48px' +'</option>'+
                      '<option value="font-size:52px;">'+ '52px' +'</option>'+
                      '<option value="font-size:64px;">'+ '64px' +'</option>'+
                      '<option value="font-size:72px;">'+ '72px' +'</option>'+
                      '<option value="font-size:90px;">'+ '90px' +'</option>'+
                    '</select>';
    li.innerHTML = '<span class="key" style="display:block;">Font Size</span>' + html;
    return li;
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

  inputChanged: function(e) {
    var hash = e.target.id.replace('prop-', '');
    var info = hash.split('-');

    if(info.length == 2) {
      this.model.get(info[0]).set(info[1], e.target.value);
    }
    else if(info.length == 1) {
      console.log(e.target.value);
      this.model.set(info[0], e.target.value);
    }
    //e.stopPropagation();
  },

  clear: function() {
    this.el.innerHTML = '';
    this.model = null;
  }
});
