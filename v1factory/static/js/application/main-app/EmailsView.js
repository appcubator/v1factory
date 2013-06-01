define([
  'collections/EmailCollection',
  'models/EmailModel'
],
function(EmailCollection, EmailModel) {

  var EmailsView = Backbone.View.extend({
    events: {
      'click #create-email' : 'createEmail',
      'click .email-display' : 'clickedEmail',
      'keyup .email-name-input' : 'emailNameChanged',
      'keyup .email-subject-input' : 'emailSubjectChanged',
      'keyup .email-content-input' : 'emailContentChanged'
    },

    initialize: function() {
      _.bindAll(this, 'render',
                      'appendEmail',
                      'clickedEmail',
                      'displayEmail',
                      'createEmail',
                      'emailNameChanged',
                      'emailSubjectChanged',
                      'emailContentChanged',
                      'saveEmails');


      this.collection = new EmailCollection(appState.emails||[]);
      this.collection.bind('add', this.appendEmail, this);

      this.render();
      this.collection.bind('add', this.displayEmail);

      $("#save-emails").on('click', this.saveEmails);
    },

    render: function() {
      var self = this;

      this.el.innerHTML = _.template(iui.getHTML('emails-page'), {});
      this.listView = this.$el.find('#email-list');
      _(self.collection.models).each(function(email){
        self.appendEmail(email);
      });

      return this;
    },

    clickedEmail: function(e) {
      var cid = (e.target.id||e.target.parentNode.id).replace('email-','');
      var emailModel = this.collection.get(cid);
      this.displayEmail(emailModel);
    },

    displayEmail: function (emailModel) {
      this.$el.find('.email-name-input').val(emailModel.get('name')).attr('id', 'email-inp-'+ emailModel.cid);
      this.$el.find('.email-subject-input').val(emailModel.get('subject')).attr('id', 'email-inp-'+ emailModel.cid);
      this.$el.find('.email-content-input').val(emailModel.get('content')).attr('id', 'email-inp-'+ emailModel.cid);
    },

    createEmail: function(e) {
      var email = new EmailModel();
      this.collection.push(email);
    },

    appendEmail: function(emailModel) {
      this.listView.append('<li id="email-'+emailModel.cid+'" class="email-display">' + emailModel.get('name') + '</li>');
    },

    emailNameChanged: function(e) {
      var cid = e.target.id.replace('email-inp-', '');
      this.collection.get(cid).set('name', e.target.value);
      $('#email-' + cid).html('<h3>' + e.target.value + '</h3>');
    },

    emailSubjectChanged: function(e) {
      var cid = e.target.id.replace('email-inp-', '');
      this.collection.get(cid).set('subject', e.target.value);

    },

    emailContentChanged: function(e) {
      var cid = e.target.id.replace('email-inp-', '');
      this.collection.get(cid).set('content', e.target.value);
    },

    saveEmails: function(e) {
      appState.emails = this.collection.toJSON();

      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/state/',
        data: JSON.stringify(appState),
        success: function() {},
        dataType: "JSON"
      });
    }
  });

  return EmailsView;
});
