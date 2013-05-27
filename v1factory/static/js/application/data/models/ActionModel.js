define([
"backbone"
],
function() {

  var ActionModel = Backbone.Model.extend({
    initialize: function(bone) {
      this.set("type", bone.type);
    },

    getNL: function() {
      if(this.get('type') == "redirect") {
        return "Go to " + this.get('pageName');
      }

      return this.get('type');
    }
  });

  return ActionModel;
});