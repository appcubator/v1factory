define([
	'backbone',
	'collections/LinkCollection'
],
function(Backbone, LinkCollection) {
  var NavbarModel = Backbone.Model.extend({
    defaults : {
      brandName : null,
      isHidden : false,
      isFixed : true
    },
    initialize: function(options) {

      //init items collection with links passed from appState
      if(options.links) {
        this.set('links', new LinkCollection(options.links));
        this.links = this.get('links');
      }

      _.bindAll(this);
    },

    getLinks: function() {
      return this.get('links');
    },

    //create a duplicate of the first link
    createNewLink: function() {
      var firstLink = this.links.at(0).toJSON();
      var newLink = new (this.links.model)({
        title: firstLink.title,
        url: firstLink.url
      });
      this.links.add(newLink);
      return newLink;
    }
  });

  return NavbarModel;
});
