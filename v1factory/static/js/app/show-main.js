require.config({
  paths: {
    "jquery" : "../libs/jquery/jquery",
    "jquery-ui" : "../libs/jquery-ui/jquery-ui",
    "underscore" : "../libs/underscore-amd/underscore",
    "backbone" : "../libs/backbone-amd/backbone",
    "backboneui" : "../backbone/BackboneUI",
    "iui" : "../libs/iui/iui",
    "bootstrap" : "../libs/bootstrap/bootstrap",
    "app" : "./",
    "editor" : "../editor",
    "dicts" : "../dicts"
  },

  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    }
  }

});

require([
  "app/views/SimpleModalView",
  "bootstrap"
],
function(SimpleModalView) {

  $('#deploy').on('click', function() {
    $.ajax({
          type: "POST",
          url: '/app/'+appId+'/deploy/',
          complete: function(data) {
            new SimpleModalView({ text: 'Your app is available at <a href="'+ data.responseText + '">'+ data.responseText +'</a>'});
          },
          dataType: "JSON"
    });
  });


});
