define([
  'editor/FooterEditorView',
  'backbone'
],
function(FooterEditorView) {

  var FooterView = Backbone.View.extend({
    entity: null,
    type: null,
    events: {
      'mousedown' : 'showFooterEditor'
    },

    initialize: function(footerModel) {
      _.bindAll(this);

      this.model = footerModel;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model.get('links'), 'all', this.renderLinks);
    },

    showFooterEditor: function() {
      new FooterEditorView({ model: this.model });
    },

    render: function() {
      var self = this;
      this.setElement(document.getElementById('footer'));
      /*
      if(this.model.get('brandName')) {
        this.$el.find('#brand-name').html(this.model.get('brandName'));
      }
      */

      this.renderLinks();
      return this;
    },

    renderLinks: function() {
      var htmlString = '';
      this.model.get('links').each(function(item) {
        htmlString += '<li><a href="#" class="menu-item">' + item.get('title') + '</a></li>';
      });
      this.$el.find('#items').html(htmlString);
    }
  });

  return FooterView;
});
