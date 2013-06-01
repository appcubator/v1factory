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
    "m-editor" : "./mobile-editor",
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
  "mobile-editor/MobileEditorView",
  "app/EmailsView",
  "app/RouteLogger",
  "editor/KeyDispatcher",
  "editor/MouseDispatcher",
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
          MobileEditorView,
          EmailsView,
          RouteLogger,
          KeyDispatcher,
          MouseDispatcher,
          SimpleDialogueView,
          ErrorDialogueView) {

  var v1App = Backbone.Router.extend({

    routes: {
      "app/:appid/"          : "index",
      "app/:appid/info/"     : "showInfoPage",
      "app/:appid/entities/" : "showEntitiesPage",
      "app/:appid/gallery/"  : "showThemesPage",
      "app/:appid/pages/"    : "showPagesPage",
      "app/:appid/editor/:pageid/" : "showEditor",
      "app/:appid/mobile-editor/:pageid/" : "showMobileEditor",
      "app/:appid/emails/"    : "showEmailsPage"
    },

    tutorialDirectory: [0],

    initialize: function() {
      var self = this;
      $('#save').on('click', this.save);
      $('#tutorial').on('click', this.showTutorial);
    },

    index: function () {
      v1App.tutorialDirectory = [0];
      this.changePage(OverviewPageView, {}, function() {
        return;
      });
    },

    showInfoPage: function() {
      v1App.tutorialDirectory = [2];
      this.changePage(InfoView, {}, function() {
        $('.menu-app-info').addClass('active');
      });
    },

    showEntitiesPage: function() {
      v1App.tutorialDirectory = [3];
      this.changePage(EntitiesView, {}, function() {
        $('.menu-app-entities').addClass('active');
      });
    },

    showThemesPage: function() {
      v1App.tutorialDirectory = [4];
      this.changePage(ThemesGalleryView, {}, function() {
        $('.menu-app-themes').addClass('active');
      });
    },

    showPagesPage: function() {
      $('.page').fadeIn();
      v1App.tutorialDirectory = [5];
      this.changePage(PagesView, {}, function() {
        $('.menu-app-pages').addClass('active');
      });
    },

    showEditor: function(appId, pageId) {
      $('.page').fadeOut();
      v1App.tutorialDirectory = [5];

      if(v1App.view) v1App.view.remove();
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div editor-page";
      $(document.body).append(cleanDiv);

      v1App.view  = new EditorView({pageId: pageId});
      v1App.view.setElement(cleanDiv).render();

      olark('api.box.hide');
      this.changeTitle(v1App.view.title);
    },

    showMobileEditor: function(appId, pageId) {
      $('.page').fadeOut();
      v1App.tutorialDirectory = [5];

      if(v1App.view) v1App.view.remove();
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div editor-page";
      $(document.body).append(cleanDiv);

      v1App.view  = new MobileEditorView({pageId: pageId});
      v1App.view.setElement(cleanDiv).render();

      olark('api.box.hide');
      this.changeTitle(v1App.view.title);
    },

    showEmailsPage: function() {
      v1App.tutorialDirectory = [6];
      this.changePage(EmailsView, {}, function() {
        $('.menu-app-emails').addClass('active');
      });
    },


    changePage: function(newView, viewOptions, post_render) {
      if(v1App.view) v1App.view.remove();
      var cleanDiv = document.createElement('div');
      cleanDiv.className = "clean-div";
      $('#main-container').append(cleanDiv);
      v1App.view = new newView(viewOptions);
      v1App.view.setElement(cleanDiv).render();

      $('.active').removeClass('active');
      this.changeTitle(v1App.view.title);
      post_render();
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

    scrollUp: function() {
      $('html,body').animate({scrollTop:0},100, "linear");
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
    },

    changeTitle: function(title) {
      var newTitle = "";
      if(title) {
        newTitle = " | " + title;
      }
      document.title = "Appcubator" + newTitle;
    }
  });

  v1State = new AppModel();
  v1State.initialize(appState);
  v1 = new v1App();

  g_guides = {};
  keyDispatcher  = new KeyDispatcher();
  mouseDispatcher  = new MouseDispatcher();
  routeLogger = new RouteLogger({router: v1});

  Backbone.history.start({pushState: true});

  // handle all click events for routing
  $(document).on('click', 'a[rel!="external"]', function(e) {
    var href = e.currentTarget.getAttribute('href');
    // if internal link, navigate with router
    if(href.indexOf('/app/'+appId+'/') == 0) {
      v1.navigate(href, {trigger: true});
      return false;
    }
  });

  // scroll to top button animations
  var prevScrollPos = 0
  var $scrollBtn = $('#scrollUp');
  $(document).on('scroll', function() {
    var $doc = $(this);
    var scrollTop = parseInt($doc.scrollTop());
    var screenHeight = parseInt($doc.height());
    var isHidden = $scrollBtn.hasClass('hidden');
    if(scrollTop > (screenHeight/4) && isHidden) {
      $('#scrollUp').removeClass('hidden');
    }
    else if(scrollTop <= (screenHeight/4) && !isHidden) {
      $('#scrollUp').addClass('hidden');
    }
    prevScrollPos = scrollTop;
  });
    $scrollBtn.on('click', this.scrollUp);
});
