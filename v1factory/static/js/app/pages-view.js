var PagesCollection = Backbone.Collection.extend({
  model : PageModel
});

var PageView = Backbone.View.extend({
  el: null,
  tagName : 'div',
  className: 'page-view span64 hoff2 pane',
  expanded: false,
  events: {
    'click' : 'toggleExpand'
  },

  initialize: function(pageModel, ind, urlModel) {
    _.bindAll(this, 'render', 'toggleExpand');
    this.model = pageModel;
    this.ind = ind;

    this.url = urlModel;
    this.render();
    this.renderUrl();
    //var designEditor = new DesignEditorView(this.model, false);
    //this.el.appendChild(designEditor.el);
  },

  render: function() {
    var temp = iui.getHTML('temp-page');

    var page_context = {};
    page_context.page_name = this.model.get('name');
    page_context.ind = this.ind;

    console.log(temp);
    var page = _.template(temp, page_context);
    this.el.innerHTML += page;
  },

  renderUrl: function() {
    console.log(this);
    var newView =  new UrlView(this.url);
    this.el.appendChild(newView.el);
  },

  toggleExpand: function() {
    //this.expanded?$(this.el).removeClass('expanded'):this.el.className+=' expanded';
    //this.expanded = this.expanded? false:true;
  }
});


var PagesView = Backbone.View.extend({
  el: document.getElementById('list-pages'),
  event: {

  },

  initialize: function() {
    _.bindAll(this, 'render',
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

  },

  appendPage: function(model) {
    var ind = _.indexOf(this.collection.models, model);
    console.log(model);
    console.log(model.get('name'));
    var urlModel = this.urlsCollection.findWhere({ page_name : model.get('name')});
    console.log(urlModel);
    var pageView = new PageView(model, ind, urlModel);
    this.el.appendChild(pageView.el);
  },

  savePages: function(e) {
    appState.pages = pagesView.collection.toJSON();
    $.ajax({
      type: "POST",
      url: '/app/'+appId+'/state/',
      data: JSON.stringify(appState),
      success: function() {},
      dataType: "JSON"
    });
  }
});