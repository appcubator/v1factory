var TagModel = Backbone.Model.extend({
  initialize: function(bone) {
    var key = _.keys(bone)[0];
    console.log(key);
    this.set('tagName', key);
    this.set('attribs', bone[key].attribs);
    this.set('cons_attribs', bone[key].cons_attribs);
    this.set('className', 'unnamed');
    this.set('style', '');
    this.set('isSingle', bone[key].isSingle);
  }
});

var TagCollection = Backbone.Collection.extend({
  model : TagModel
});

var UIElementModel = Backbone.Model.extend({
  initialize: function(type) {
    var tagCollection = new TagCollection(settingsTags[type]);
    this.set('type', type);
    this.set('tags', tagCollection);
    this.set('tag', tagCollection.first());
  }
});

var UIElementCollection = Backbone.Collection.extend({
  model : UIElementModel
});


var UIElementView = Backbone.ModalView.extend({
  tagName : 'div',
  className : 'element-view',

  initialize: function(uieModel) {
    this.model = uieModel;
    this.render();
  },

  render: function() {
    var elDiv = _.template(iui.getHTML('temp-element-node'), this.model.get('tag').attributes );
    this.el.innerHTML = elDiv;

    var form = _.template(iui.getHTML('temp-element-pane'),{ tags : this.model.get('tags').models,
                                                         attribs: this.model.get('tag').get('attribs')});
    this.el.innerHTML += form;

    return this;
  }

});


var UIElementListView = Backbone.View.extend({
  events : {
    'click div.create-text'       : 'showForm',
    'submit .element-create-form' : 'submitForm'
  },

  initialize: function(UIElementColl, type) {
    _.bindAll(this,'render', 'showForm', 'submitForm');

    this.type = type;
    this.collection = UIElementColl;

    this.render();
  },

  render: function() {
    _(this.collection.models).each(function(uieModel) {

    });

    var html = iui.get('temp-create').innerHTML;
    this.el.innerHTML += _.template(html, {});

    return this;
  },

  showForm: function(e) {
    var newUIElement = new UIElementModel(this.type);
    this.collection.add(newUIElement);
    new UIElementView(newUIElement);
  },

  submitForm: function(e) {
    alert("HEEEEY");
  }

});


var GalleryView = Backbone.View.extend({
  el: document.body,
  events: {
    'click #save' : 'save'
  },

  initialize: function() {
    _.bindAll(this,'save', 'render');

    var buttonCollection     = new UIElementCollection(uieState["button"]);
    var imageCollection      = new UIElementCollection(uieState["image"]);
    var headerTextCollection = new UIElementCollection(uieState["header-text"]);
    var textCollection       = new UIElementCollection(uieState["text"]);
    var linkCollection       = new UIElementCollection(uieState["link"]);
    var textInputCollection  = new UIElementCollection(uieState["text-input"]);
    var passwordCollection   = new UIElementCollection(uieState["password"]);
    var textAreaCollection   = new UIElementCollection(uieState["text-area"]);
    var lineCollection       = new UIElementCollection(uieState["line"]);
    var dropdownCollection   = new UIElementCollection(uieState["dropdown"]);
    var boxCollection        = new UIElementCollection(uieState["box"]);

    var buttonView     = new UIElementListView(buttonCollection, 'button');
    iui.get('button').appendChild(buttonView.el);
    var imageView      = new UIElementListView(imageCollection, 'image');
    iui.get('image').appendChild(imageView.el);
    var headerTextView = new UIElementListView(headerTextCollection, 'header-text');
    iui.get('header-text').appendChild(headerTextView.el);
    var textView       = new UIElementListView(textCollection, 'text');
    iui.get('text').appendChild(textView.el);
    var linkView       = new UIElementListView(linkCollection, 'link');
    iui.get('link').appendChild(linkView.el);
    var textInputView  = new UIElementListView(textInputCollection, 'text-input');
    iui.get('text-input').appendChild(textInputView.el);
    var passwordView   = new UIElementListView(passwordCollection, 'password');
    iui.get('password').appendChild(passwordView.el);
    var textAreaView   = new UIElementListView(textAreaCollection, 'text-area');
    iui.get('text-area').appendChild(textAreaView.el);
    var lineView       = new UIElementListView(lineCollection, 'line');
    iui.get('line').appendChild(lineView.el);
    var dropdownView   = new UIElementListView(dropdownCollection, 'dropdown');
    iui.get('dropdown').appendChild(dropdownView.el);
    var boxView        = new UIElementListView(boxCollection, 'box');
    iui.get('box').appendChild(boxView.el);

  },

  render: function() {

  },

  save: function() {
    $.ajax({
      type: "POST",
      url: '/app/'+appId+'/uiestate/',
      data: JSON.stringify(uieState),
      success: function() { },
      dataType: "JSON"
    });
  }
});

var settingsTags = {

  "button": {
    'input': {
      attribs: ['value'],
      cons_attribs: {
        class: 'btn',
        type: 'submit'
      },
      isSingle: true
    }
  },

  "image" : {
    'img' : {
      attribs: ['src'],
      isSingle: true
    }
  },

  "header-text": {
    'h1' : {
      attribs : null,
      isSingle: false
    },
    'h2' : {
      attribs : null,
      isSingle: false
    },
    'h3' : {
      attribs : null,
      isSingle: false
    }
  },

  "text" : {
    'span': {
      attribs : null,
      isSingle: false
    }
  },

  "link" : {
    'a' : {
      attribs  : ['href'],
      isSingle: false
    }
  },

  "text-input" : {
    'input' : {
      attribs : null,
      cons_attribs: {
        'type' : 'text'
      },
      isSingle: true
    }
  },

  "password" : {
    'input' : {
      cons_attribs : {
        type  : 'password'
      },
      attribs : null,
      isSingle: true
    }
  },

  "text-area" : {
    'textarea' : {
      attribs : null,
      isSingle: false
    }
  },

  "line" : {
    'div' : {
      cons_attribs : {
        class : 'span12'
      },
      attribs : null,
      isSingle: false
    }
  },

  "dropdown" : {
    'select' : {
      attribs : null,
      isSingle: true
    }
  },

  "box" : {
    'div': {
      attribs : null,
      cons_attribs : {
        style : 'background-color:#ccc;'
      },
      isSingle: false
    }
  }
};
