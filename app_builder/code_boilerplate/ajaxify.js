$(document).ready(function() {
  filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");
  function openImagepicker(callback) {
    filepicker.pick({
        mimetypes: ['image/*'],
        services: ['COMPUTER', 'FACEBOOK', 'IMAGE_SEARCH', 'INSTAGRAM', 'URL'],
      },
      function(fpfile){
        callback(fpfile);
      },
      function(fperror){
        console.log(fperror);
        alert(fperror);
      });
  }

  $('form').each(function(ind, this_form) {

    $(this_form).submit(function(e) {
      var self = this;
      var ajax_info = {
        type : $(this_form).attr('method'),
        url  : $(this_form).attr('action'),
        data : $(this_form).serialize(),
        success : function(data, statusStr, xhr) {
          if (typeof(data.redirect_to) !== 'undefined') {
            location.href = data.redirect_to;
          } else {
            if (!data.success){
              _.each(data.errors, function(val, key, ind) {
                if(key==='__all__') {
                  $(self).find('.form-error.field-all').html(val.join('<br />'));
                } else {
                  $(self).find('.form-error.field-name-'+key).html(val.join('<br />'));
                }
              });
            }
          }
        }
      };
      $.ajax(ajax_info);
      $(self).find('.form-error').html("");

      return false;

    });

  });

  // image upload buttons
  $('.btn.upload').click(function(e) {
    openImagepicker(function(file){
      var fieldId = String(e.target.id).replace('button-', '');
      $('#'+fieldId).val(file.url);
    });

    e.preventDefault();
  });




});
