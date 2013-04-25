define([
  'app/views/SimpleModalView',
  'templates/MainTemplates'
],
function(SimpleModalView) {

  var AppInfoView = Backbone.View.extend({

    events : {
      'click #delete'          : 'deleteApp',
      'keyup #app-name'        : 'changeName',
      'keyup #app-keywords'    : 'changeKeywords',
      'keyup #app-description' : 'changeDescription'
    },

    initialize: function() {

      _.bindAll(this, 'render',
                      'changeName',
                      'changeDescription',
                      'changeKeywords');

      this.model = v1State.get('info');
    },

    render: function() {
      var page_context = {};
      page_context.name = this.model.get('name');
      page_context.keywords = this.model.get('keywords');
      page_context.description = this.model.get('description');

      this.el.innerHTML = _.template(iui.getHTML('app-info-page'), page_context);
    },

    changeName : function(e) {
      this.model.set('name', e.target.value);
      iui.askBeforeLeave();
    },

    changeKeywords: function(e) {
      this.model.set('keywords', e.target.value);
      iui.askBeforeLeave();
    },

    changeDescription: function(e) {
      this.model.set('description', e.target.value);
      iui.askBeforeLeave();
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
    }
  });

  return AppInfoView;
});
