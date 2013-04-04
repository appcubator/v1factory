define([
  'backboneui'
],
function(BackboneUI) {

  var PageStylePicker = BackboneUI.ModalView.extend({
    el     : document.getElementById('page-style-picker'),
    width  : 800,
    events : {
      'click .page-template' : 'selected'
    },

    initialize: function(widgetsCollection){
      _.bindAll(this, 'render',
                      'selected');

      this.collection = widgetsCollection;
      this.render();
    },

    selected : function(e) {
      var tempId = String(e.target.id).replace('page-','');
      this.collection.add(uieState.pages[tempId].uielements);
      this.closeModal();
    },

    render: function() {
      var self = this;
      this.el.innerHTML = "<h2>Choose a template to start with?</h2>";
      this.el.innerHTML += "<ul>";
      console.log(uieState);
      _(uieState.pages).each(function(page, ind) {
        self.el.innerHTML += '<li class="page-template" id="page-'+ ind +'">'+ page.name +'</li>';
      });
      this.el.innerHTML += "</ul>";
    }
  });

  return PageStylePicker;
});