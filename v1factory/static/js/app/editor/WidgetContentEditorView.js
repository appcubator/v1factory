define([
  'backbone'
],
function(WidgetClassPickerView) {

  var WidgetContentEditorView = Backbone.View.extend({
    el     : document.getElementById('content-editor'),
    className : 'content-editor',
    tagName : 'ul',
    events : {
      'keyup input'                 : 'inputChanged',
      'keyup textarea'              : 'inputChanged',
      'keydown input'               : 'inputChanged',
      'keydown textarea'            : 'inputChanged',
      'click #toggle-bold'          : 'toggleBold',
      'change .font-picker'         : 'changeFont',
      'change .statics'             : 'changeSrc',
      'change .select-href'         : 'changeHref',
      'submit #external-link-form'  : 'addExternalLink'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
                      'clear',
                      'inputChanged',
                      'toggleBold',
                      'changeFont',
                      'changeSrc',
                      'changeHref',
                      'renderFontPicker',
                      'renderTextEditing',
                      'addExternalLink');

      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;
      if(this.model.has('content') && this.model.get('content') !== null &&
        !this.model.get('content_attribs').has('src') &&
        this.model.get('type') != "images" &&
        this.model.get('type') != "buttons") {

        this.el.appendChild(this.renderFontPicker());
        this.el.appendChild(this.renderTextEditing());
      }

      if(this.model.get('content_attribs').has('href')) {
        this.el.appendChild(this.renderHrefInfo());
      }

      if(this.model.get('content_attribs').has('src')) {
        this.el.appendChild(this.renderSrcInfo());
        this.el.appendChild(this.renderHrefInfo());
      }
    },

    renderHrefInfo: function() {
      if(!this.hrefLi) {
        this.hrefLi = document.createElement('li');
      }

      var hash     = 'content_attribs' + '-' + 'href';
      temp         = Templates.tempHrefSelect;
      listOfPages  = this.model.getListOfPages();

      var external;
      if(String(this.model.get('content_attribs').get('href')).indexOf('internal://') < 0) {
        external = this.model.get('content_attribs').get('href');
      }

      html         = _.template(temp, { val : this.model.get('content_attribs').get('href'),
                                        hash: hash,
                                        listOfPages: listOfPages,
                                        external: external});

      this.hrefLi.appendChild(new comp().div('Target').classN('key').el);
      this.hrefLi.innerHTML += html;

      return this.hrefLi;
    },

    renderSrcInfo: function() {
      var li       = document.createElement('li');
      var hash     = 'content_attribs' + '-' + 'src';
      temp         = Templates.tempSourceSelect;
      html         = _.template(temp, {val : this.model.get('content_attribs').get('src'), hash: hash});
      li.appendChild(new comp().div('Image Source').classN('key').el);
      li.innerHTML += html;
      return li;
    },

    renderTextEditing: function() {
      var li       = document.createElement('li');
      li.appendChild(new comp().div('Text').classN('key').el);
      li.appendChild(new comp().textarea(this.model.get('content')).id('prop-content').el);
      return li;
    },

    renderFontPicker: function() {
      var li       = document.createElement('li');
      var curStyle = (this.model.get('content_attribs').get('style')||'font-size:default;');

      var currentFont;
      if(/font-size:([^]+);/g.exec(curStyle)) {
        currentFont = /font-size:([^]+);/g.exec(curStyle)[1];
      }
      else {
        currentFont = "font-size:default;";
      }

      var sizeDiv = document.createElement('div');
      sizeDiv.className = 'size-picker';
      var hash     = 'content_attribs' + '-' + 'style';
      var sizeSelect = new comp().select('').id(hash).classN('font-picker');

      _(['default', '10px', '14px', '16px', '18px', '20px']).each(function(val) {
        sizeSelect.option(val).valProp('font-size:' + val + ';');
      });

      sizeDiv.innerHTML = '<span class="key">Font Size</span>';
      sizeDiv.appendChild(sizeSelect.el);
      var optionsDiv = document.createElement('div');
      optionsDiv.className = 'font-options';
      optionsDiv.innerHTML = '<span id="toggle-bold" class="option-button"><strong>B</strong></span>';

      li.appendChild(sizeDiv);
      li.appendChild(optionsDiv);

      $(sizeDiv).find('option[value="font-size:'+currentFont+';"]').prop('selected', true);
      return li;
    },

    inputChanged: function(e) {
      e.stopPropagation();
      var hash = e.target.id.replace('prop-', '');
      var info = hash.split('-');

      if(info.length == 2) {
        this.model.get(info[0]).set(info[1], e.target.value);
      }
      else if(info.length == 1) {
        this.model.set(info[0], e.target.value);
      }
    },

    changeFont: function(e) {
      if(!this.model.get('content_attribs').has('style')) {
        this.model.get('content_attribs').set('style', 'font-size:12px;');
      }
      var curStyle = this.model.get('content_attribs').get('style');

      if(/font-size:([^]+);/g.exec(curStyle)) {
        curStyle = curStyle.replace(/(font-size:)(.*?)(;)/gi, "$1"+ e.target.value +"$3");
      }
      else {
        curStyle = curStyle + ' font-size:' + e.target.value +';';
      }

      this.model.get('content_attribs').set('style', curStyle);
    },

    toggleBold: function(e) {
      var curStyle = (this.model.get('content_attribs').get('style')||'');
      if(curStyle.indexOf('font-weight:bold;') < 0) {
        curStyle += 'font-weight:bold;';
        this.model.get('content_attribs').set('style', curStyle);
      }
      else {
        curStyle = curStyle.replace('font-weight:bold;', '');
        this.model.get('content_attribs').set('style', curStyle);
      }
    },

    staticsAdded: function(files, self) {
      _(files).each(function(file){
        file.name = file.filename;
        statics.push(file);
      });
      self.model.get('content_attribs').set('src', _.last(files).url);
      self.model.set('content', _.last(files).url);
    },

    changeSrc: function(e) {
      var self = this;
      if(e.target.value == 'upload-image') {
        iui.openFilePick(self.staticsAdded, self, appId);
      }
      else {
        this.model.get('content_attribs').set('src', e.target.value);
        this.model.set('content', e.target.value);
      }
    },

    changeHref: function(e) {
      var self = this;
      var target = e.target.value;

      console.log(self.hrefLi);
      console.log(self);

      if(target == "external-link") {
        self.hrefLi.innerHTML = '<form id="external-link-form"><input id="external-link-input" type="text"></form>';
        $('#external-link-input').focus();  
      }
      else if(this.model.get('context')) {
        target += ('/' + this.model.get('context'));
      }
      this.model.get('content_attribs').set('href', target);
    },

    addExternalLink: function(e) {
      e.preventDefault();
      var page_link = iui.get('external-link-input').value;
      this.model.get('content_attribs').set('href', page_link);
      $('#external-link-form').remove();
      this.renderHrefInfo();
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
      this.remove();
    }
  });

  return WidgetContentEditorView;
});

