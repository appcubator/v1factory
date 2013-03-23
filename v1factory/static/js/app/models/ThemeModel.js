define([
  'backbone',
  'collections/UIElementCollection'
], 
function(Backbone, UIElementCollection) {

  var ThemeModel = Backbone.Model.extend({

    initialize: function(themeState) {
      this.set('buttonCollection', new UIElementCollection(themeState.button, "button"));
      this.set('imageCollection', new UIElementCollection(themeState.image, "image");
      this.set('headerTextCollection', new UIElementCollection(themeState["header-text"], "header-text");
      this.set('textCollection', new UIElementCollection(themeState["text"], "text");
      this.set('linkCollection', new UIElementCollection(themeState["link"], "link");
      this.set('textInputCollection', new UIElementCollection(themeState["text-input"], "text-input");
      this.set('passwordCollection', new UIElementCollection(themeState["password"], "password");
      this.set('textAreaCollection', new UIElementCollection(themeState["text-area"], "text-area");
      this.set('lineCollection', new UIElementCollection(themeState["line"], "line");
      this.set('dropdownCollection', new UIElementCollection(themeState["dropdown"], "dropdown");
      this.set('boxCollection', new UIElementCollection(themeState["box"], "box");
    }

  });

  return ThemeModel;
});