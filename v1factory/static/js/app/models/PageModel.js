define(['backbone'], function(Backbone) {
  
  var PageModel = Backbone.Model.extend({
    defaults : {
      "name"             : "default-page",
      "design_props"     : [
        {
          type  : "background-image",
          value : "/static/img/sample_bg.png"
        },
        {
          type  : "background-color",
          value : "#fff"
        },
        {
          type  : "text-color",
          value : "#000"
        },
        {
          type  : "text-size",
          value : '12px'
        },
        {
          type  : "text-family",
          value : '"Helvetica Neue", Helvetica, "Lucida Grande"'
        },
        {
          type  : "header-color",
          value : "#666"
        },
        {
          type  : "header-size",
          value : "16px"
        },
        {
          type  : "header-family",
          value : '"Helvetica Neue", Helvetica, "Lucida Grande"'
        }
      ],
      "access_level" : "all",
      "uielements" : []
    }
  });

  return PageModel;
});