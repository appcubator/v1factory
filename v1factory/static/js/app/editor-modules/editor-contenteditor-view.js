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
  events : {
    'change select'            : 'inputChanged'
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
    var hash = e.target.id.replace('prop-', '');
    var info = hash.split('-');

    if(info.length == 2) {
            alert(e.target.value);
      this.model.get(info[0]).set(info[1], e.target.value);
    }
    else if(info.length == 1) {
      this.model.set(info[0], e.target.value);
    }
  },

  render: function() {
    var self = this;

    if(this.model.has('content')) {
      //this.el.appendChild(this.renderTextEditing());
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
    li.innerHTML = '<span class="key">Target</span>' + html;
    return li;
  },


  clear: function() {
    this.el.innerHTML = '';
    this.model = null;
  }
});
