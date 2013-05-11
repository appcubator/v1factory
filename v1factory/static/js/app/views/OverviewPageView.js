define([
  'app/views/SimpleModalView',
  'templates/MainTemplates'
],
function(SimpleModalView) {

  var OverviewPageView = Backbone.View.extend({
    css: 'app-page',

    events : {
      'click .tutorial'        : 'showTutorial',
      'click .feedback'        : 'showFeedback',
      'click #deploy'          : 'deploy'
    },

    initialize: function() {
      _.bindAll(this, 'render',
                      'deploy',
                      'showTutorial',
                      'showFeedback');
      iui.loadCSS(this.css);
    },

    render: function() {
      var page_context = {};
      this.el.innerHTML = _.template(iui.getHTML('app-main-page'), page_context);
      this.checkTutorialProgress();
      v1.menuBindings();
    },

    checkTutorialProgress: function() {
      var self = this;

      $.ajax({
        type: "POST",
        url: '/log/slide/',
        data: { title: null, directory: null },
        success: function(data) {
          v1.betaCheck(data);
        },
        error: function() {
          setTimeout(function() {
            self.checkTutorialProgress();
          }, 400);
        },
        dataType: "JSON"
      });
    },

    deploy: function() {
      v1.deploy();
    },

    showTutorial: function() {
      v1.showTutorial();
    },

    showFeedback: function() {
      v1.showTutorial(null, [7]);
    }

  });

  return OverviewPageView;
});
