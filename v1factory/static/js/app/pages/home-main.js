define([
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

  return HomeMain;
});
