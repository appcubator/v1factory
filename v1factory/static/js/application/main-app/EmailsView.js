define([
  'collections/EmailCollection',
  'models/EmailModel',
  'app/EmailView'
],
function(EmailCollection, EmailModel, EmailView) {

  var EmailsView = Backbone.View.extend({
    events: {
      'click #create-email' : 'createEmail',
      'click #email-list li' : 'clickedEmail',
      'click #save-emails'          : 'saveEmails'
    },

    initialize: function() {
      _.bindAll(this);

      this.collection = new EmailCollection(appState.emails||[]);
      this.collection.bind('add', this.appendEmail, this);

      //setup emailView, populate with first email (new email if none)
      var firstEmail;
      if(this.collection.length > 0) {
        firstEmail = this.collection.at(0);
      }
      else {
        firstEmail = this.collection.create({});
      }
      console.log(firstEmail.toJSON());
      this.emailView = new EmailView({ model: firstEmail });

      this.render();
    },

    render: function() {
      var self = this;

      this.el.innerHTML = _.template(iui.getHTML('emails-page'), {});
      this.listView = this.$el.find('#email-list');
      _(self.collection.models).each(function(email){
        self.appendEmail(email);
      });

      this.emailView.setElement(this.$el.find('form')).render();
      console.log(this.$el.find('input#email-content').html());
      return this;
    },

    clickedEmail: function(e) {
      var cid = e.currentTarget.dataset.cid;
      var emailModel = this.collection.get(cid);
      this.emailView.model = emailModel;
      this.emailView.render();
    },

    createEmail: function(e) {
      var email = this.collection.create({});
      this.emailView.model = email;
      this.emailView.render();
    },

    appendEmail: function(email) {
      this.listView.append('<li data-cid="' + email.cid + '">' + email.get('name') + '</li>');
    },

    saveEmails: function(e) {
      appState.emails = this.collection.toJSON();

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(v1State),
        success: function() {},
        dataType: "JSON"
      });
    }
  });

  return EmailsView;
});
