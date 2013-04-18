define([
  "app/views/SimpleModalView",
  "bootstrap"
],
function(SimpleModalView) {

  var ShowPageMain = function() {
    console.log("SHOW MAIN");
    $('#deploy').on('click', function() {
      iui.startAjaxLoading();
      $.ajax({
            type: "POST",
            url: '/app/'+appId+'/deploy/',
            complete: function(data) {
              iui.stopAjaxLoading();
              new SimpleModalView({ text: 'Your app is available at <a href="'+ data.responseText + '">'+ data.responseText +'</a>'});
            },
            dataType: "JSON"
      });
    });
  };

  return ShowPageMain;
});
