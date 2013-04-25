define(['./SimpleModalView', 'backbone', 'iui'],
function(SimpleModalView) {
  var AppInfoView = Backbone.View.extend({
    el : document.body,
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
      iui.get('app-name').value = appState.name;
      iui.get('app-domain').value = appState.info.domain;
      iui.get('app-keywords').value = appState.info.keywords;
      iui.get('app-description').value = appState.info.description;
    },

    changeName : function() {
      appState.name = iui.get('app-name').value;
      iui.askBeforeLeave();
    },

    changeDomain : function() {
      appState.info.domain = iui.get('app-domain').value;
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
      this.changeDomain();
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
