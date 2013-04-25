require.config({
  paths: {
    "jquery" : "../libs/jquery/jquery",
    "jquery-ui" : "../libs/jquery-ui/jquery-ui",
    "underscore" : "../libs/underscore-amd/underscore",
    "backbone" : "../libs/backbone-amd/backbone",
    "iui" : "../libs/iui/iui",
    "comp": "../libs/iui/comp",
    "bootstrap" : "../libs/bootstrap/bootstrap",
    "app" : "./",
    "editor" : "./editor",
    "dicts" : "../dicts",
    "mixins" : "../mixins",
    "key" : "../libs/keymaster/keymaster"
  },

  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    }
  }

});

//libs
require([
  "app/views/SimpleModalView",
  "app/tutorial/TutorialView",
  "app/views/AppInfoView",
  "app/views/EntitiesView",
  "app/views/ThemesGalleryView",
  "app/views/PagesView",
  "backbone",     //require plugins
  "bootstrap",
  "iui",
  "comp"
],
function (SimpleModalView, TutorialView, InfoView, EntitiesView, ThemesGalleryView, PagesView) {

  var v1App = Backbone.Router.extend({

    routes: {
      ""         : "index",
      "info"     : "showInfoPage",
      "entities" : "showEntitiesPage",
      "themes"   : "showThemesPage",
      "pages"    : "showPagesPage"
    },

    initialize: function() {

    },

    start: function () {

    },

    index: function () {
      $('#main-container').html('');
      $('#main-container').append(iui.getHTML('app-main-page'));
    },

    showInfoPage: function() {
      $('#main-container').html('');
      var infoView = new InfoView();
      $('#main-container').append(infoView.el);
    },

    showEntitiesPage: function() {
      $('#main-container').html('');
      console.log(iui.get('main-container'));
      var entityEditor   = new EntitiesView();
      entityEditor.setElement($('#main-container')).render();
    },

    showThemesPage: function() {
      $('#main-container').html('');
      var galleryView = new ThemesGalleryView();
      galleryView.setElement($('#main-container')).render();
    },

    showPagesPage: function() {
      $('#main-container').html('');
      var pagesView = new PagesView();
      pagesView.setElement($('#main-container')).render();
    }
  });

  new v1App();
  Backbone.history.start();

  // var ShowPageMain = Backbone.View.extend({
  //   el : document.body,

  //   events: {
  //     'click #app-info' : 'showAppInfo',
  //     'click #data-storage' : 'showDataStorage',
  //     'click #themes'  : 'showThemes',
  //     'click #pages'   : 'showPages'
  //   },

  //   initialize: function() {
  //     _.bindAll(this, 'render',
  //                     'showAppInfo',
  //                     'showDataStorage',
  //                     'showThemes');

  //     this.render();
  //     //var tutorial = new TutorialView();
  //   },

  //   render: function() {
  //     $('#deploy').on('click', function() {
  //       iui.startAjaxLoading();
  //       $.ajax({
  //             type: "POST",
  //             url: '/app/'+appId+'/deploy/',
  //             success: function(data) {
  //               console.log(data);
  //               iui.stopAjaxLoading();
  //               new SimpleModalView({ text: 'Your app is available at <br /><a href="'+ data.site_url + '">'+ data.site_url +'</a>'});
  //             },
  //             dataType: "JSON"
  //       });
  //     });
  //   },

  //   showAppInfo: function() {
  //     $('#main-container').html('');
  //     var infoView = new InfoView();
  //     $('#main-container').append(infoView.el);
  //   },

  //   showDataStorage: function() {
  //     var entityEditor   = new EntitiesView();
  //     entityEditor.setElement($('#main-container')).render();
  //   },

  //   showThemes: function() {
  //     $('#main-container').html('');
  //     var galleryView = new ThemesGalleryView();
  //     galleryView.setElement($('#main-container')).render();
  //   },

  //   showPages: function() {
  //     $('#main-container').html('');
  //     var pagesView = new PagesView();
  //     pagesView.setElement($('#main-container')).render();
  //   }

  // });

  // console.log('hee');
  // new ShowPageMain();

});