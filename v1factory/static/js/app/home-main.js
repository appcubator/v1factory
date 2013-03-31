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

require(["backbone", 'backboneui', 'app/views/SimpleModalView', "bootstrap"], function(Backbone, BackboneUI, SimpleModalView) {

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

  var $elie = $('.engine1');
  var $elie2 = $('.engine2');
  var $elie3 = $('.engine3');
  rotate(0, -1);
  rotate2(0, 1);
  rotate3(0, -1);

  function rotate(degree, direction) {
    $elie.css({ WebkitTransform: 'rotate(' + degree + 'deg)'});
    $elie.css({ '-moz-transform': 'rotate(' + degree + 'deg)'});
    setTimeout(function() { rotate(degree + direction, direction); },26);
  }
  function rotate2(degree, direction) {
    $elie2.css({ WebkitTransform: 'rotate(' + degree + 'deg)'});
    $elie2.css({ '-moz-transform': 'rotate(' + degree + 'deg)'});
    setTimeout(function(){setTimeout(function() { rotate2(degree + direction, direction); },26); }, 1);
  }

  function rotate3(degree, direction) {
    $elie3.css({ WebkitTransform: 'rotate(' + degree + 'deg)'});
    $elie3.css({ '-moz-transform': 'rotate(' + degree + 'deg)'});
    setTimeout(function(){setTimeout(function() { rotate3(degree + direction, direction); },26); }, 1);
  }
});
