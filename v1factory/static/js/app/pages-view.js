var PagesCollection = Backbone.Collection.extend({
  model : PageModel
});

var PageView = Backbone.View.extend({
  el: null,
  tagName : 'div',
  className: 'page-view span64 hoff2 pane',
  expanded: false,
  events: {
    'click .delete' : 'deletePage',
    'change #access_level' : 'accessLevelChanged'
  },

  initialize: function(pageModel, ind, urlModel) {
    _.bindAll(this, 'render',
                    'renderMenu',
                    'renderUrl',
                    'accessLevelChanged',
                    'deletePage');

    this.model = pageModel;
    this.ind = ind;

    this.url = urlModel;
    this.render();
    this.renderUrl();
    this.renderMenu();
    //var designEditor = new DesignEditorView(this.model, false);
    //this.el.appendChild(designEditor.el);
  },

  render: function() {
    var temp = iui.getHTML('temp-page');

    var page_context = {};
    page_context.page_name = this.model.get('name');
    page_context.ind = this.ind;

    var page = _.template(temp, page_context);
    this.el.innerHTML += page;
  },

  renderUrl: function() {
    var newView =  new UrlView(this.url);
    this.el.appendChild(newView.el);
  },

  renderMenu: function() {
    var temp = iui.getHTML('temp-menu');

    var page_context = {};
    page_context = this.model.attributes;
    page_context.page_name = this.model.get('name');
    page_context.ind = this.ind;

    var page = _.template(temp, page_context);
    var span = document.createElement('span');
    span.innerHTML = page;

    this.el.appendChild(span);
  },

  accessLevelChanged: function (e) {
    this.model.set('access_level', e.target.value);
  },

  deletePage: function() {
    this.model.collection.remove(this.model);
    this.remove();
  }
});


var PagesView = Backbone.View.extend({
  el: document.body,
  events: {
    'click .create-page' : 'createPage',
    'submit .create-form' : 'createFormSubmitted'
  },

  initialize: function() {
    _.bindAll(this, 'render',
                    'createPage',
                    'createFormSubmitted',
                    'appendPage',
                    'savePages');

    this.render();
    this.collection = new PagesCollection();
    this.collection.bind('add', this.appendPage, this);

    this.urlsCollection = new UrlsCollection();
    var initUrls = appState.urls || [];
    this.urlsCollection.add(initUrls);

    this.collection.add(appState.pages);

    $("#save-entities").on('click', this.savePages);
  },

  render: function() {
    this.listView = document.getElementById('list-pages');
  },

  createPage: function (e) {
    this.$el.find('.create-page').hide();
    this.$el.find('.create-form').fadeIn();
    this.$el.find('.page-name').focus();
  },

  createFormSubmitted: function(e) {
    e.preventDefault();
    var name = this.$el.find('.page-name').val();
    if(name.length > 0) {
      this.$el.find('.page-name').val('');
      this.$el.find('.create-form').hide();
      this.$el.find('.create-page').fadeIn();
      this.urlsCollection.add({ urlparts: [], page_name: name});
      this.collection.add({ name: name});
    }
    this.savePages();
  },

  appendPage: function(model) {
    var ind = _.indexOf(this.collection.models, model);
    var urlModel = this.urlsCollection.where({ page_name : model.get('name')})[0];
    var pageView = new PageView(model, ind, urlModel);
    this.listView.appendChild(pageView.el);
  },

  savePages: function(e) {
    appState.pages = this.collection.toJSON();
    appState.urls  = this.urlsCollection.toJSON();

    $.ajax({
      type: "POST",
      url: '/app/'+appId+'/state/',
      data: JSON.stringify(appState),
      success: function() {},
      dataType: "JSON"
    });
  }
});