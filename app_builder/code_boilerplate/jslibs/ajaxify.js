$(document).ready(function() {

  $('form').each(function(ind, node) {

    $(node).submit(function(e) {

      var ajax_info = {
        type : $(node).attr('method'),
        url  : $(node).attr('action'),
        data : $(node).serialize(),
        error : function(error) {
          console.log(error);
          e.preventDefault();
        }
      };
      $.ajax(ajax_info);

    });
  });

  $('.btn.upload').click(function(e) {
    openFilepicker(function(file){
      console.log(file);
      var id = String(e.target.id).replace('button-', '');
      $('#'+id).val(file.url);
    });

    e.preventDefault();
  });
});
