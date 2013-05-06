require.config({
  paths: {
    "jquery" : "../libs/jquery/jquery",
    "jquery-ui" : "../libs/jquery-ui/jquery-ui",
    "jquery.filedrop" : "../libs/jquery/jquery.filedrop",
    "underscore" : "../libs/underscore-amd/underscore",
    "backbone" : "../libs/backbone-amd/backbone",
    "iui" : "../libs/iui/iui",
    "comp": "../libs/iui/comp",
    "bootstrap" : "../libs/bootstrap/bootstrap",
    "app" : "./",
    "editor" : "./editor",
    "dicts" : "../dicts",
    "mixins" : "../mixins",
    "key" : "../libs/keymaster/keymaster",
    "answer" : "../libs/answer/answer"
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
    },
    "answer" : {
      deps: ["../libs/answer/lib/natural", "underscore", "jquery"]
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
  "app/views/OverviewPageView",
  "app/editor/EditorView",
  "backbone",
  "bootstrap",
  "iui",
  "comp"
],
function (AppModel,
          SimpleModalView,
          TutorialView,
          InfoView,
          EntitiesView,
          ThemesGalleryView,
          PagesView,
          OverviewPageView,
          EditorView) {

  var v1App = Backbone.Router.extend({

    routes: {
      "app/:appid/"          : "index",
      "app/:appid/info/"     : "showInfoPage",
      "app/:appid/entities/" : "showEntitiesPage",
      "app/:appid/gallery/"  : "showThemesPage",
      "app/:appid/pages/"    : "showPagesPage",
      "app/:appid/editorone/:pageid" : "showEditor"
    },

    tutorialDirectory: [0],

    initialize: function() {
      var self = this;

      $('#save').on('click', this.save);
      $('#tutorial').on('click', this.showTutorial);

      $('#main-menu').on('click', function() {
        self.navigate("app/"+ appId +"/", {trigger: true});
      });
      $('#info-menu').on('click', function() {
        self.navigate("app/"+ appId +"/info/", {trigger: true});
      });
      $('#entities-menu').on('click', function() {
        self.navigate("app/"+ appId +"/entities/", {trigger: true});
      });
      $('#gallery-menu').on('click', function() {
        self.navigate("app/"+ appId +"/gallery/", {trigger: true});
      });
      $('#pages-menu').on('click', function() {
        self.navigate("app/"+ appId +"/pages/", {trigger: true});
      });
    },

    start: function () {

    },

    index: function () {
      if(v1App.view) v1App.view.remove();
      v1App.tutorialDirectory = [0];
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div";
      $('#main-container').append(cleanDiv);
      v1App.view = new OverviewPageView();
      v1App.view.setElement(cleanDiv).render();
      $('.active').removeClass('active');
    },

    showInfoPage: function() {
      if(v1App.view) v1App.view.remove();
      v1App.tutorialDirectory = [2];
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div";
      $('#main-container').append(cleanDiv);
      v1App.view = new InfoView();
      v1App.view.setElement(cleanDiv).render();
      $('.active').removeClass('active');
      $('.menu-app-info').addClass('active');
    },

    showEntitiesPage: function() {
      if(v1App.view) v1App.view.remove();
      v1App.tutorialDirectory = [3];
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div";
      $('#main-container').append(cleanDiv);
      v1App.view    = new EntitiesView();
      v1App.view.setElement(cleanDiv).render();
      $('.active').removeClass('active');
      $('.menu-app-entities').addClass('active');
    },

    showThemesPage: function() {
      if(v1App.view) v1App.view.remove();
      v1App.tutorialDirectory = [4];
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div";
      $('#main-container').append(cleanDiv);
      v1App.view  = new ThemesGalleryView();
      v1App.view.setElement(cleanDiv).render();
      $('.active').removeClass('active');
      $('.menu-app-themes').addClass('active');
    },

    showPagesPage: function() {
      console.log(v1App.view);

      if(v1App.view) v1App.view.remove();
      v1App.tutorialDirectory = [5];
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div";
      $('#main-container').append(cleanDiv);
      v1App.view  = new PagesView();
      v1App.view.setElement(cleanDiv).render();

      $('.active').removeClass('active');
      $('.menu-app-pages').addClass('active');
    },

    showEditor: function(appId, pageId) {
      console.log(v1App.view);

      if(v1App.view) v1App.view.remove();
      v1App.tutorialDirectory = [5];
      $('.page').fadeOut();

      pageId = pageId;
      console.log(pageId);
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div";
      $(document.body).append(cleanDiv);
      v1App.view  = new EditorView({}, pageId);
      v1App.view.setElement(cleanDiv).render();

//       $('.active').removeClass('active');
//       $('.menu-app-pages').addClass('active');


// 
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
      iui.startAjaxLoading();
      appState = v1State.toJSON();
      console.log(appState);
      $.ajax({
          type: "POST",
          url: '/app/'+appId+'/state/',
          data: JSON.stringify(appState),
          complete: function() { iui.stopAjaxLoading("Saved"); },
          dataType: "JSON"
      });
    },

    showTutorial: function() {
      tutorial = new TutorialView(v1App.tutorialDirectory);
    }
  });

  v1 = new v1App();
  v1State = new AppModel();
  v1State.initialize(appState);
  Backbone.history.start({pushState: true});

});
