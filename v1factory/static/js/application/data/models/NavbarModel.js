define([
	'backbone',
	'collections/LinkCollection'
],
function(Backbone, LinkCollection) {
  var NavbarModel = Backbone.Model.extend({
    defaults : {
      brandName : null,
      isHidden : false,
      isFixed : true,
      items : []
    },
    initialize: function() {
    	//navbar will hold links for all internal pages by default
			var internalPages = _(appState.pages).map(function(page) {
				return {
				  title: page.name,
				  url: "internal://" + page.name
				}
			});
    	this.items = new LinkCollection(internalPages);
      _.bindAll(this);
    },

    getLinks: function() {
      return this.items;
    },

    //create a duplicate of the first link
    createNewLink: function() {
      var firstLink = this.items.at(0).toJSON();
      console.log(firstLink);
      var newLink = new (this.items.model)({
        title: firstLink.title,
        url: firstLink.url
      });
      this.items.add(newLink);
      console.log('new link created');
      console.log(newLink.toJSON());
      return newLink;
    }
  });

  return NavbarModel;
});
