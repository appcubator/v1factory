define([
  'mixins/BackboneModal'
],
function() {

  var WidgetClassPickerView = Backbone.ModalView.extend({
    el     : document.getElementById('class-picker'),
    width  : 800,
    events : {
      'click .class-name-item'   : 'classChanged'
    },

    initialize: function(widgetModel){
      _.bindAll(this, 'render',
                      'clear',
                      'selectChanged',
                      'classChanged');

      this.model = widgetModel;
      this.render();
    },

    classChanged: function(e) {
      var newClass = (e.target.id||e.target.parentNode.id);
      this.model.set('class_name', newClass);
      this.closeModal();
    },

    selectChanged : function(chg, ch2) {

      if(this.widgetsCollection.selectedEl === null) {
        this.model = null;
        //this.el.innerHTML = '';
      }
      else if(this.widgetsCollection.selectedEl != this.model) {
        this.clear();
        this.model = this.widgetsCollection.selectedEl;
        this.render();
      }
    },

    render: function() {
      var self = this;
      this.list = document.createElement('ul');
      this.list.className = "class-picker";
      var type = this.model.get('type');

      _(uieState[type]).each(function(uie){

        var li = document.createElement('li');
        li.className = 'class-name-item';
        if(self.model.get('class_name') == uie.class_name) {
          li.className +=' selected';
        }

        li.id = uie.class_name;

        if(type == 'yolo') {
         li.innerHTML = (uie.name||uie.class_name);
        }
        else {
          li.innerHTML = '<div class="node" id="'+ uie.class_name+'">'+ self.renderNode(uie)+'</div>';
        }

        self.list.appendChild(li);
      });

      this.el.appendChild(this.list);
    },

    renderNode: function(uie) {
      var temp = Templates.tempNode;
      var el = _.template(temp, { element: uie});
      return el;
    },

    clear: function() {
      this.el.innerHTML = '';
      this.model = null;
    }
  });

  return WidgetClassPickerView;
});