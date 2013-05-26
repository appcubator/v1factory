define([
  'app/models/PageModel',
  'app/collections/PageCollection',
  'app/views/UrlView',
  'app/views/PageView',
  'mixins/ErrorDialogueView',
  'mixins/BackboneNameBox'
],
function(PageModel, PageCollection, UrlView, PageView, ErrorDialogueView) {

  var PagesView = Backbone.View.extend({
    el: document.body,

    initialize: function() {
      _.bindAll(this, 'render',
                      'createPage',
                      'appendPage');

      this.collection = v1State.get('pages');
      this.collection.bind('add', this.appendPage, this);
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
      var pageUrlPart = name.replace(' ', '_');
      var pageUrl = { urlparts : [pageUrlPart] };

      if(!v1State.get('pages').isUnique(name)) {
        new ErrorDialogueView({text: 'Page name should be unique.'});
        return;
      }
      this.collection.add({ name: name, url: pageUrl});
      v1.save();
    },

    appendPage: function(model) {
      var ind = _.indexOf(this.collection.models, model);
      var pageView = new PageView(model, ind);
      this.listView.appendChild(pageView.el);
    }

  });

  return PagesView;
});