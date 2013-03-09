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
    console.log(type);
    var self = this;
    var tagCollection = new TagCollection(settingsTags["button"]);
    //this.set('type', type);
    this.set('tags', tagCollection);
    this.set('tag', type);
    if(this.has('tag')) {
      this.get('tag').bind('change', function(){self.trigger('change', self);});
    };
  },

  toJSON: function() {
    var attribs = this.get('tag').attributes;
    attribs.class_name = attribs.className;
    delete attribs.className;
    console.log(attribs);
    attribs.attribs = _.extend(attribs.attribs||{}, attribs.cons_attribs);
    delete attribs.cons_attribs;
    return attribs;
  }
});

var UIElementCollection = Backbone.Collection.extend({
  model : UIElementModel,
  initialize: function (models, type) {
    //console.log(models);
    this.type = type;
  }
});


var UIElementView = Backbone.ModalView.extend({
  tagName : 'div',
  className : 'element-view',
  events: {
    'change input' : 'inputChanged',
    'keyup textarea' : 'inputChanged'
  },
  initialize: function(uieModel) {
    _.bindAll(this, 'inputChanged', 'reRenderElement');
    this.model = uieModel;

    this.model.get('tag').bind('change:style', this.reRenderElement);
    this.model.get('tag').bind('change:value', this.reRenderElement);

    this.render();
  },

  render: function() {
    var div = document.createElement('div');
    div.className = "node-wrapper";

    var elDiv = _.template(iui.getHTML('temp-element-node'), this.model.get('tag').attributes );
    div.innerHTML = elDiv;
    this.el.appendChild(div);

    var form = _.template(iui.getHTML('temp-element-pane'),{ tags : this.model.get('tags').models,
                                                         attribs: this.model.get('tag').get('attribs')});
    this.el.innerHTML += form;

    return this;
  },

  inputChanged: function(e) {
    console.log(e.target.className);
    var props = e.target.className.split('-');
    console.log(props);

    if(props.length == 1) {
      console.log("HEYO");
      this.model.get('tag').set(props[0], e.target.value);
    }

    if(props.length == 2) {
      this.model.get('tag').get(props[0]).set(props[1], e.target.value);
    }
  },

  reRenderElement: function() {
    this.$el.find('.node-wrapper').html(_.template(iui.getHTML('temp-element-node'), this.model.get('tag').attributes ));
  }

});


var UIElementListView = Backbone.View.extend({
  events : {
    'click div.create-text'       : 'showForm',
    'submit .element-create-form' : 'submitForm'
  },

  initialize: function(UIElementColl, type) {
    _.bindAll(this,'render', 'showForm', 'submitForm', 'appendUIE', 'collectionChanged','reRenderUIE');

    this.type = type;
    this.collection = UIElementColl;
    this.collection.bind('add', this.appendUIE);
    this.collection.bind('change', this.collectionChanged);
    this.render();
  },

  render: function() {
    var self = this;
    var div = document.createElement('div');
    div.className = 'elems';
    this.elems = div;
    this.el.appendChild(this.elems);

    _(this.collection.models).each(function(uieModel) {
      console.log(uieModel);
      self.appendUIE(uieModel);
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
  },

  appendUIE: function(uieModel) {
    var div = document.createElement('div');
    div.className = 'pane-inline border minhi hi6 span9 hoff1 elem-' + uieModel.cid;
    div.innerHTML = _.template(iui.getHTML('temp-element-node'), uieModel.get('tag').attributes);
    //console.log(this.elems);
    this.$el.find('.elems').append(div);
    uieModel.bind('change', this.collectionChanged, this);
  },

  collectionChanged: function (uieModel) {
    this.reRenderUIE(uieModel.cid);
  },

  reRenderUIE: function(cid) {
    var model = this.collection.get(cid);
    this.$el.find('.elem-' + cid).html(_.template(iui.getHTML('temp-element-node'), model.get('tag').attributes));
  }

});


var GalleryView = Backbone.View.extend({
  el: document.body,
  events: {
    'click #save' : 'save'
  },

  initialize: function() {
    _.bindAll(this,'save', 'render');

    console.log(uieState);

    this.buttonCollection     = new UIElementCollection(uieState["button"], "button");
    this.imageCollection      = new UIElementCollection(uieState["image"], "image");
    this.headerTextCollection = new UIElementCollection(uieState["header-text"], "header-text");
    this.textCollection       = new UIElementCollection(uieState["text"], "text");
    this.linkCollection       = new UIElementCollection(uieState["link"], "link");
    this.textInputCollection  = new UIElementCollection(uieState["text-input"], "text-input");
    this.passwordCollection   = new UIElementCollection(uieState["password"], "password");
    this.textAreaCollection   = new UIElementCollection(uieState["text-area"], "text-area");
    this.lineCollection       = new UIElementCollection(uieState["line"], "line");
    this.dropdownCollection   = new UIElementCollection(uieState["dropdown"], "dropdown");
    this.boxCollection        = new UIElementCollection(uieState["box"], "box");

    var buttonView     = new UIElementListView(this.buttonCollection, 'button');
    iui.get('button').appendChild(buttonView.el);
    var imageView      = new UIElementListView(this.imageCollection, 'image');
    iui.get('image').appendChild(imageView.el);
    var headerTextView = new UIElementListView(this.headerTextCollection, 'header-text');
    iui.get('header-text').appendChild(headerTextView.el);
    var textView       = new UIElementListView(this.textCollection, 'text');
    iui.get('text').appendChild(textView.el);
    var linkView       = new UIElementListView(this.linkCollection, 'link');
    iui.get('link').appendChild(linkView.el);
    var textInputView  = new UIElementListView(this.textInputCollection, 'text-input');
    iui.get('text-input').appendChild(textInputView.el);
    var passwordView   = new UIElementListView(this.passwordCollection, 'password');
    iui.get('password').appendChild(passwordView.el);
    var textAreaView   = new UIElementListView(this.textAreaCollection, 'text-area');
    iui.get('text-area').appendChild(textAreaView.el);
    var lineView       = new UIElementListView(this.lineCollection, 'line');
    iui.get('line').appendChild(lineView.el);
    var dropdownView   = new UIElementListView(this.dropdownCollection, 'dropdown');
    iui.get('dropdown').appendChild(dropdownView.el);
    var boxView        = new UIElementListView(this.boxCollection, 'box');
    iui.get('box').appendChild(boxView.el);

  },

  render: function() {

  },

  save: function() {
    var json = {};
    json["button"]     = this.buttonCollection.toJSON()||{};
    json["image"]      = this.imageCollection.toJSON()||{};
    json["text"]       = this.imageCollection.toJSON()||{};
    json["link"]       = this.linkCollection.toJSON()||{};
    json["text-input"] = this.textInputCollection.toJSON()||{};
    json["password"]   = this.passwordCollection.toJSON()||{};
    json["text-area"]  = this.textAreaCollection.toJSON()||{};
    json["line"]       = this.lineCollection.toJSON()||{};
    json["dropdown"]   = this.dropdownCollection.toJSON()||{};
    json["box"]        = this.boxCollection.toJSON()||{};

    console.log(json);


    $.ajax({
      type: "POST",
      url: '/app/'+appId+'/uiestate/',
      data: JSON.stringify(json),
      success: function() { },
      dataType: "JSON"
    });
  }
});

var settingsTags = {

  "button": {
    'input': {
      attribs: null,
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
