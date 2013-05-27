require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.filedrop" : "../../libs/jquery/jquery.filedrop",
    "jquery.flexslider" : "../../libs/jquery/jquery.flexslider-min",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "iui" : "../../libs/iui/iui",
    "comp": "../../libs/iui/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "./",
    "editor" : "./editor",
    "dicts" : "./dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "answer" : "../../libs/answer/answer",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial"
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
      deps: ["../../libs/answer/lib/natural", "underscore", "jquery"]
    }
  }

});

//libs
require([
  "models/AppModel",
  "mixins/SimpleModalView",
  "mixins/ErrorModalView",
  "tutorial/TutorialView",
  "app/AppInfoView",
  "app/EntitiesView",
  "app/ThemesGalleryView",
  "app/PagesView",
  "app/OverviewPageView",
  "editor/EditorView",
  "editor/KeyDispatcher",
  "mixins/SimpleDialogueView",
  "mixins/ErrorDialogueView",
  "backbone",
  "bootstrap",
  "iui",
  "comp"
],
function (AppModel,
          SimpleModalView,
          ErrorModalView,
          TutorialView,
          InfoView,
          EntitiesView,
          ThemesGalleryView,
          PagesView,
          OverviewPageView,
          EditorView,
          KeyDispatcher,
          SimpleDialogueView,
          ErrorDialogueView) {

  var v1App = Backbone.Router.extend({

    routes: {
      "app/:appid/"          : "index",
      "app/:appid/info/"     : "showInfoPage",
      "app/:appid/entities/" : "showEntitiesPage",
      "app/:appid/gallery/"  : "showThemesPage",
      "app/:appid/pages/"    : "showPagesPage",
      "app/:appid/editor/:pageid/" : "showEditor"
    },

    tutorialDirectory: [0],

    initialize: function() {
      var self = this;
      $('#save').on('click', this.save);
      $('#tutorial').on('click', this.showTutorial);
      this.menuBindings();
    },

    start: function () {

    },

    menuBindings: function() {
      var self = this;
      $('#main-menu').on('click', function() {
        self.navigate("app/"+ appId +"/", {trigger: true});
      });
      $('.menu-app-info').on('click', function() {
        self.navigate("app/"+ appId +"/info/", {trigger: true});
      });
      $('.menu-app-entities').on('click', function() {
        self.navigate("app/"+ appId +"/entities/", {trigger: true});
      });
      $('.menu-app-themes').on('click', function() {
        self.navigate("app/"+ appId +"/gallery/", {trigger: true});
      });
      $('.menu-app-pages').on('click', function() {
        self.navigate("app/"+ appId +"/pages/", {trigger: true});
      });
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
      $('.page').fadeIn();
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
      if(v1App.view) v1App.view.remove();
      v1App.tutorialDirectory = [5];
      $('.page').fadeOut();

      pageId = pageId;
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div editor-page";
      $(document.body).append(cleanDiv);
      v1App.view  = new EditorView({}, pageId);
      v1App.view.setElement(cleanDiv).render();
      olark('api.box.hide');
    },

    deploy: function() {
      iui.startAjaxLoading();
        $.ajax({
              type: "POST",
              url: '/app/'+appId+'/deploy/',
              success: function(data) {
                iui.stopAjaxLoading();
                if(data.errors) {
                  var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
                  if(DEBUG) {
                    content = { text: data.errors };
                  }
                  new ErrorDialogueView(content);
                }
                else {
                  new SimpleDialogueView({ text: 'Your app is available at <br /><a href="'+ data.site_url + '">'+ data.site_url +'</a>'});
                }
              },
              error: function(data) {
                var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
                if(DEBUG) {
                  content = { text: data.responseText };
                }
                new ErrorModalView(content);
              },
              dataType: "JSON"
        });
    },

    save: function() {
      iui.startAjaxLoading();
      appState = v1State.toJSON();
      $.ajax({
          type: "POST",
          url: '/app/'+appId+'/state/',
          data: JSON.stringify(appState),
          complete: function() { iui.stopAjaxLoading("Saved"); },
          error: function(data) {
            if(data.responseText == "ok") return;
            var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
            if(DEBUG) {
              content = { text: data.responseText };
            }
            new ErrorModalView(content);
          },
          dataType: "JSON"
      });
    },

    showTutorial: function(e, inp) {
      if(!inp) inp = v1App.tutorialDirectory;
      tutorial = new TutorialView(inp);
    },

    betaCheck: function(data) {
      if(data.percentage > 30 && data.feedback === true) {
        $('.notice').css('height', '118px');
        $('.notice').html('<h3 class="">Thank you for joining Appcubator Private Beta program!</h3><div>You can claim your free domain from <a class="menu-app-info">Domain & SEO</a> page.</div>');
        v1.menuBindings();
      }

      if(data.percentage > 30) {
        $('#tutorial-check').prop('checked', true);
      }
      if(data.feedback === true) {
        $('#feedback-check').prop('checked', true);
      }
    }
  });

  v1State = new AppModel();
  v1State.initialize(appState);
  v1 = new v1App();

  g_guides = {};
  keyDispatcher  = new KeyDispatcher();

  Backbone.history.start({pushState: true});

});
