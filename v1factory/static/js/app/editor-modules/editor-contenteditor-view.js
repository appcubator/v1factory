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
    'keydown input'   : 'inputChanged',
    'keydown textarea'   : 'inputChanged'
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
    e.stopPropagation();
    var hash = e.target.id.replace('prop-', '');
    var info = hash.split('-');

    if(info.length == 2) {
            alert(e.target.value);
      this.model.get(info[0]).set(info[1], e.target.value);
    }
    else if(info.length == 1) {
      console.log(e.target.value);
      this.model.set(info[0], e.target.value);
    }
  },

  render: function() {
    var self = this;

    console.log(this.model);
    if(this.model.has('content') && this.model.get('content') !== null) {
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


  clear: function() {
    this.el.innerHTML = '';
    this.model = null;
  }
});
