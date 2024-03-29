define([
  'mixins/BackboneModal',
  'answer',
  './TutorialDict'
],
function(Backbone) {

  var TutorialView = Backbone.View.extend({
    tagName: 'div',
    className: 'tutorial-view',
    css : "tutorial",

    addr : [0],

    events : {
      "click #tutorial-menu-list li" : "clickedMenuItem",
      "submit .tutorial-q-form" : 'submittedQuestion',
      'click .answer-slide'     : 'showAnswer',
      "submit #feedback-form"   : 'submittedFeedback'
    },

    initialize: function(directory) {
      _.bindAll(this, 'render',
                      'renderLeftMenu',
                      'renderMainModal',
                      'parseAnswers',
                      'appendMenuItem',
                      'clickedMenuItem',
                      'chooseSlide',
                      'selectMenu',
                      'keyhandler',
                      'submittedQuestion',
                      'showQuestionSlide',
                      'showAnswer',
                      'submittedFeedback');

      if(directory) this.addr = directory;

      this.loadCSS();
      this.render();
      this.chooseSlide(this.addr, true);
      this.reader = new answer();
      this.parseAnswers(TutorialDirectory);

      $(window).bind('keydown', this.keyhandler);
    },

    loadCSS: function() {
      var self = this;
    //<link type="text/css" href="{{ STATIC_URL }}css/tutorial.css" rel="stylesheet"/>
      if(!iui.get('css-tutorial')) {
        var cssFile = document.createElement('link');
        cssFile.setAttribute('type', 'text/css');
        cssFile.setAttribute('href', '/static/css/' + self.css + '.css');
        cssFile.setAttribute('rel', 'stylesheet');
        cssFile.id = 'css-' + self.css;
        console.log(cssFile);
        document.getElementsByTagName('head')[0].appendChild(cssFile);
      }
    },

    render : function(img, text) {
      this.renderBg();
      this.renderLeftMenu();
      this.renderMainModal();
      document.body.appendChild(this.el);
      return this;
    },

    renderBg: function() {
      var self = this;
      var bgDiv = document.createElement('div');
      bgDiv.className = 'modal-bg';
      this.bgDiv = bgDiv;
      $(bgDiv).on('click', function(e) {
        self.closeModal();
      });
      this.el.appendChild(bgDiv);
    },

    renderMainModal: function() {
      var mainDiv = document.createElement('div');
      mainDiv.className = 'tutorial-content';
      this.mainDiv = mainDiv;
      this.el.appendChild(mainDiv);
    },

    renderLeftMenu: function() {
      var menuDiv = document.createElement('div');
      menuDiv.className = 'tutorial-menu';
      var menuUl  = document.createElement('ul');
      menuUl.id = "tutorial-menu-list";

      var searchLi = document.createElement('div');
      searchLi.innerHTML = '<form class="tutorial-q-form"><input type="text" class="q-input" placeholder="Type your question..."><input class="btn" type="submit" value="?"></form>';
      searchLi.className = "search-bar";

      this.appendMenuItem(menuUl, TutorialDirectory);

      menuDiv.appendChild(searchLi);
      menuDiv.appendChild(menuUl);
      this.el.appendChild(menuDiv);
    },

    appendMenuItem: function (node, arr, pInd) {
      var self =  this;
      var prefix = "";
      if(pInd) prefix = pInd + "-";

      _.each(arr, function(item, ind) {
        var itemNode = document.createElement('li');
        itemNode.innerText = item.title;
        itemNode.id = prefix + ind;
        node.appendChild(itemNode);
        if(item.contents) {
          var menuUl = document.createElement('ul');
          self.appendMenuItem(menuUl, item.contents, ind);
          node.appendChild(menuUl);
        }
      });
    },

    parseAnswers: function(dict) {
      var self = this;
      _(dict).each(function(item, ind) {
        if(item.view) {
          self.reader.read(iui.getHTML(item.view), [ind] ,item.title);
        }

        // if(item.contents) {
        //   self.parseAnswers(item.contents);
        // }
      });
    },

    clickedMenuItem: function(e) {
      var addr = String(e.target.id).split('-');
      this.chooseSlide(addr);
    },

    chooseSlide: function(addr, isNew) {
      var self = this; 

      this.addr = addr;
      this.selectMenu();

      if(!isNew) {

        $(this.mainDiv).animate({
          top: "800px",
          opacity: "0"
        }, 240, function() {

          $(this).css({top: '-800px'});
          var obj = TutorialDirectory[addr[0]];
          if(addr[1]) {
            obj = obj.contents[addr[1]];
          }

          self.showSlide(obj, addr);

        });

        $(this.mainDiv).delay(240).animate({
          top: "50px",
          opacity: "1"
        });
      }
      else {
        console.log( TutorialDirectory[addr[0]]);
        var obj = TutorialDirectory[addr[0]];
        if(addr[1]) {
          obj = obj.contents[addr[1]];
        }

        this.showSlide(obj, addr);
      }


    },

    selectMenu: function (addr) {
      console.log(addr);
      var addrStr = this.addr.join('-');
      this.$el.find('.selected').removeClass('selected');
      $('#'+addrStr).addClass('selected');
    },

    showSlide: function(obj, addr) {
      var title = '<h2>'+ obj.title + '</h2><div class="main-img '+ obj.view +'" style="background-image:url('+ obj.img +')"></div>';
      $('.tutorial-content').html(title + '<div class="text-cont">' + iui.getHTML(obj.view) +'</div>');

      $.ajax({
          type: "POST",
          url: '/log/slide/',
          data: {
            title: obj.title,
            directory: addr.join(',')
          },
          success: function(data) {
            if(typeof v1 != 'undefined') { v1.betaCheck(data); }
          },
          dataType: "JSON"
      });


    },

    showQuestionSlide: function(question, results) {
      console.log(results);

      var title = '<h2>'+ 'Question' + '</h2><div class="main-img q-mark" style="background-image:url(/static/img/tutorial/large-q-mark.png)">'+ question +'</div>';
      var resultItems = '';

      _(results).each(function(result) {
        console.log(result);
        resultItems += '<li class="answer-slide" id="slide-'+result.dir.join('-') + '"><h3>'+ result.title +'</h3>' + result.article + '</li>';
      });

      if(!results.length) {
        resultItems += '<li class="no-result">No answers could be found :( But we\'ll get back to you soon!</li>';
      }

      $('.tutorial-content').html('');
      $('.tutorial-content').html(title + '<ul class="text-cont">'+resultItems+'</ul>');
    },

    selectNext: function (obj) {
      var self = this;
      var cur = _.last(self.addr);

      if(self.addr.length == 1) {
        if(TutorialDirectory[cur].contents) {
          self.addr = [self.addr[0], 0];
        }
        else if(TutorialDirectory[cur + 1]) {
          self.addr = [cur +1];
        }
      }
      else {
        if(TutorialDirectory[self.addr[0]].contents[self.addr[1] + 1]) {
          self.addr = [self.addr[0], self.addr[1]+1];
        }
        else if(TutorialDirectory[self.addr[0] + 1]) {
          self.addr = [self.addr[0] + 1];
        }
      }

    },

    selectPrevious: function (obj) {
      var self = this;
      var cur = _.last(self.addr);

      if(self.addr.length == 1) {
        if(TutorialDirectory[cur-1].contents) {
          self.addr = [cur-1, (TutorialDirectory[cur-1].contents.length - 1)];
        }
        else if(TutorialDirectory[cur - 1]) {
          self.addr = [cur - 1];
        }
      }
      else {
        if(TutorialDirectory[self.addr[0]].contents[self.addr[1] - 1]) {
          self.addr = [self.addr[0], self.addr[1] - 1];
        }
        else if(TutorialDirectory[self.addr[0]]) {
          self.addr = [self.addr[0]];
        }
      }
    },

    keyhandler: function (e) {
      var self = this;
      switch(e.keyCode) {
        case 39:
        case 40:
         self.selectNext();
         self.chooseSlide(self.addr, false);
         e.preventDefault();
         break;
        case 37:
        case 38:
         self.selectPrevious();
         self.chooseSlide(self.addr, false);
         e.preventDefault();
         break;
        case 27:
         self.closeModal();
         break;
      }
    },

    submittedQuestion: function(e) {
      e.preventDefault();

      var question = this.$el.find('.q-input').val();
      var results = this.reader.match(question);
      this.showQuestionSlide(question, results);


      $.ajax({
        type: "POST",
        url: '/log/slide/',
        data: {
          directory: null,
          title : question
        },
        success: function(data) {
        },
        dataType: "JSON"
      });

      e.preventDefault();
    },

    showAnswer: function(e) {
      console.log(e.target.id);
      var id = (e.target.id||e.target.parentNode.id).replace('slide-', '');
      this.chooseSlide([id], false);
    },

    submittedFeedback: function(e) {
      var response = {};
      response.like = $('#like-appcubator').val();
      response.dislike = $('#dislike-appcubator').val();
      response.features = $('#features-appcubator').val();

      $.ajax({
          type: "POST",
          url: '/log/feedback/',
          data: response,
          success: function(data) {
          },
          dataType: "JSON"
      });

      $('#feedback-check').prop('checked', true);
      this.closeModal();
      alert('Thanks for your feedback!');
      e.preventDefault();
    },

    onClose: function() {
      $(this.el).empty();
      $(window).unbind('keydown', this.keyhandler);
    },

    closeModal: function() {
      this.remove();
      this.stopListening();
    }
  });

  return TutorialView;
});
