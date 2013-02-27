var iui = {
  openFilePick: function() {
    filepicker.setKey("AAO81GwtTTec7D8nH9SaTz");
    filepicker.pickMultiple({
        mimetypes: ['image/*'],
        container: 'modal',
        services:['COMPUTER', 'GMAIL', 'DROPBOX', 'INSTAGRAM', 'IMAGE_SEARCH', 'URL']
      },
      function(FPFiles){
        console.log(JSON.stringify(FPFiles));
        for (var i = 0; i < FPFiles.length; i++) {
          var f = FPFiles[i];
          /* f has the following properties:
                     url, filename, mimetype, size, isWriteable */
          $.post('/app/1/static/',{
              name: f.filename,
              url:  f.url,
              type: f.mimetype
            }, function(d){
              if (d.error) {
                alert("Something went wrong with the file upload! Data: "+f);
              } else {
                // the server saved the static file entry successfully.
                // now you can change the state of the page
              }
            })
        }
      },
      function(FPError){
        console.log(FPError.toString());
      }
    );
  }
};