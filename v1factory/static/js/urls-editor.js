var UrlModel = Backbone.Model.extend({
  defaults : {
    urlparts : [],
    page_name : "defaults"
  }
});

var UrlsCollection = Backbone.Collection.extend({
  model: UrlModel
});

var UrlView = Backbone.View.extend({
  el: null,
  tagName: 'div',
  className: 'row span30 offset1 hoff1',
  events: {
    'change .url-part'      : 'urlPartChanged',
    'change .page'          : 'pageChanged',
    'click .cross'          : 'urlRemoved',
    'submit .add-page-form' : 'newPageSubmitted',
    'change .last'          : 'lastEntityChanged',
    'keypress .last'        : 'lastTextChanged'
  },

  initialize: function(item){
    var self = this;
    _.bindAll(this, 'render',
                    'remove',
                    'urlPartChanged',
                    'pageChanged',
                    'urlRemoved',
                    'newPageSubmitted',
                    'lastEntityChanged',
                    'lastTextChanged');
    this.model = item;
    if(!this.model.get('urlparts')) {
      this.model.set('urlparts', []);
    }
    this.render();
  },

  render: function() {
    var temp = document.getElementById('template-url').innerHTML;
    var html = _.template(temp, { 'urls': this.model.get('urlparts'),
                                  'entities': appState.entities,
                                  'pages': appState.pages,
                                  'page_name': this.model.get('page_name') });
    this.el.innerHTML = html;
  },

  urlPartChanged: function(e) {
    if(e.target.id == 'inp-new') {
      e.target.id = 'inp-' + this.model.get('urlparts').length;
      var value = e.target.value;
      if(e.target.tagName == 'SELECT') {
        value = '{{' + value + '}}';
      }
      this.model.get('urlparts').push(value);
    }
    else {
      var ind = String(e.target.id).replace('inp-','');
      this.model.get('urlparts')[ind] = e.target.value;
    }
  },

  pageChanged: function(e) {
    if(e.target.value == "<<new_page>>") {
      $(e.target).hide();
      $('.add-page-form', this.el).fadeIn();
      $('.page-name-input', this.el).focus();
      return;
    }

    this.model.set('page_name', e.target.value);
  },

  urlRemoved: function() {
    this.model.destroy();
    this.remove();
  },

  newPageSubmitted: function(e) {
    var name = $('.page-name-input', this.el).val();
    urlsEditor.createPage(name);
    e.preventDefault();
    $('.page-name-input').val('');
    $('.add-page-form').hide();
    $('select.page', this.el).fadeIn();
    $('select').append('<option>' + name + '</option>');
    $('select option:last', this.el).attr('selected','selected');
  },

  remove: function() {
    $(this.el).remove();
  },

  lastEntityChanged: function(e) {
    $(e.target).removeClass('last');
    var temp = document.getElementById('template-text').innerHTML;
    var html = _.template(temp, { 'urls': this.urlParts, 'entities': appState.entities, 'pages': appState.pages });
    $('.url', this.el).append(html);
  },

  lastTextChanged: function(e) {
    $(e.target).removeClass('last');
    var temp = document.getElementById('template-entity').innerHTML;
    var html = _.template(temp, { 'urls': this.urlParts, 'entities': appState.entities, 'pages': appState.pages });
    $('.url', this.el).append(html);
  }
});

var UrlsEditorView = Backbone.View.extend({
  el: document.getElementById('urls-editor'),

  initialize: function(){
    var self = this;
    _.bindAll(this, 'render',
                    'placeUrls',
                    'newWUrl',
                    'saveUrls',
                    'createPage');

    this.collection = new UrlsCollection();
    this.collection.bind('add', this.placeUrls);
    this.render();
    
    var initUrls = appState.urls || [];
    this.collection.add(initUrls);

    $('#create-url').on('click', this.newWUrl);
    $('#save-urls').on('click', this.saveUrls);
  },

  render: function() {

  },

  placeUrls: function(url) {
    var elem = new UrlView(url);
    this.el.appendChild(elem.el);
  },

  newWUrl: function(){
    var newModel = new UrlModel();
    this.collection.push(newModel);
  },

  saveUrls: function() {
    appState.urls = this.collection.toJSON();
    $.ajax({
      type: "POST",
      url: '/app/1/state/',
      data: JSON.stringify(appState),
      success: function() {},
      dataType: "JSON"
    });
  },

  createPage: function (name) {
    var newPage = new PageModel({ name: name});
    var pages = appState.pages;
    pages.push(newPage.toJSON());
    appState.pages = pages;
  }
});

var urlsEditor = new UrlsEditorView();