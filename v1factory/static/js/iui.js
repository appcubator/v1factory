var iui = {
  openFilePick: function(callback, success) {
    filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");
    filepicker.pickMultiple({
        mimetypes: ['image/*'],
        container: 'modal',
        services:['COMPUTER', 'GMAIL', 'DROPBOX', 'INSTAGRAM', 'IMAGE_SEARCH', 'URL']
      },
      function(FPFiles){
        for (var i = 0; i < FPFiles.length; i++) {
          var f = FPFiles[i];
          /* f has the following properties:
                     url, filename, mimetype, size, isWriteable */
          $.post('/app/1/static/',{
            name: f.filename,
            url:  f.url,
            type: f.mimetype,
            error: function(d) {
              alert("Something went wrong with the file upload! Data: "+f);
            }
          });
        }
        callback(FPFiles, success);
      },
      function(FPError){
        console.log(FPError.toString());
      }
    );
  }
};