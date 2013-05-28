define([
  "backbone"
],
function() {

  var QuestionView = Backbone.View.extend({
    tagName: 'li',
    className: 'question',
    answered: false,

    events: {
      'click .answer' : 'answerChanged',
      'submit .answer' : 'answerSubmitted'
    },

    initialize: function(qDict) {
      _.bindAll(this, 'render', 'renderAnswers', 'answerChanged');
      this.dict = qDict;
      this.render();
    },

    render : function() {
      this.$el.append('<span class="q-sent">' + this.dict.questionText +'</span>');
      this.renderAnswers();
      return this;
    },

    renderAnswers: function() {
      var self = this;
      console.log(this.dict);

      if(this.dict.inputBox) {
        var form = document.createElement('form');
        form.className ="answer";
        $(form).append('<input type="text" class="answer-input" placeholder="'+this.dict.inputBox+'">');
        self.el.appendChild(form);
      }

      _(this.dict.answers).each(function(val, key) {
        var div = document.createElement('span');
        div.className ="answer";
        div.id = key;
        div.innerHTML = val;
        self.el.appendChild(div);
      });

      console.log(this.$el.find('input[type=radio]'));
      if(this.$el.find('input[type=radio]').length) {
        this.$el.find('input[type=radio]').prettyCheckable();
      }
    },

    answerChanged: function(e) {
      this.answer = (e.target.id||e.target.parentNode.id||e.target.parentNode.parentNode.parentNode.id);
      if(!this.answered) {
        var next = this.dict.next.call(this, this.answer);
        this.trigger('next', next);
        this.answered = true;
      }
      else {

      }
    },

    answerSubmitted: function() {
      this.answer = this.$el.find('.answer-input').val();
      if(!this.answered) {
        var next = this.dict.next.call(this, this.answer);
        this.trigger('next', next);
        this.answered = true;
      }
      else {

      }
    }

  });

  return QuestionView;
});