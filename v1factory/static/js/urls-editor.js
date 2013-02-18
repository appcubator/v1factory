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
    'click .cross' : 'urlRemoved'
  },

  initialize: function(item){
    var self = this;
    _.bindAll(this, 'render', 
                    'urlPartChanged', 
                    'pageChanged', 
                    'urlRemoved');
    this.model = item;
    this.urlParts = this.model.get('urlParts');
    this.render();
  },

  render: function() {
    var temp = document.getElementById('template-url').innerHTML;
    var html = _.template(temp, { 'urls': this.urlParts, 'entities': entities, 'pages': appState.pages });
    this.el.innerHTML = html;
  },

  urlPartChanged: function(e) {
    console.log("CHANGEd");
    if(e.target.id == 'inp-new') {
      e.target.id = 'inp-' + this.model.get('urlParts').length;
      this.model.get('urlParts').push(e.target.value);
    }
    else {
      var ind = String(e.target.id).replace('inp-','');
      this.model.get('urlParts')[ind] = e.target.value;
    }
  },

  pageChanged: function(e) {
    if(e.target.value == "<<new_page>>") {
      console.log("yolo");
      return;
    }

    this.model.set('page_name', e.target.value);
  },

  urlRemoved: function() {
    this.model.destroy();
    this.remove();
  },

  remove: function() {
    $(this.el).remove();
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
                    'serializeUrls');

    this.collection = new UrlsCollection();
    this.collection.bind('add', this.placeUrls);
    this.render();
    
    var initUrls = appState.urls || [];
    this.collection.add(initUrls);

    $('#create-url').on('click', this.newWUrl);
    $('#save-urls').on('click', this.saveUrls)
  },

  render: function() {

  },

  placeUrls: function(url) {
    var elem = new UrlView(url);
    this.el.appendChild(elem.el);
  },

  newWUrl: function(){
    var newModel = new UrlModel({ urlParts: ['']});
    this.collection.push(newModel);
  },

  saveUrls: function() {
    var serialized = this.serializeUrls(this.collection.models);
    console.log(serialized);
    appState.urls = serialized
    $.ajax({
      type: "POST",
      url: '/app/1/state/',
      data: JSON.stringify(appState),
      success: function() {

      },
      dataType: "JSON"
    });

  },

  serializeUrls: function(models) {
    var urls = [];
    _(models).each(function(model) {
      var url = {};
      url.name = model.get('name');
      url.parts = model.get('urlParts');
      urls.push(url);
    });

    return urls;
  }
});


var urlsEditor = new UrlsEditorView();