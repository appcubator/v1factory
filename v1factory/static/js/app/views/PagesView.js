define([
  'app/models/PageModel',
  'app/collections/UrlsCollection',
  'app/views/UrlView',
  'app/views/PageView'
],
function(PageModel, UrlsCollection, UrlView, PageView) {

  var PagesCollection = Backbone.Collection.extend({
    model : PageModel
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

      var initUrls = appState.urls || [];

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
        //this.urlsCollection.add({ urlparts: [], page_name: name});
        var pageUrl = { urlparts : [] };
        pageUrl.urlparts[0] = "page" + this.collection.models.length;
        this.collection.add({ name: name, url: pageUrl});
      }
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