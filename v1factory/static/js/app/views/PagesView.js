define([
  'app/models/PageModel',
  'app/collections/PageCollection',
  'app/views/UrlView',
  'app/views/PageView',
  'mixins/BackboneNameBox'
],
function(PageModel, PageCollection, UrlView, PageView) {

  var PagesView = Backbone.View.extend({
    el: document.body,

    initialize: function() {
      _.bindAll(this, 'render',
                      'createPage',
                      'appendPage',
                      'savePages');

      this.collection = new PageCollection(appState.pages);
      this.collection.bind('add', this.appendPage, this);

      $("#save").unbind().bind('click', this.savePages);
    },

    render: function() {
      var self = this;

      self.$el.html(_.template(iui.getHTML('pages-page'), {}));
      this.listView = document.getElementById('list-pages');

      _(this.collection.models).each(function(model) {
        self.appendPage(model);
      });

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