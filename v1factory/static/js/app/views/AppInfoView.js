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
      'keyup #app-description' : 'changeDescription',

      'keyup .register-subdomain-input' : 'checkForSubDomain',
      'click #register-new-subdomain' : 'showSubDomainRegistrationForm',
      'click .register-subdomain-button' : 'registerSubDomain',

      'keyup .register-domain-input' : 'checkForDomain',
      'click #register-new-domain' : 'showDomainRegistrationForm',
      'click .register-domain-button' : 'registerDomain',
    },

    initialize: function() {

      _.bindAll(this, 'render',
                      'changeName',
                      'changeDescription',
                      'changeKeywords',
                      'showDomainRegistrationForm',
                      'deleteApp',
                      'checkForDomain');

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
          complete: function() {
            iui.onServerReady(function(){window.location.href='/app/'; })
          },
          dataType: "JSON"
        });
      }
      else {
        return false;
      }
    },

    showDomainRegistrationForm: function(e) {
      $(e.target).hide();
      this.$el.find('.register-domain-form').fadeIn();
      this.$el.find('.register-domain-input').focus();
    },

    registerDomain: function(e) {
      alert('register');
    },

    registerSubDomain: function(e) {
      var subdomain = $('.register-subdomain-input').val();
      $.ajax({
        type:"POST",
        url:'/app/'+appId+'/subdomain/'+subdomain+'/',
        data: {},
        success: function(d){
          iui.onServerReady(function(){location.reload(true);});
        },
        error: function() {
          iui.stopAjaxLoading();
          alert("error: see logs");
        }
      });
      iui.startAjaxLoading();
      $(e.target).hide();
    },

    showSubDomainRegistrationForm: function(e) {
      $(e.target).hide();
      this.$el.find('.register-subdomain-form').fadeIn();
      this.$el.find('.register-subdomain-input').focus();
    },

    checkForDomain: function(e) {
      var name = $('.register-domain-input').val();

      $.ajax({
          type: "POST",
          url: '/domains/'+name+'/available_check/',
          success: function(domainIsAvailable) {
            if (domainIsAvailable) {
              $('.register-domain-input').removeClass('not-available');
              $('.register-domain-input').addClass('available');
              $('.register-domain-button').fadeIn();
            } else {
              $('.register-domain-input').removeClass('available');
              $('.register-domain-input').addClass('not-available');
              $('.register-domain-button').hide();
            }
          },
          error: function(resp) {
            // TODO error modal
          },
          dataType: "JSON"
      });
    },

    checkForSubDomain: function(e) {
      var name = $('.register-subdomain-input').val();

      $.ajax({
          type: "POST",
          url: '/subdomains/'+name+'/available_check/',
          success: function(domainIsAvailable) {
            if (domainIsAvailable) {
              $('.register-subdomain-input').removeClass('not-available');
              $('.register-subdomain-input').addClass('available');
              $('.register-subdomain-button').fadeIn();
            } else {
              $('.register-subdomain-input').removeClass('available');
              $('.register-subdomain-input').addClass('not-available');
              $('.register-subdomain-button').hide();
            }
          },
          error: function(resp) {
            // TODO error modal
          },
          dataType: "JSON"
      });
    }
  });

  return AppInfoView;
});
