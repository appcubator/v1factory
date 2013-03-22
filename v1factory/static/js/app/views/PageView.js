define(['./UrlView', 'iui', 'backbone'], function(UrlView) {

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
      this.$el.append(newView.el);
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
  
  return PageView;
});