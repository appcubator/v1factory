define([
  'backbone'
],

function(Backbone) {

  var viewOptions = ['model', 'collection', 'el', 'id', 'attributes', 'className', 'tagName', 'events', 'css'];

  _.extend(Backbone.View.prototype, {
    loadCSS: function() {
      console.log("LOADING");
        if(this.css) {
          if(!document.getElementById('css-' + self.css)) {
            var cssFile = document.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('href', '/static/css/' + self.css + '.css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.id = 'css-' + self.css;
            console.log(cssFile);
            document.getElementsByTagName('head')[0].appendChild(cssFile);
          }
        }
    }
  });

  _.extend(Backbone.View.prototype, {

    _configure: function(options) {
      console.log("CONFIG");
      if (this.options) options = _.extend({}, _.result(this, 'options'), options);
      _.extend(this, _.pick(options, viewOptions));
      this.options = options;
      console.log("CONFIGYUR");
      this.loadCSS.apply();
    }

  });

  // Backbone.View.prototype.loadCSS = function() {
  //   console.log("LOADING");
  //     if(this.css) {
  //       if(!document.getElementById('css-' + self.css)) {
  //         var cssFile = document.createElement('link');
  //         cssFile.setAttribute('type', 'text/css');
  //         cssFile.setAttribute('href', '/static/css/' + self.css + '.css');
  //         cssFile.setAttribute('rel', 'stylesheet');
  //         cssFile.id = 'css-' + self.css;
  //         console.log(cssFile);
  //         document.getElementsByTagName('head')[0].appendChild(cssFile);
  //       }
  //     }
  // };

  // Backbone.View = Backbone.View.extend({
  //   _configure: function(options) {
  //     Backbone.View.__super__._configure.call(this, options);
  //     _.bindAll(this, 'loadCSS');
  //     this.loadCSS();
  //   }

  // });


  return Backbone;

});
