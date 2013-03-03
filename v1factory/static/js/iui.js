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
  },
  assert : function(inp) {
    if(!inp) {
      console.trace();
      alert('Important Error!');
    }
  },
  unite: function(cor1, cor2) {
    var topLeft = {}, bottomRight = {};

    if(cor1.x < cor2.x) {
      topLeft.x =  cor1.x; bottomRight.x = cor2.x;
    } else {
      topLeft.x =  cor2.x; bottomRight.x = cor1.x;
    }

    if(cor1.y < cor2.y) {
      topLeft.y =  cor1.y; bottomRight.y = cor2.y;
    } else {
      topLeft.y =  cor2.y; bottomRight.y = cor1.y;
    }

    topLeft.x--; topLeft.y--;

    return {
      topLeft : topLeft,
      bottomRight: bottomRight
    };
  },

  resizableAndDraggable: function(el) {

    $(el).resizable({
      handles: "n, e, s, w, se",
      grid: 30,
      resize: self.resized
    });

    $(el).draggable({
      grid: [ 30,30 ],
      containment : $('#elements-container'),
      drag: self.moved
    });
    return el;
  },

  get: function(id) {
    return document.getElementById(id);
  }
};