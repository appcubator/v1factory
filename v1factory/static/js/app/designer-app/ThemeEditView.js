define([
  'backboneui',
  'app/designer-app/UIElementListView',
  'app/models/PageDesignModel',
  'iui',
  '../templates/ThemeTemplates'
],function(BackboneUI,
           UIElementListView,
           PageDesignModel) {

  var UIElementAttributesModel = Backbone.Model.extend({ });

  var UIElementStyleModel = Backbone.Model.extend({ });

  var ThemeEditView = Backbone.View.extend({
    el: document.body,
    events: {
      'click #save'        : 'save',
      'click .expandible'  : 'expandSection',
      'keyup #base-css'    : 'baseChanged',
      'click #create-page' : 'pageCreateClicked',
      'submit .create-page-form' : 'pageCreateSubmitted',
      'click #upload-static' : 'uploadStatic'
    },

    initialize: function(themeModel) {
      _.bindAll(this,'save',
                     'render',
                     'expandSection',
                     'baseChanged',
                     'pageCreateSubmitted',
                     'uploadStatic');

      var self = this;
      this.model = themeModel;
      this.render();

      var buttonView     = new UIElementListView(this.model.get('buttons'), 'button');
      iui.get('button-cont').appendChild(buttonView.el);
      var imageView      = new UIElementListView(this.model.get('images'), 'image');
      iui.get('image-cont').appendChild(imageView.el);
      var headerTextView = new UIElementListView(this.model.get('headerTexts'), 'header-text');
      iui.get('header-text-cont').appendChild(headerTextView.el);
      var textView       = new UIElementListView(this.model.get('texts'), 'text');
      iui.get('text-cont').appendChild(textView.el);
      var linkView       = new UIElementListView(this.model.get('links'), 'link');
      iui.get('link-cont').appendChild(linkView.el);
      var textInputView  = new UIElementListView(this.model.get('textInputs'), 'text-input');
      iui.get('text-input-cont').appendChild(textInputView.el);
      var passwordView   = new UIElementListView(this.model.get('passwords'), 'password');
      iui.get('password-cont').appendChild(passwordView.el);
      var textAreaView   = new UIElementListView(this.model.get('textAreas'), 'text-area');
      iui.get('text-area-cont').appendChild(textAreaView.el);
      var lineView       = new UIElementListView(this.model.get('lines'), 'line');
      iui.get('line-cont').appendChild(lineView.el);
      var dropdownView   = new UIElementListView(this.model.get('dropdowns'), 'dropdown');
      iui.get('dropdown-cont').appendChild(dropdownView.el);
      var boxView        = new UIElementListView(this.model.get('boxes'), 'box');
      iui.get('box-cont').appendChild(boxView.el);

      this.model.get('pages').bind('add', this.renderPage);
    },

    render: function() {
      var self = this;
      iui.get('base-css').value = this.model.get('basecss');
      _(this.model.get('pages').models).each(function(page, ind) {
        console.log(ind);
        self.renderPage(page, ind);
      });

      _(statics).each(function(file) {
        iui.get('statics-cont').innerHTML += '<img width="100" src="'+ file.url +'">' + file.name;
      })
      console.log(statics);
    },

    baseChanged: function(e) {

      // height: 3901px;
      // line-height: 18px;
      // margin-bottom: 0px;
      // margin-left: 0px;
      // margin-right: 0px;
      // margin-top: 0px;
      // overflow-x: hidden;
      // padding-bottom: 0px;
      // padding-left: 0px;
      // padding-right: 0px;
      // padding-top: 0px;
      // position: relative;
      // width: 1125px;

      var currentCSS = e.target.value;

      var bodyRegExp = /body \{([^\}]+)\}/g;
      var marginRegExp = /margin:([^\}]+);/g;

      // var content = bodyRegExp.exec(currentCSS)[1].replace(marginRegExp,"heyyo");
      // console.log(content);
      // currentCSS = currentCSS.replace(bodyRegExp, content);

      // console.log(currentCSS);

      //
      //var bodyStyles = [];
      // while((curArr = bodyRegExp.exec(currentCSS))!== null) {
      //   bodyStyles.push(curArr);
      // }
      // bodyStyles[0][1] = '';
      //console.log(bodyStyles);

      this.model.set('basecss', currentCSS);
    },

    renderPage: function(page, ind) {
      var pages = iui.get('pages-list');
      console.log(pages);
      var cInd = ind;
      if(ind === null) {
        cInd = (this.model.get('pages').models.length);
      }
      if(typeof cInd != "number") {
        cInd = cInd.models.length -1;
      }

      pages.innerHTML += '<li><a href="/theme/'+ themeId +'/editor/' + cInd +'">' + page.get('name') + '</a></li>';
    },

    expandSection: function(e) {
      $('.expanded').removeClass('expanded');
      $('#' + e.target.parentNode.id + "-cont").addClass('expanded');
    },

    pageCreateClicked: function(e) {
      $(e.target).hide();
      $('.create-page-form').fadeIn();
      $('.create-page-name').focus();
    },

    pageCreateSubmitted: function(e) {
      e.preventDefault();
      var name =  $('.create-page-name').val();
      var newPage = new PageDesignModel({name: name});
      $('.create-page-name').val('');
      this.model.get('pages').add(newPage);
      $('.create-page-form').hide();
      $('#create-page').fadeIn();
    },

    uploadStatic: function() {
      var self = this;
      iui.openThemeFilePick(self.staticsAdded, self, themeId);
    },

    staticsAdded: function(files, self) {
      console.log(files);
      // _(files).each(function(file){
      //   file.name = file.filename;
      //   statics.push(file);
      // });
      // self.model.get('content_attribs').set('src', _.last(files).url);
    },

    save: function() {
      var json = _.clone(this.model.attributes);
      console.log(json);
      json["button"]     = this.model.get('buttons').toJSON()||{};
      json["image"]      = this.model.get('images').toJSON()||{};
      json["header-text"]= this.model.get('headerTexts').toJSON()||{};
      json["text"]       = this.model.get('texts').toJSON()||{};
      json["link"]       = this.model.get('links').toJSON()||{};
      json["text-input"] = this.model.get('textInputs').toJSON()||{};
      json["password"]   = this.model.get('passwords').toJSON()||{};
      json["text-area"]  = this.model.get('textAreas').toJSON()||{};
      json["line"]       = this.model.get('lines').toJSON()||{};
      json["dropdown"]   = this.model.get('dropdowns').toJSON()||{};
      json["box"]        = this.model.get('boxes').toJSON()||{};

      $.ajax({
        type: "POST",
        url: '/theme/'+themeId+'/edit/',
        data: { uie_state : JSON.stringify(json) },
        success: function() { },
        dataType: "JSON"
      });
    }
  });

  return ThemeEditView;
});
