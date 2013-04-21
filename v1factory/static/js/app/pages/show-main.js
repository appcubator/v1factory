define([
  "app/views/SimpleModalView",
  "app/tutorial/TutorialView",
  "bootstrap"
],
function(SimpleModalView, TutorialView) {

  var ShowPageMain = function() {
    $('#deploy').on('click', function() {
      iui.startAjaxLoading();
      $.ajax({
            type: "POST",
            url: '/app/'+appId+'/deploy/',
            success: function(data) {
              console.log(data);
              iui.stopAjaxLoading();
              new SimpleModalView({ text: 'Your app is available at <br  /><a href="'+ data.site_url + '">'+ data.site_url +'</a>'});
            },
            dataType: "JSON"
      });
    });


    var tutorial = new TutorialView();
  };

  return ShowPageMain;
});
