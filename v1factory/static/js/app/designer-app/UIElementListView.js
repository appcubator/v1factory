define([
  'app/designer-app/UIElementView',
  'app/models/UIElementModel',
  'backboneui',
  'iui',
  'app/designer-app/base-tags',
  '../templates/ThemeTemplates'
],
function(UIElementView, UIElementModel, BackboneUI) {

  var UIElementListView = Backbone.View.extend({
    className: 'list',
    events : {
      'click div.create-text'       : 'showForm',
      'submit .element-create-form' : 'submitForm'
    },

    initialize: function(UIElementColl, type) {
      _.bindAll(this,'render', 'showForm', 'submitForm', 'appendUIE');

      this.type = type;
      this.collection = UIElementColl;
      this.collection.bind('add', this.appendUIE);
      this.render();
    },

    render: function() {
      var self = this;
      var div = document.createElement('span');
      div.className = 'elems';
      this.elems = div;
      this.el.appendChild(this.elems);

      _(this.collection.models).each(function(uieModel) {
        uieModel.id = self.collection.length;
        self.appendUIE(uieModel);
      });

      var createBtn = document.createElement('span');
      createBtn.innerHTML = _.template(ThemeTemplates.tempCreate, {});

      this.el.appendChild(createBtn);
      return this;
    },


    showForm: function(e) {
      console.log(baseTags);
      var newModel = new UIElementModel(baseTags[this.type][0]);
      this.collection.push(newModel);
    },

    submitForm: function(e) {
      //alert("HEEEEY");
    },

    appendUIE: function(uieModel) {
      var newView = new UIElementView(uieModel);
      this.elems.appendChild(newView.el);
    }
  });

  return UIElementListView;
});