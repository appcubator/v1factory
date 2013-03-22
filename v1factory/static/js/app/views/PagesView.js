define(['../models/PageModel', '../collections/UrlsCollection', './UrlView', './PageView'],
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

  return PagesView;
});