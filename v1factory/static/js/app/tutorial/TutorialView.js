define([
  'mixins/BackboneModal',
  './TutorialDict'
],
function(Backbone) {

  var TutorialView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'tutorial-view',
    width: 700,

    events : {
      "click #tutorial-menu-list li" : "clickedMenuItem"
    },

    initialize: function(data) {
      _.bindAll(this, 'render',
                      'renderLeftMenu',
                      'renderMainModal',
                      'appendMenuItem',
                      'clickedMenuItem',
                      'chooseSlide',
                      'selectMenu');
      this.render();
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

    chooseSlide: function(addr) {
      this.addr = addr;
      this.selectMenu();

      var obj = TutorialDirectory[addr[0]];
      if(addr[1]) {
        obj = obj.contents[addr[1]];
      }

      this.showSlide(obj);
    },

    selectMenu: function (addr) {
      var addrStr = this.addr.join('-');
      console.log('#'+addrStr);
      this.$el.find('.selected').removeClass('selected');
      $('#'+addrStr).addClass('selected');
    },

    showSlide: function(obj) {
      //this.el.innerHTML = obj.html;
      // TODO see if this is ok.
      $('.tutorial-content').html(obj.html);
    }
  });

  return TutorialView;
});
