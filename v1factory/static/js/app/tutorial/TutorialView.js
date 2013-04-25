define([
  'mixins/BackboneModal',
  './TutorialDict'
],
function(Backbone) {

  var TutorialView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'tutorial-view',
    width: 700,

    addr : [0],

    events : {
      "click #tutorial-menu-list li" : "clickedMenuItem"
    },

    initialize: function(directory) {
      _.bindAll(this, 'render',
                      'renderLeftMenu',
                      'renderMainModal',
                      'appendMenuItem',
                      'clickedMenuItem',
                      'chooseSlide',
                      'selectMenu',
                      'keyhandler');

      if(directory) this.addr = directory;

      this.render();
      this.chooseSlide(this.addr, true);

      $(window).bind('keydown', this.keyhandler);
    },

    render : function(img, text) {
      this.renderLeftMenu();
      this.renderMainModal();
    },

    renderMainModal: function() {
      var mainDiv = document.createElement('div');
      mainDiv.className = 'tutorial-content';

      this.el.appendChild(mainDiv);
    },

    renderLeftMenu: function() {
      var menuDiv = document.createElement('div');
      menuDiv.className = 'tutorial-menu';
      var menuUl  = document.createElement('ul');
      menuUl.id = "tutorial-menu-list";
      this.appendMenuItem(menuUl, TutorialDirectory);

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

    clickedMenuItem: function(e) {
      var addr = String(e.target.id).split('-');
      this.chooseSlide(addr);
    },

    chooseSlide: function(addr, isNew) {
      var self = this;

      this.addr = addr;
      this.selectMenu();

      if(!isNew) {

        $(this.modalWindow).animate({
          marginTop: "800px"
        }, 240, function() {

          $(this).css({marginTop: '-800px'});
          var obj = TutorialDirectory[addr[0]];
          if(addr[1]) {
            obj = obj.contents[addr[1]];
          }

          self.showSlide(obj);

        });

        $(this.modalWindow).delay(240).animate({
          marginTop: "-300px"
        });
      }
      else {
        var obj = TutorialDirectory[addr[0]];
        if(addr[1]) {
          obj = obj.contents[addr[1]];
        }

        this.showSlide(obj);
      }


    },

    selectMenu: function (addr) {
      var addrStr = this.addr.join('-');
      this.$el.find('.selected').removeClass('selected');
      $('#'+addrStr).addClass('selected');
    },

    showSlide: function(obj) {
      $('.tutorial-content').html(iui.getHTML(obj.view));
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
         break;
        case 37:
        case 38:
         self.selectPrevious();
         self.chooseSlide(self.addr, false);
         break;
      }

      e.preventDefault();
    },

    onClose: function() {
      $(this.el).empty();
      $(window).unbind('keydown', this.keyhandler);
    }
  });

  return TutorialView;
});
