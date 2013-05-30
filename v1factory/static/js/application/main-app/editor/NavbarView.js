define([
  'editor/NavbarEditorView',
  'backbone'
],
function(NavbarEditorView) {

  var NavbarView = Backbone.View.extend({
    entity: null,
    type: null,
    events: {
      'mousedown .edit-navbar' : 'showNavbarEditor',
      'click #hide-toggle'      : 'hideToggle',
      'click .add-link'         : 'clickedAddLink',
      'change #page-link-list'  : 'pageSelected',
      'click #brand-name'       : 'clickedBrandName',
      'submit #brand-name-form' : 'submittedBrandName',
      'mouseover li.navbar-item-xcv': 'showDeleteButton',
      'mouseout li.navbar-item-xcv': 'hideDeleteButton',
      'click .menu-item'        : 'removeItem'
    },

    initialize: function(navbarModel) {
      _.bindAll(this, 'render',
                      'renderItems',
                      'hideToggle',
                      'hideChanged',
                      'pageSelected',
                      'clickedBrandName',
                      'clickedAddLink',
                      'submittedBrandName',
                      'showDeleteButton',
                      'hideDeleteButton',
                      'removeItem');

      this.model = navbarModel;
      this.model.bind('change:isHidden', this.hideChanged);
      this.listenTo(this.model, 'change', this.render);
      console.log(this.model.toJSON());
      this.listenTo(this.model.get('links'), 'all', this.render);
    },

    render: function() {
      var self = this;
      this.setElement(document.getElementById('navbar'));

      if(this.model.get('brandName')) {
        this.$el.find('#brand-name').html(this.model.get('brandName'));
      }

      this.renderItems();
      this.hideChanged();


    },

    renderItems: function() {
      var self = this;
      self.$el.find('#items').html('');
      console.log(self.model.get('links').toJSON());
      self.model.get('links').each(function(item) {
        var newli = document.createElement('li');
        newli.innerHTML = '<a href="#" class="menu-item">'+ item.get('title') +'</a>';
        $(newli).hover(self.showDeleteButton, self.hideDeleteButton);
        self.$el.find('#items').append(newli);
      });
    },

    showNavbarEditor: function() {
      new NavbarEditorView({ model: this.model })
    },

    hideToggle: function(e) {
      this.model.set('isHidden', (!this.model.get('isHidden')));
    },

    hideChanged: function() {
      if(this.model.get('isHidden')) {
        this.$el.addClass('hidden');
      }
      else {
        this.$el.removeClass('hidden');
      }
    },

    clickedAddLink: function() {
      $('.add-link').hide();
      $('.add-link-form').fadeIn();
    },

    pageSelected: function(e) {
      var arr = this.model.get('items');
      var obj = {name : e.target.value };
      arr[arr.length] = obj;
      this.model.set('items', arr);
      this.renderItems();
      iui.get('page-link-list').options[0].selected = true;
      $('.add-link-form').hide();
      $('.add-link').fadeIn();
    },

    clickedBrandName: function(e) {
      this.$el.find('#brand-name').hide();
      this.$el.find('#brand-name-form').fadeIn();
      this.$el.find('#brand-name-input').focus();
      this.$el.find('#brand-name-input').val(this.model.get('brandName'));
    },

    submittedBrandName: function(e) {
      var brandName = this.$el.find('#brand-name-input').val();
      this.$el.find('#brand-name').html(brandName);
      this.model.set('brandName', brandName);
      this.$el.find('#brand-name').fadeIn();
      this.$el.find('#brand-name-form').hide();
      this.$el.find('#brand-name-input').val('');

      e.preventDefault();
    },

    showDeleteButton: function(e) {
      $('#hide-toggle').hide();
      $('#delete-button-xcv').fadeIn();
    },

    hideDeleteButton: function(e) {
      $('#delete-button-xcv').hide();
      $('#hide-toggle').fadeIn();
    },

    removeItem: function(e) {
      var self = this;
      var name = $(e.target).html();
      name = "internal://" + name;
      var newArr = _.reject(self.model.get('items'), function(item) { return item.name == name; });
      self.model.set('items', newArr);
      $(e.target).remove();
    }
  });

  return NavbarView;
});
