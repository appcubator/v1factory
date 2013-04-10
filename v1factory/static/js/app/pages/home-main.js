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

require(["backbone",
         'backboneui',
         'app/views/SimpleModalView',
         'app/views/LoginModalView',
         "bootstrap"],
function(Backbone, BackboneUI, SimpleModalView, LoginModalView) {

  IN.Event.on(IN, "auth", function(){ onLinkedInLogin(); });

    function onLinkedInLogin() {
      IN.API.Profile("me")
        .fields(["id", "firstName", "lastName", "publicProfileUrl", "emailAddress", "headline"])
        .result(login_callback)
        .error(function(err) {
          alert(err);
        });
    }
    function login_callback(result) {
      var realresult = result.values[0];
        $.post('/connect_with/', realresult, function(data){
          new SimpleModalView({ text: "Thanks for expressing interest, "+realresult.firstName+", we will reach out to you soon."});
        });
    }

  $('.IN-widget').hide();
  $('#request').on('click', function() {
    $('.IN-widget').children().first().children().first().trigger('click');
  });

  $('#login-btn').on('click', function() {
    new LoginModalView();
  });
});
