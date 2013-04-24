define([
  './SimpleModalView',
  'templates/MainTemplates'
],
function(SimpleModalView) {

  var AppInfoView = Backbone.View.extend({

    events : {
      'click #save' : 'saveInfo',
      'click .low-save-btn' : 'saveInfo',
      'click #delete' : 'deleteApp'
    },

    initialize: function() {

      _.bindAll(this, 'render',
                      'changeName',
                      'deploy',
                      'changeDescription',
                      'changeKeywords');

      if(!appState.info) appState.info = {};

      this.render();
    },

    render: function() {
      var page_context = {};
      page_context.name = appState.name;
      page_context.keywords = appState.info.keywords;
      page_context.description = appState.info.description;

      this.el.innerHTML = _.template(iui.getHTML('app-info-page'), page_context);
    },

    changeName : function() {
      appState.name = iui.get('app-name').value;
      iui.askBeforeLeave();
    },

    changeKeywords: function() {
      appState.info.keywords = iui.get('app-keywords').value;
      iui.askBeforeLeave();
    },

    changeDescription: function() {
      appState.info.description = iui.get('app-description').value;
      iui.askBeforeLeave();
    },

    deploy: function() {
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/deploy/',
        success: function() { alert("Deployed!"); },
        dataType: "JSON"
      });
    },

    deleteApp: function() {
      var r=confirm("Are you sure you want to delete this App?");
      if (r===true) {
        $.ajax({
          type: "POST",
          url: '/app/'+appId+'/delete/',
          complete: function() { window.location.href='/app/'; },
          dataType: "JSON"
        });
      }
      else {
        return false;
      }
    },

    saveInfo: function() {
      this.changeName();
      this.changeKeywords();
      this.changeDescription();

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(appState),
        success: function() {
          //new SimpleModalView({text:"Good Job!!! <br> ^(^_^)^ ^(^_^)> (>^_^)>"});
          iui.dontAskBeforeLeave();
          location.reload(true);
        }
      });
    }
  });

  return AppInfoView;
});
