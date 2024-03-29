define([
  'backbone'
],
function() {

  var NavbarEditorView = Backbone.View.extend({
    el: $('#navbar'),
    entity: null,
    type: null,
    events: {
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
    },

    render: function() {
      var self = this;

      if(this.model.get('brandName')) {
        this.$el.find('#brand-name').html(this.model.get('brandName'));
      }

      this.renderItems();
      this.hideChanged();

      _(appState.pages).each(function(page) {
        self.$el.find('#page-link-list').append('<option value="internal://'+ page.name +'">' + page.name +'</option>');
      });
    },

    renderItems: function() {
      var self = this;
      self.$el.find('#items').html('');
      _(self.model.get('items')).each(function(item) {
        var name = item.name.replace('internal://','').replace('/','');
        var newli = document.createElement('li');
        newli.innerHTML = '<a href="#" class="menu-item">'+ name +'</a>';
        $(newli).hover(self.showDeleteButton, self.hideDeleteButton);
        self.$el.find('#items').append(newli);
      });
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

  return NavbarEditorView;
});