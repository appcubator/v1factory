define([
  'backbone'
], function() {

  var WidgetContentEditorView = Backbone.View.extend({
    el     : document.getElementById('content-editor'),
    className : 'content-editor',
    tagName : 'ul',
    events : {
      'keyup input'         : 'inputChanged',
      'keyup textarea'      : 'inputChanged',
      'click #toggle-bold'  : 'toggleBold',
      'change .font-picker' : 'changeFont'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
                      'clear',
                      'inputChanged',
                      'toggleBold',
                      'changeFont');

      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;

      if(this.model.has('content') && this.model.get('content') !== null &&
        !this.model.get('content_attribs').has('src')) {

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
      var curStyle = (this.model.get('content_attribs').get('style')||'font-size:12px;');
      var currentFont = /font-size:([^]+);/g.exec(curStyle)[1];

      var sizeDiv = document.createElement('div');
      sizeDiv.className = 'size-picker';
      var hash     = 'content_attribs' + '-' + 'style';
      html         = '<select id="'+ hash +'" class="font-picker">' +
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
      sizeDiv.innerHTML = '<span class="key">Font Size</span>' + html;

      var optionsDiv = document.createElement('div');
      optionsDiv.className = 'font-options';
      optionsDiv.innerHTML = '<span id="toggle-bold" class="option-button"><strong>B</strong></span>';

      li.appendChild(sizeDiv);
      li.appendChild(optionsDiv);

      return li;
    },

    inputChanged: function(e) {
      var hash = e.target.id.replace('prop-', '');
      var info = hash.split('-');

      if(info.length == 2) {
        this.model.get(info[0]).set(info[1], e.target.value);
      }
      else if(info.length == 1) {
        this.model.set(info[0], e.target.value);
      }
      e.stopPropagation();
    },

    changeFont: function(e) {
      if(!this.model.get('content_attribs').has('style')) {
        this.model.get('content_attribs').set('style', 'font-size:12px;');
      }
      var curStyle = this.model.get('content_attribs').get('style');
      curStyle = curStyle.replace(/font-size:([a-z0-9]+);/g, e.target.value);
      this.model.get('content_attribs').set('style', curStyle);
    },

    toggleBold: function(e) {
      var curStyle = this.model.get('content_attribs').get('style');
      if(curStyle.indexOf('font-weight:bold;') < 0) {
        curStyle += 'font-weight:bold;';
        this.model.get('content_attribs').set('style', curStyle);
      }
      else {
        curStyle = curStyle.replace('font-weight:bold;', '');
        this.model.get('content_attribs').set('style', curStyle);
      }
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
      this.remove();
    }
  });

  return WidgetContentEditorView;
});

