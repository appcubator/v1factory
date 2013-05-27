define(['backbone'],

function(Backbone) {
  var NavbarModel = Backbone.Model.extend({
    defaults : {
      brandName : null,
      isHidden : false,
      isFixed : true,
      items : []
    }
  });

  return NavbarModel;
});