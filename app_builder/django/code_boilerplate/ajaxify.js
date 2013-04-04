$(document).ready(function() {

  $('form').each(function(ind, node) {

    $(node).submit(function(e) {
      var self = this;
      var ajax_info = {
        type : $(node).attr('method'),
        url  : $(node).attr('action'),
        data : $(node).serialize(),
        success : function(data, statusStr, xhr) {
          if (typeof(data.redirect_to) !== 'undefined') {
            location.href = data.redirect_to;
          } else {
            _.each(data, function(val, key, ind) {
              if(key==='__all__') {
                $(self).find('.form-error.field-all').html(val.join('<br />'));
              } else {
                $(self).find('.form-error.field-name-'+key).html(val.join('<br />'));
              }
            });
          }
        }
      };
      $.ajax(ajax_info);
      $(self).find('.form-error').html("");

      return false;

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
