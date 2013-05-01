define([
  'app/views/SimpleModalView',
  'templates/MainTemplates'
],
function(SimpleModalView) {

  var OverviewPageView = Backbone.View.extend({

    events : {
      'click .tutorial'        : 'showTutorial',
      'click #deploy'          : 'deploy'
    },

    initialize: function() {
      _.bindAll(this, 'render',
                      'deploy',
                      'showTutorial');

    },

    render: function() {
      var page_context = {};
      this.el.innerHTML = _.template(iui.getHTML('app-main-page'), page_context);
      this.checkTutorialProgress();
    },

    checkTutorialProgress: function() {
      $.ajax({
        type: "POST",
        url: '/log/slide/',
        data: { title: null, directory: null },
        success: function(data) {
          if(data.percentage > 99) {
            $('#tutorial-check').prop('checked', true);
          } 
        },
        dataType: "JSON"
      });
    },

    deploy: function() {
      v1.deploy();
    },

    showTutorial: function() {
      v1.showTutorial();
    }

  });

  return OverviewPageView;
});
