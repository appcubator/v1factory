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
  "app/models/AppModel",
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
function (AppModel, SimpleModalView, TutorialView, InfoView, EntitiesView, ThemesGalleryView, PagesView) {

  var v1App = Backbone.Router.extend({

    routes: {
      ""         : "index",
      "info"     : "showInfoPage",
      "entities" : "showEntitiesPage",
      "themes"   : "showThemesPage",
      "pages"    : "showPagesPage"
    },

    initialize: function() {
      $('#save').on('click', this.save);
      $('#tutorial').on('click', this.showTutorial);
    },

    start: function () {

    },

    index: function () {
      $('#main-container').html('');
      $('#main-container').append(iui.getHTML('app-main-page'));
      $('#deploy').on('click', this.deploy);
    },

    showInfoPage: function() {
      $('#main-container').html('');
      var infoView = new InfoView();
      infoView.setElement($('#main-container')).render();
    },

    showEntitiesPage: function() {
      $('#main-container').html('');
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
    },

    deploy: function() {
      iui.startAjaxLoading();
        $.ajax({
              type: "POST",
              url: '/app/'+appId+'/deploy/',
              success: function(data) {
                iui.stopAjaxLoading();
                new SimpleModalView({ text: 'Your app is available at <br /><a href="'+ data.site_url + '">'+ data.site_url +'</a>'});
              },
              dataType: "JSON"
        });
    },

    save: function() {
      appState = v1State.toJSON();
      $.ajax({
          type: "POST",
          url: '/app/'+appId+'/state/',
          data: JSON.stringify(appState),
          success: function() { },
          dataType: "JSON"
      });
    },

    showTutorial: function() {

    }
  });

  v1 = new v1App();
  v1State = new AppModel(appState);
  console.log(v1State);
  Backbone.history.start();

});