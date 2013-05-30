define([
  'editor/LinkEditorView',
  'mixins/BackboneModal',
  'iui'
],
function(LinkEditorView) {

  var NavbarEditorView = Backbone.ModalView.extend({
    className : 'navbar-editor-modal',
    width: 600,
    padding: 0,
    events: {
      'click .done-btn' : 'closeModal',
      'click .add-link' : 'addLinkEditorView'
    },
    initialize: function(options) {
      var self = this;

      _.bindAll(this, 'render',
                      'renderLinkEditorViews',
                      'resized',
                      'resizing');

      this.model  = options.model;
      this.links = this.model.getLinks();
      this.render();
    },

    render: function() {
      var self = this;
      var brandName = this.model.get('brandName') || v1State.get('name');
      var items = _.map(this.model.get('items'), function(item) {
        return item.name.replace('internal://','').replace('/','');
      });

      var editorDiv = document.createElement('div');
      editorDiv.className = 'nav-editor-container';
      editorDiv.style.padding = "20px";

      editorDiv.innerHTML = _.template(Templates.NavbarEditor, {
        brandName: brandName,
        items: items
      });

      this.el.appendChild(editorDiv);
      this.$el.append('<div class="bottom-sect"><div class="q-mark"></div><div class="btn done-btn">Done</div></div>');
      this.el.style.height = "600px";

      this.renderLinkEditorViews();

      return this;
    },

    renderLinkEditorViews: function() {
      var self = this;
      var linksList = this.$el.find('#link-editors');
      this.links.each(function(link) {
        var newView = new LinkEditorView({ model: link });
        linksList.append(newView.render().el);
      });
    },

    addLinkEditorView: function(e) {
      // create new link (duplicate of homepage link)
      var newLink = this.model.createNewLink();
      var newLinkEditor = new LinkEditorView({ model: newLink});
      this.$el.find('#link-editors').append(newLinkEditor.render().el);
    },

    resized: function() {
      this.rowWidget.style.width = '';
      this.rowWidget.style.height ='';
      this.rowWidget.className = 'editor-window container-wrapper ';
      this.rowWidget.className += 'span' + this.rowModel.get('layout').get('width');
      this.rowWidget.style.height = (this.rowModel.get('layout').get('height') * GRID_HEIGHT) + 'px';
      this.rowWidget.style.position = "relative";
    },

    resizing: function(e, ui) {
      var dHeight = (ui.size.height + 2) / GRID_HEIGHT;
      var dWidth = (ui.size.width + 2) / GRID_WIDTH;

      var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
      var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);

      this.rowModel.get('layout').set('width', deltaWidth);
      this.rowModel.get('layout').set('height', deltaHeight);
    }
  });

  return NavbarEditorView;
});
