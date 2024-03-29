define([
  'app/models/PageModel'
],
function(PageModel) {

  var PageCollection = Backbone.Collection.extend({
    model : PageModel,

    getContextFreePages: function() {
      var pagesList = [];
      _(this.models).each(function(page) {
        if(!_.some(page.get('url').get('urlparts'), function(part) { return (/\{\{([^\}]+)\}\}/g).test(part); })) {
          pagesList.push(page.get('name'));
        }
      });

      return pagesList;
    },

    getPagesWithEntityName: function(entityName) {
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
