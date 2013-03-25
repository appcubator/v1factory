define([
  'backbone',
  'app/collections/UIElementCollection'
],
function(Backbone, UIElementCollection) {

  var ThemeModel = Backbone.Model.extend({

    initialize: function(themeState) {
      this.set('buttons', new UIElementCollection(themeState.button, "button"));
      this.set('images', new UIElementCollection(themeState.image, "image"));
      this.set('headerTexts', new UIElementCollection(themeState["header-text"], "header-text"));
      this.set('texts', new UIElementCollection(themeState["text"], "text"));
      this.set('links', new UIElementCollection(themeState["link"], "link"));
      this.set('textInputs', new UIElementCollection(themeState["text-input"], "text-input"));
      this.set('passwords', new UIElementCollection(themeState["password"], "password"));
      this.set('textAreas', new UIElementCollection(themeState["text-area"], "text-area"));
      this.set('lines', new UIElementCollection(themeState["line"], "line"));
      this.set('dropdowns', new UIElementCollection(themeState["dropdown"], "dropdown"));
      this.set('boxes', new UIElementCollection(themeState["box"], "box"));
    }

  });

  return ThemeModel;
});