define([
  'backbone'
], function() {

    var LinkEditorView = Backbone.View.extend({
        tagName: 'li',
        className: 'well well-small',
        events: {
          'change .link-options'  : 'pageSelected',
          'keydown input.url' : 'updateUrl',
          'keydown input.link-title' : 'updateTitle',
          'click .remove': 'removeLink'
        },
        initialize: function(options) {
          _.bindAll(this);
          this.model = options.model;
          this.listenTo(this.model, 'change:title', this.renderTitle, this);
          this.listenTo(this.model, 'change:url', this.renderUrl, this);

          // generate list of link options
          this.linkOptions = _(appState.pages).map(function(page) {
            return {
              title: page.name,
              url: 'internal://' + page.name
            }
          });

          // if the current link is an external link,
          // we need to add it to the link options
          if(this.model.get('url').indexOf('internal://') === -1) {
            this.linkOptions.push(this.model.toJSON());
          }
        },

        render: function() {
          var self = this;
          this.$el.html(_.template(Templates.LinkEditor, this.model.toJSON()));
          this.renderLinkOptions();

          this.$urlContainer = this.$el.find('.url-container');
          this.$select = this.$el.find('.select-container');

          return this;
        },

        renderTitle: function(model, newTitle) {
          this.$el.find('input.link-title').val(newTitle);
        },

        renderUrl: function(model, newUrl) {
          this.$el.find('input.url').val(newUrl);
        },

        renderLinkOptions: function() {
          var select = this.$el.find('.link-options').empty();
          select.append('<option>Choose a Page</option>');
          _(this.linkOptions).each(function(link) {
            select.append('<option value="' + link.url + '">' + link.title +'</option>');
          });
          select.append('<option value="external">External Link...</option>');
        },

        pageSelected: function(e) {
          var select = e.target;
          var selectedIndex = select.selectedIndex;
          var selectedItem = {
            title: select[selectedIndex].innerText,
            url: select[selectedIndex].value
          };

          this.model.set({
              url: selectedItem.url,
              title: selectedItem.title
          });

          // if non-internal link chosen,
          // replace select box with textfield
          if(selectedItem.url.indexOf('internal://') === -1) {
            // if 'External Link...' option is chosen
            // create a new link option
            if(selectedItem.url === 'external') {
              var newLink = {
                title: 'External Link Title',
                url: 'http://'
              };
              this.model.set(newLink);
              this.linkOptions.push(newLink);
              this.renderLinkOptions();
            }
            this.$select.hide();
            this.$urlContainer.show();
          }

          // cancel if they chose the first option ('choose an option')
          else if(selectedIndex == 0) {
            return false;
          }

          else { }
        },

        updateUrl: function(e) {
          // user can't modify internal urls
          if(this.model.get('url').indexOf('internal://') > -1) {
            return false;
          }

          // if user hits enter, replace url field with dropdown
          if(e.keyCode && e.keyCode === 13) {
            //hide external url, show select box
            this.$urlContainer.hide();
            this.$select.show();
          }

          this.model.set({url: e.target.value});
          this.renderLinkOptions();
        },

        updateTitle: function(e) {
          this.model.set({title: e.target.value});
          this.renderLinkOptions();
        },

        removeLink: function(e) {
          this.model.destroy();
          this.$el.remove();
        }
    });

    return LinkEditorView;
});
