var InfoView = Backbone.View.extend({
  el : document.body,
  events : {
    'click #save' : 'saveInfo',
    'click #delete' : 'deleteApp'
  },

  initialize: function() {
    _.bindAll(this, 'render',
                    'changeName', 
                    'changeDescription',
                    'changeKeywords');

    if(!appState.info) appState.info = {};

    this.render();

  },

  render: function() {
    iui.get('app-name').value = appState.name;
    iui.get('app-keywords').value = appState.info.keywords;
    iui.get('app-description').value = appState.info.description;
  },

  changeName : function() {
    appState.name = iui.get('app-name').value;
  },

  changeKeywords: function() {
    appState.info.keywords = iui.get('app-keywords').value;
  },

  changeDescription: function() {
    appState.info.description = iui.get('app-description').value;
  },

  deplay: function() {
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
        success: function() { window.location.href='/app/'; },
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
      success: function() {},
      dataType: "JSON"
    });
  }
});