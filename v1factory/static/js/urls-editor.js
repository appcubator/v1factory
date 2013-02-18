var entities = ['Post', 'Tweet'];

var UrlModel = Backbone.Model.extend({

});

var UrlsCollection = Backbone.Collection.extend({
  model: UrlModel
});

var UrlView = Backbone.View.extend({
  el: null,
  tagName: 'div',
  className: 'row span30 offset1 hoff1',
  events: {
    'change .url-part' : 'urlPartChanged',
    'change .page' : 'pageChanged',
    'click .cross' : 'urlRemoved',
    'submit .add-page-form' : 'newPageSubmitted',
    'change .last' : 'lastEntityChanged',
    'keypress .last': 'lastTextChanged'
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
      console.log("YOLO");
      this.model.set('urlparts', []);
    }
    this.urlParts = this.model.get('urlparts');
    this.render();
  },

  render: function() {
    var temp = document.getElementById('template-url').innerHTML;
    console.log(this.urlParts);
    var html = _.template(temp, { 'urls': this.urlParts, 'entities': entities, 'pages': appState.pages });
    this.el.innerHTML = html;
  },

  urlPartChanged: function(e) {
    console.log("CHANGEd");
    console.log(e.target.tagName);
    if(e.target.id == 'inp-new') {
      e.target.id = 'inp-' + this.model.get('urlparts').length;
      var value = e.target.value;
      if(e.target.tagName == 'SELECT') {
        console.log("YOLOOO");
        value = '{{' + value + '}}';
      }
      this.model.get('urlparts').push(value);
    }
    else {
      var ind = String(e.target.id).replace('inp-','');
      this.model.get('urlParts')[ind] = e.target.value;
    }
  },

  pageChanged: function(e) {
    if(e.target.value == "<<new_page>>") {
      $(e.target).hide();
      $('.add-page-form').fadeIn();
      $('.page-name-input').focus();
      return;
    }

    this.model.set('page_name', e.target.value);
  },

  urlRemoved: function() {
    this.model.destroy();
    this.remove();
  },

  newPageSubmitted: function(e) {
    var name = $('.page-name-input').val();
    $('.page-name-input').val('');
    $('.add-page-form').hide();
    $('select.page', this.el).fadeIn();
    $('select').append('<option>' + name + '</option>');

    urlsEditor.createPage(name);

    e.preventDefault();
  },

  remove: function() {
    $(this.el).remove();
  },

  lastEntityChanged: function(e) {
    $(e.target).removeClass('last');
    var temp = document.getElementById('template-text').innerHTML;
    var html = _.template(temp, { 'urls': this.urlParts, 'entities': entities, 'pages': appState.pages });
    $('.url', this.el).append(html);
  },

  lastTextChanged: function(e) {
    $(e.target).removeClass('last');
    var temp = document.getElementById('template-entity').innerHTML;
    var html = _.template(temp, { 'urls': this.urlParts, 'entities': entities, 'pages': appState.pages });
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
                    'serializeUrls',
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
    console.log(url);
    var elem = new UrlView(url);
    this.el.appendChild(elem.el);
  },

  newWUrl: function(){
    var newModel = new UrlModel({ urlParts: []});
    this.collection.push(newModel);
  },

  saveUrls: function() {
    var serialized = this.serializeUrls(this.collection.models);
    console.log(serialized);
    appState.urls = serialized;
    $.ajax({
      type: "POST",
      url: '/app/1/state/',
      data: JSON.stringify(appState),
      success: function() {

      },
      dataType: "JSON"
    });

  },

  createPage: function (name) {
    var pages = appState.pages;
    pages.push({
      name: name,
      uielements: []
    });
    appState.pages = pages;
  },

  serializeUrls: function(models) {
    var urls = [];
    _(models).each(function(model) {
      var url = {};
      url.page_name = model.get('page_name');
      url.urlparts = model.get('urlparts');
      urls.push(url);
    });

    return urls;
  }
});


var urlsEditor = new UrlsEditorView();