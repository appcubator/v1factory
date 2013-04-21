define([
  'mixins/BackboneModal',
  './TutorialDict'
],
function(Backbone) {

  var TutorialView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'tutorial-view',
    width: 700,

    initialize: function(data) {
      _.bindAll(this, 'render', 'renderLeftMenu', 'renderMainModal', 'appendMenuItem');
      this.render();
    },

    render : function(img, text) {
      this.renderLeftMenu();
      this.renderMainModal();
    },

    renderMainModal: function() {

    },

    renderLeftMenu: function() {
      var menuDiv = document.createElement('div');
      menuDiv.className = 'tutorial-menu';
      var menuUl  = document.createElement('ul');
      this.appendMenuItem(menuUl, TutorialDirectory);
      console.log(this.el);
      console.log(menuDiv);
      menuDiv.appendChild(menuUl);
      this.el.appendChild(menuDiv);
    },

    appendMenuItem: function (node, arr) {
      var self =  this;
      _.each(arr, function(item) {
        console.log(item);
        var itemNode = document.createElement('li');
        itemNode.innerText = item.title;
        node.appendChild(itemNode);
        if(item.contents) {
          var menuUl = document.createElement('ul');
          self.appendMenuItem(menuUl, item.contents);
          node.appendChild(menuUl);
        }
      });
    }
  });

  return TutorialView;
});