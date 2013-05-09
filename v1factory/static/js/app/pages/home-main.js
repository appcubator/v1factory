require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "iui" : "../../libs/iui/iui",
    "comp": "../../libs/iui/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "editor" : "./../editor",
    "dicts" : "../../dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster"
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
  'app/views/SimpleModalView',
  'app/views/LoginModalView'
],
function(SimpleModalView, LoginModalView) {

  var HomeMain = function() {
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
  };

  new HomeMain();
});
