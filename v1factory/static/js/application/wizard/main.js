require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.filedrop" : "../../libs/jquery/jquery.filedrop",
    "jquery.flexslider" : "../../libs/jquery/jquery.flexslider-min",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "iui" : "../../libs/iui/iui",
    "comp": "../../libs/iui/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "./",
    "editor" : "./editor",
    "dicts" : "./dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "answer" : "../../libs/answer/answer",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial",
    "wizard" : "./"
  },

  shim: {
    "prettyCheckable": {
      deps: ['jquery']
    },
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    },
    "answer" : {
      deps: ["../../libs/answer/lib/natural", "underscore", "jquery"]
    }
  }

});

//libs
require([
  "wizard/QuestionView",
  "wizard/wizard-questions",
  "backbone",
  "bootstrap",
  "iui",
  "comp",
  'prettyCheckable'
],
function (QuestionView) {

  var WizardView = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this, 'renderQuestion', 'next');
      this.renderQuestion(questions['platform']);
    },

    renderQuestion: function(qDict) {
      var qView = new QuestionView(qDict);
      qView.bind('next', this.next);
      $('.racoon').append(qView.el);
    },

    next: function(inp) {
      if(!inp) return;
      var qDict = questions[inp];
      this.renderQuestion(qDict);
    }

  });

  new WizardView();

});