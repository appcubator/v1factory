define([
  'app/models/PageModel',
  'app/collections/UrlsCollection',
  'app/views/UrlView',
  'app/views/PageView',
  'mixins/BackboneNameBox'
],
function(PageModel, UrlsCollection, UrlView, PageView) {

  var PagesCollection = Backbone.Collection.extend({
    model : PageModel
  });

  var PagesView = Backbone.View.extend({
    el: document.body,

    initialize: function() {
      _.bindAll(this, 'render',
                      'createPage',
                      'appendPage',
                      'savePages');

      this.render();
      this.collection = new PagesCollection();
      this.collection.bind('add', this.appendPage, this);

      var initUrls = appState.urls || [];

      this.collection.add(appState.pages);

      $("#save-entities").on('click', this.savePages);
    },

    render: function() {
      this.listView = document.getElementById('list-pages');
      var createBox = new Backbone.NameBox({el: document.getElementById('create-page-box')});
      createBox.on('submit', this.createPage);
    },

    createPage: function(name, b) {
        var pageUrl = { urlparts : [] };
        pageUrl.urlparts[0] = "page" + this.collection.models.length;
        this.collection.add({ name: name, url: pageUrl});
        this.savePages();
    },

    appendPage: function(model) {
      var ind = _.indexOf(this.collection.models, model);
      var pageView = new PageView(model, ind);
      this.listView.appendChild(pageView.el);
    },

    savePages: function(e) {
      appState.pages = this.collection.toJSON();

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(appState),
        success: function() {},
        dataType: "JSON"
      });
    }
  });

  return PagesView;
});