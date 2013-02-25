var PageModel = Backbone.Model.extend({
  defaults : {
    "name"             : "default-page",
    "design-props"     : [
      { 
        type  : "background-image",
        value : "/static/img/sample_bg.png"
      },
      { 
        type  : "background-color",
        value : "#eee"
      },
      {
        type  : "text-color",
        value : "#000"
      },
      {
        type  : "text-size",
        value : '12px'
      },
      {
        type  : "text-family",
        value : '"Palatino Linotype", "Book Antiqua", Palatino, serif'
      },
      {
        type  : "header-color",
        value : "#666"
      },
      {
        type  : "header-size",
        value : "16px"
      },
      {
        type  : "header-family",
        value : '"Palatino Linotype", "Book Antiqua", Palatino, serif'
      }
    ]
  }
});


var PagesCollection = Backbone.Collection.extend({
  model : PageModel
});


var PageView = Backbone.View.extend({
  el: null,
  tagName : 'div',
  className: 'page-view span30 hoff1 pane',
  events: {

  },
  
  initialize: function(pageModel) {
    _.bindAll(this, 'render');
    this.model = pageModel;
    this.render(pageModel);

    var designEditor = new DesignEditorView(this.model);
    this.el.appendChild(designEditor.el);
  },

  render: function() {
    var temp = document.getElementById('temp-page').innerHTML;

    var page_context = {};
    page_context.page_name = this.model.get('name');


    var page = _.template(temp, page_context);
    this.el.innerHTML += page;
  }
});


var PagesView = Backbone.View.extend({
  el: document.getElementById('list-pages'),
  event: {

  },

  initialize: function() {
    _.bindAll(this, 'render', 
                    'appendPage');

    this.render();
    this.collection = new PagesCollection();
    this.collection.bind('add', this.appendPage);
    this.collection.add(appState.pages);
  },

  render: function() {

  },

  appendPage: function(model) {
    var pageView = new PageView(model);
    this.el.appendChild(pageView.el);
  }
});

var pagesView = new PagesView();