var TagModel = Backbone.Model.extend({
  
});

var TagCollection = Backbone.Collection.extend({
  model : TagModel
});

var UIElementModel = Backbone.Model.extend({
  initialize: function(type) {
    this.set('type', type);
    this.set('tags', new TagCollection(settingsTags[type]));
  }
});

var UIElementCollection = Backbone.Collection.extend({
  model : UIElementModel
});


var UIElementView = Backbone.ModalView.extend({
  tagName : 'div',
  className : 'element-view',
  initialize: function() {
    this.render();
    this.el.innerHTML = 'HOLLA!!!!';
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
    $(e.target).hide();
    // $('.element-create-form', this.el).fadeIn();
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
      attribs: ['submit', 'value'],
      cons_attribs: {
        class: 'btn'
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
        type  : 'password',
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
}
