define([
  'backbone'
], function() {

    var LinkEditorView = Backbone.View.extend({
        tagName: 'li',
        className: 'well',
        events: {
          'change .link-options'  : 'pageSelected',
          'keypress input.url' : 'updateUrlOnEnter',
          'blur input.url' : 'updateUrl',
          'keypress input.link-title' : 'updateTitleOnEnter',
          'blur input.link-title' : 'updateTitle',
          'click .remove': 'removeLink'
        },
        initialize: function(options) {
          this.model = options.model;

          this.listenTo(this.model, 'change:title', this.renderTitle, this);
          this.listenTo(this.model, 'change:url', this.renderUrl, this);

          _.bindAll(this);

          // generate list of link options
          this.linkOptions = _(appState.pages).map(function(page) {
            return {
              title: page.name,
              url: 'internal://' + page.name
            }
          });

          // if the link is an external link,
          // we need to add it to the link options
          if(this.model.get('url').indexOf('internal://') === -1) {
            this.linkOptions.push(this.model.toJSON());
          }
        },

        render: function() {
          var self = this;
          this.$el.html(_.template(Templates.LinkEditor, this.model.toJSON()));

          this.$urlContainer = this.$el.find('.url-container');
          this.renderLinkOptions();

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
          this.$select = this.$el.find('.select-container');
        },

        pageSelected: function(e) {
          var select = e.target;
          var selectedIndex = select.selectedIndex;
          var selectedItem = {
            title: select[selectedIndex].innerText,
            url: select[selectedIndex].value
          };

          console.log('selectedIndex: ' + selectedIndex);
          console.log('selectedItem: ');
          console.log(selectedItem);

          // if non-internal link chosen,
          // replace select box with textfield
          if(selectedItem.url.indexOf('internal://') === -1) {
            // if 'External Link...' option is chosen
            // create a new link option
            if(selectedItem.url === 'external') {
            var newLink = {
              title: 'External Link',
              url: 'http://'
            }
            this.model.set(newLink);
            this.linkOptions.splice(this.linkOptions.length - 2, 0, newLink);
            this.renderLinkOptions();
            }
            this.$select.hide();
            this.$urlContainer.show();
          }

          // cancel if they chose the first option ('choose an option')
          else if(selectedIndex == 0) {
            return false;
          }

          else {
            this.model.set({
              url: selectedItem.url,
              title: selectedItem.title
            });
          }
        },

        updateUrlOnEnter: function(e) {
          if(e.keyCode !== 13) { return; }
          //user can't modify internal urls
          if(this.model.get('url').indexOf('internal://') > -1) {
            return false;
          }

          this.updateUrl(e);

          //hide external url, show select box
          this.$urlContainer.hide();
          this.$select.show();
        },

        updateTitleOnEnter: function(e) {
          if(e.keyCode !== 13) { return; }
          this.updateTitle(e);
        },

        updateUrl: function(e) {
          this.model.set({url: e.target.value});
        },

        updateTitle: function(e) {
          if(e.keyCode !== 13) { return; }
          this.model.set({title: e.target.value});
        },

        removeLink: function(e) {
          this.model.destroy();
          this.$el.remove();
        }
    });

    return LinkEditorView;
});
