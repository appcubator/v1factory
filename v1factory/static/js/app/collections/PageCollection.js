define([
  'app/models/PageModel'
],
function(PageModel) {

  var PageCollection = Backbone.Collection.extend({
    model : PageModel,

    getPagesWithEntityName: function(entityName) {
      console.log('entityName: '+ entityName);
      var pagesList = [];
      _(this.models).each(function(page) {
        if(_.contains(page.get('url').get('urlparts'), '{{' + entityName + '}}')) {
          pagesList.push(page.get('name'));
        }
        
      });

      return pagesList;
    }
  });

  return PageCollection;
});
