var UIElementAttributesModel = Backbone.Model.extend({
});

var UIElementStyleModel = Backbone.Model.extend({
});

var UIElementModel = Backbone.Model.extend({
  initialize: function(bone) {
    this.set('attribs', new UIElementAttributesModel(bone.attribs));
    this.set('style', new UIElementStyleModel(bone.style));
  },
  toJSON: function() {
    console.log(this);
    json = this.attributes;
    console.log(this.get('attribs'));
    json.attribs = this.get('attribs').attributes;
    return json;
  }
});

var UIElementCollection = Backbone.Collection.extend({
  model : UIElementModel,
  initialize: function (models, type) {
    this.type = type;
  }
});


var UIElementModalView = Backbone.ModalView.extend({
  tagName : 'div',
  className : 'element-view',
  events: {
    'change input' : 'inputChanged',
    'keyup textarea' : 'inputChanged'
  },
  initialize: function(uieModel) {
    _.bindAll(this, 'inputChanged', 'reRenderElement');
    this.model = uieModel;

    this.model.bind('change:style', this.reRenderElement);
    this.model.bind('change:value', this.reRenderElement);

    this.render();
  },

  render: function() {
    var div = document.createElement('div');
    div.className = "node-wrapper";

    var elDiv = _.template(iui.getHTML('temp-element-node'), {info: this.model.attributes,
                                                              attribs: this.model.get('attribs').attributes});
    div.innerHTML = elDiv;
    this.el.appendChild(div);

    var form = _.template(iui.getHTML('temp-element-pane'),{ tags : [] ,
                                                         info: this.model.attributes,
                                                         attribs: this.model.get('attribs').attributes});

    this.el.innerHTML += form;

    return this;
  },

  inputChanged: function(e) {
    var props = e.target.className.split('-');

    if(props.length == 1) {
      this.model.set(props[0], e.target.value);
    }

    if(props.length == 2) {
      this.model.get(props[0]).set(props[1], e.target.value);
    }
  },

  reRenderElement: function() {
    this.$el.find('.node-wrapper').html(_.template(iui.getHTML('temp-element-node'), {info: this.model.attributes,
                                                              attribs: this.model.get('attribs').attributes}));
  }

});

var UIElementView = Backbone.View.extend({
  el: null,
  className: 'widgetWrapper',

  events : {
    'click' : 'openModal'
  },

  initialize: function(model) {
    _.bindAll(this, 'render',
                    'openModal');

    this.model = model;
    this.model.bind('change', this.render);
    this.render();
    this.delegateEvents();
    if(model.isNew()) this.openModal();
  },

  render: function() {
    this.el.innerHTML ='';
    var div = document.createElement('div');
    div.className = 'pane-inline offsetr1 border minhi hi6 span9 hoff1 elem-' + this.model.cid;

    div.innerHTML = _.template(iui.getHTML('temp-element-node'), {info: this.model.attributes,
                                                              attribs: this.model.get('attribs').attributes});

    this.el.appendChild(div);
    this.el.style.display = 'inline-block';
    return this;
  },

  openModal: function () {
    new UIElementModalView(this.model);
  }
});


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
    createBtn.innerHTML = _.template(iui.getHTML('temp-create'), {});

    this.el.appendChild(createBtn);
    return this;
  },


  showForm: function(e) {
    var newModel = new UIElementModel(baseTags[this.type][0]);
    this.collection.push(newModel);
  },

  submitForm: function(e) {
    //alert("HEEEEY");
  },

  appendUIE: function(uieModel) {
    console.log(uieModel);
    var newView = new UIElementView(uieModel);
    this.elems.appendChild(newView.el);
  }
});


var GalleryView = Backbone.View.extend({
  el: document.body,
  events: {
    'click #save' : 'save'
  },

  initialize: function() {
    _.bindAll(this,'save', 'render');

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
    json["header-text"]= this.headerTextCollection.toJSON()||{};
    json["text"]       = this.textCollection.toJSON()||{};
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

var baseTags = {

  "button": [
    {
      tagName : 'input',
      class_name : 'btn',
      attribs: {
        type : 'submit',
        class: 'btn',
        value : "Button1"
      },
      content : null,
      isSingle: true
    }
  ],

  "image" : [
    {
      tagName : 'img',
      content : null,
      attribs : {
        src : '/static/img/placeholder.png'
      },
      isSingle : true
    }
  ],

  "header-text": [
    {
      tagName : 'h1',
      attribs : null,
      content : {
        'text' : 'Default header!'
      },
      isSingle: false
    }
  ],

  "text" : [
    {
      tagName : 'span',
      attribs : {
        'style' : ''
      },
      content : {
        'text' : 'Default text!'
      },
      isSingle: false
    }
  ],

  "link" : [
    {
      tagName  : 'a',
      attribs  : {
        'href' : '{{homepage}}'
      },
      content: {
        'text' : 'Default Link...'
      },
      isSingle: false
    }
  ],

  "text-input" : [
    {
      tagName : 'input',
      attribs : {
        type  : 'text',
        name  : 'wrong-name',
        placeholder: 'Default placeholder...'
      },
      content : {},
      isSingle: true
    }
  ],

  "password" : [
    {
      tagName : 'input',
      attribs : {
        type  : 'password',
        name  : 'wrong-name',
        placeholder: 'Default placeholder...'
      },
      content : {},
      isSingle: true
    }
  ],

  "text-area" : [
    {
      tagName : 'textarea',
      attribs : {
      },
      content  : {
        'text' : 'Default Text Area...'
      },
      isSingle: false
    }
  ],

  "line" : [
    {
      tagName : 'div',
      attribs : {
        class : 'span12'
      },
      content : null,
      isSingle: false
    }
  ],

  "dropdown" : [
    {
      tagName : 'select',
      content: {
        text : '<option>Option 1</option>'
      },
      attribs : null,
      isSingle: true
    }
  ],

  "box" : [
    {
      tagName : 'div',
      content: null,
      attribs : {
        style : 'background-color:#ccc;'
      },
      isSingle: false
    }
  ]
};
