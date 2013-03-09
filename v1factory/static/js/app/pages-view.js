var PagesCollection = Backbone.Collection.extend({
  model : PageModel
});

var PageView = Backbone.View.extend({
  el: null,
  tagName : 'div',
  className: 'page-view span60 hoff2 pane',
  expanded: false,
  events: {
    'click' : 'toggleExpand'
  },
  
  initialize: function(pageModel, ind) {
    _.bindAll(this, 'render', 'toggleExpand');
    this.model = pageModel;
    this.ind = ind;

    this.render(pageModel);
    var designEditor = new DesignEditorView(this.model, false);
    this.el.appendChild(designEditor.el);
  },

  render: function() {
    var temp = document.getElementById('temp-page').innerHTML;

    var page_context = {};
    page_context.page_name = this.model.get('name');
    page_context.ind = this.ind;

    var page = _.template(temp, page_context);
    this.el.innerHTML += page;
  },

  toggleExpand: function() {
    this.expanded?$(this.el).removeClass('expanded'):this.el.className+=' expanded';
    this.expanded = this.expanded? false:true;
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
    this.collection.bind('add', this.appendPage);
    this.collection.add(appState.pages);

    $("#save-entities").on('click', this.savePages);
  },

  render: function() {

  },

  appendPage: function(model) {
    var ind = _.indexOf(this.collection.models, model);
    var pageView = new PageView(model, ind);
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