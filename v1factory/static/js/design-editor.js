var designOptions = {
  'background-color' : {
    id: "backgroundColor",
    name: "Background Color",
    type: "color-picker",
    options: ['#333', '#444', '#555', '#666', '#777', '#888'],
    css: 'background-color:<%=content%>;'
  },
  'background-image' : {
    id: "backgroundImage",
    name: "Background Image",
    type: "image-picker",
    options: ['/static/img/sample_bg.png', '/static/img/sample_bg.png', '/static/img/sample_bg.png'],
    css: 'background-image:url(<%=content%>);'
  },
  'text-color' : {
    id: "textColor",
    name: "Text Color",
    type: "color-picker",
    options: ['#333', '#444', '#555', '#666', '#777', '#fff'],
    css: 'color:<%=content%>;'
  },
  'text-size' : {
    id: "fontSize",
    name: "Text Size",
    type: "size-picker",
    options: ['10px', '11px', '12px', '13px', '14px'],
    css: 'font-size:<%=content%>; line-height:<%=content%>;'
  },
  'text-family' : {
    id: "fontFamily",
    name: "Text Family",
    type: "font-picker",
    options: ['Georgia, serif', '"Palatino Linotype", "Book Antiqua", Palatino, serif',
                '"Times New Roman", Times, serif',
                'Arial, Helvetica, sans-serif',
                '"Arial Black", Gadget, sans-serif',
                '"Comic Sans MS", cursive, sans-serif',
                'Impact, Charcoal, sans-serif',
                '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
                'Tahoma, Geneva, sans-serif',
                '"Trebuchet MS", Helvetica, sans-serif',
                'Verdana, Geneva, sans-serif',
                'Helvetica Neue", Helvetica, "Lucida Grande"'],
    css: 'font-family:<%=content%>;'
  },
  'header-color' : {
    id: "headerColor",
    name: "Header Color",
    type: "color-picker",
    options: ['#333', '#444', '#555', '#666', '#777', '#888'],
    css: 'color:<%=content%>;',
    tag: 'h2'
  },
  'header-size' : {
    id: "headerSize",
    name: "Header Size",
    type: "size-picker",
    options: ['10px', '11px', '12px', '13px', '14px', '16px'],
    css: 'font-size:<%=content%>; line-height:<%=content%>;',
    tag: 'h2'
  },
  'header-family' : {
    id: "headerFamily",
    name: "Header Family",
    type: "font-picker",
    options: [  'Georgia, serif', '"Palatino Linotype", serif',
                '"Times New Roman", Times, serif',
                'Arial, Helvetica, sans-serif',
                '"Arial Black", Gadget, sans-serif',
                '"Comic Sans MS", cursive, sans-serif',
                'Impact, Charcoal, sans-serif',
                '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
                'Tahoma, Geneva, sans-serif',
                '"Trebuchet MS", Helvetica, sans-serif',
                'Verdana, Geneva, sans-serif',
                'Helvetica Neue", Helvetica, "Lucida Grande"'],
    css: 'font-family:<%=content%>;',
    tag: 'h2'
  }
};


var DesignProperty = Backbone.Model.extend({});
var DesignPropertiesCollection = Backbone.Collection.extend({
  model : DesignProperty
});

var DesignPropertyView = Backbone.View.extend({
  el  : null,
  tagName : 'div',
  className: 'property hi3 hoff1 offset1 span22',
  
  initialize: function(model) {
    _.bindAll(this, 'render', 'renderTitle', 'style', 'select', 'amendAppState');
    this.model = model;
    this.model.bind('change', this.amendAppState);
    this.options = designOptions[this.model.get('type')];
    console.log(this.options);
    this.options['currentValue'] = this.model.get('value');

    this.render();
    this.style();
  },

  render: function() {
    
  },

  renderTitle: function() {
    this.el.innerHTML =  '<h3>' + this.options.name + '</h3>';
  },

  style: function() {

    if(this.styleTag) {
      $(this.styleTag).remove();
    }

    var styleTag = document.createElement('style');
    styleTag.id = this.options.id;

    var styleContent = '.sample ' + (this.options.tag||'') + ' {';
    styleContent += this.options.css.replace(/<%=content%>/g, this.options.currentValue);
    styleContent += '}';

    styleTag.innerHTML = styleContent;
    this.styleTag = styleTag;

    document.getElementsByTagName('head')[0].appendChild(styleTag);
  },

  amendAppState: function(item) {
    // appState.pageProps[this.model.id] = _.omit(this.model.attributes, 'options');
    // this.style();
  }
});

var DesignColorPickerPropertyView = DesignPropertyView.extend({
  events: {
    'click .opt' : 'select'
  },

  render: function() {
    var self = this;
    this.renderTitle();

    var newElem = '<div class="options">';
    _(this.options.options).each(function(option, ind){
      var bool = (self.model.get('value') == option)?'selected':'';
      newElem += '<div class="opt '+ bool +'" id="color-'+ ind +'" style="background-color:'+ option +';"></div>';
    });
    newElem += '<div class="opt"><input class="color"></div>';
    newElem += '</div>';
    this.el.innerHTML += newElem;
  },

  select: function(e) {
    $('.opt', this.el).removeClass('selected');
    $(e.target).addClass('selected');
    var val = String(e.target.id).replace('color-','');
    this.model.set('value', this.options.options[val]);
  }
});


var DesignImagePickerPropertyView = DesignPropertyView.extend({
  events: {
    'click .opt' : 'select'
  },
  render: function() {
    var self = this;
    this.renderTitle();

    var newElem = '<div class="background options">';
    _(this.options.options).each(function(option){
      var bool = (self.model.get('value') == option)?'selected':'';
      newElem += '<div class="opt '+ bool +'" style="background-image:url(\''+ option +'\');"></div>';
    });
    newElem += '</div>';
    this.el.innerHTML += newElem;
  },

  select: function(e) {
    
  }
});


var DesignSizePickerPropertyView = DesignPropertyView.extend({
  className: 'property hi3 hoff1 offset1 span9',
  events: {
    'change .size' : 'select'
  },
  render: function() {
    var self = this;
    this.renderTitle();
    var newElem = '<div class="size options"><select>';
    _(this.options.options).each(function(option){
      var bool = (self.model.get('value') == option)?'selected':'';
      newElem += '<option '+ bool +'>'+ option +'</option>';
    });
    newElem += '</select></div>';
    this.el.innerHTML += newElem;
  },

  select: function(e) {
    var val = e.target.value;
    console.log(val);
    this.model.set('value', val);    
  }
});


var DesignFontPickerPropertyView = DesignPropertyView.extend({
  className: 'property hi3 hoff1 offset1 span9',
  events: {
    'change .size' : 'select'
  },
  render: function() {
    var self = this;
    this.renderTitle();
    var newElem = '<div class="size options"><select>';
    _(this.options.options).each(function(option, ind){
      var bool = (self.model.get('value') == option)?'selected':'';
      newElem += '<option'+ bool +' value ="'+ ind +'">'+ option +'</option>';
    });
    newElem += '</select></div>';
    this.el.innerHTML += newElem;
  },

  select: function(e) {
    var val = e.target.value;
    console.log(val);
    this.model.set('currentValue', this.model.get('options')[val]);
  }
});

var DesignEditorView = Backbone.View.extend({
  el : null,
  tagName    : 'div',
  className : 'props-pane',
  events: {

  },
  initialize: function(item) {
    _.bindAll(this, 'render', 'newProperty', 'saveDesign');

    this.model = item;
    this.collection = new DesignPropertiesCollection();
    this.collection.bind('add', this.newProperty, this);


    this.render();
    this.collection.add(item.get('design-props'));

  },

  render: function() {

  },

  newProperty: function(item) {
    console.log(item);
    var type = item.get('type');
    var newView;
    switch(type){
      case "background-color":
      case "text-color":
      case "header-color":
        newView = new DesignColorPickerPropertyView(item);
        break;
      case "background-image":
        newView = new DesignImagePickerPropertyView(item);
        break;
      case "header-size":
      case "text-size":
        newView = new DesignSizePickerPropertyView(item);
        break;
      case "header-family":
      case "text-family":
        newView = new DesignFontPickerPropertyView(item);
        break;
    }
    console.log(newView);
    this.el.appendChild(newView.el);
  },

  saveDesign: function() {
    console.log(appState);
    console.log(JSON.stringify(appState));
    $.ajax({
      type: "POST",
      url: '/app/1/state/',
      data: JSON.stringify(appState),
      success: function() {},
      dataType: "JSON"
    });
  }
});
