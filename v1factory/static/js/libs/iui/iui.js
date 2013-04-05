define(['jquery-ui'], function() {

  var iui = {
    openFilePick: function(callback, success, appId) {
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
            $.post('/app/'+ appId +'/static/',{
              name: f.filename,
              url:  f.url,
              type: f.mimetype,
              error: function(d) {
                //alert("Something went wrong with the file upload! Data: "+f);
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
    openThemeFilePick: function(callback, success, themeId) {
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
            $.post('/theme/'+ themeId +'/static/',{
              name: f.filename,
              url:  f.url,
              type: f.mimetype,
              error: function(d) {
                //alert("Something went wrong with the file upload! Data: "+f);
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

    resizableAndDraggable: function(el, self) {
      $(el).resizable({
        handles: "n, e, s, w, se",
        resize: self.resized,
        containment: "parent"
      });

      $(el).draggable({
        drag: self.moved,
        containment: "parent"
      });

      //this.el.style.position = 'relative';
      //console.log('yolo');
      return el;
    },

    draggable: function(el) {
      $(el).draggable({
        grid: [ 30,30 ],
        drag: self.moved
      });
    },

    resizable: function(el, self) {
      $(el).resizable({
        handles: "n, e, s, w, se",
        stop: self.resized,
        resize: self.resizing,
        containment: "parent"
      });

      return el;
    },

    setCursor: function(node,pos){
      console.log(node);
      var node = (typeof node == "string" ||
      node instanceof String) ? document.getElementById(node) : node;
          if(!node){
              return false;
          }else if(node.createTextRange){
              var textRange = node.createTextRange();
              textRange.collapse(true);
              textRange.moveEnd(pos);
              textRange.moveStart(pos);
              textRange.select();
              console.log('he');
              return true;
          }else if(node.setSelectionRange){
              node.setSelectionRange(pos,pos);
              return true;
          }
          return false;
    },

    get: function(id) {
      return document.getElementById(id);
    },

    getHTML: function(id) {
      if(!document.getElementById(id)) return null;

      return (document.getElementById(id).innerHTML)||null;
    },

    askBeforeLeave: function(message) {
      window.onbeforeunload = function(){
        return ('You have some unsave changes.');
      };
    },

    dontAskBeforeLeave: function() {
      window.onbeforeunload = null;
    }
  };

  function csrfSafeMethod(method) {
      // these HTTP methods do not require CSRF protection
      return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    function getCookie(name) {
      var cookieValue = null;
      if (document.cookie && document.cookie != '') {

        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
          var cookie = jQuery.trim(cookies[i]);
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) == (name + '=')) {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
            break;
          }
        }
      }
      return cookieValue;
    }

    $(function () {
      /* adds csrftoke to every ajax request we send */
      $.ajaxSetup({
        crossDomain: false, // obviates need for sameOrigin test
        beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type)) {
            var token = getCookie('csrftoken');
            xhr.setRequestHeader("X-CSRFToken", token);
          }
        }
      });
    });

  window.iui = iui;

  if (typeof window.define === "function" && window.define.amd) {
    window.define("iui", [], function() {
      return window.iui;
    });
  }

});
