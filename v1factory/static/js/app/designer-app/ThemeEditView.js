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
      'submit .create-page-form' : 'pageCreateSubmitted'
    },

    initialize: function(themeModel) {
      _.bindAll(this,'save',
                     'render',
                     'expandSection',
                     'baseChanged',
                     'pageCreateSubmitted');

      var self = this;
      this.model = themeModel;
      this.render();

      var buttonView     = new UIElementListView(this.model.get('buttons'), 'button');
      iui.get('button').appendChild(buttonView.el);
      var imageView      = new UIElementListView(this.model.get('images'), 'image');
      iui.get('image').appendChild(imageView.el);
      var headerTextView = new UIElementListView(this.model.get('headerTexts'), 'header-text');
      iui.get('header-text').appendChild(headerTextView.el);
      var textView       = new UIElementListView(this.model.get('texts'), 'text');
      iui.get('text').appendChild(textView.el);
      var linkView       = new UIElementListView(this.model.get('links'), 'link');
      iui.get('link').appendChild(linkView.el);
      var textInputView  = new UIElementListView(this.model.get('textInputs'), 'text-input');
      iui.get('text-input').appendChild(textInputView.el);
      var passwordView   = new UIElementListView(this.model.get('passwords'), 'password');
      iui.get('password').appendChild(passwordView.el);
      var textAreaView   = new UIElementListView(this.model.get('textAreas'), 'text-area');
      iui.get('text-area').appendChild(textAreaView.el);
      var lineView       = new UIElementListView(this.model.get('lines'), 'line');
      iui.get('line').appendChild(lineView.el);
      var dropdownView   = new UIElementListView(this.model.get('dropdowns'), 'dropdown');
      iui.get('dropdown').appendChild(dropdownView.el);
      var boxView        = new UIElementListView(this.model.get('boxes'), 'box');
      iui.get('box').appendChild(boxView.el);

      this.model.get('pages').bind('add', this.renderPage);
    },

    render: function() {
      var self = this;
      iui.get('base-css').value = this.model.get('basecss');
      _(this.model.get('pages').models).each(function(page, ind) {
        console.log(ind);
        self.renderPage(page, ind);
      });
    },

    baseChanged: function(e) {
      this.model.set('basecss', e.target.value);
    },

    renderPage: function(page, ind) {
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
      $(e.target.parentNode).toggleClass('expanded');
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

    save: function() {
      var json = _.clone(this.attributes);
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
