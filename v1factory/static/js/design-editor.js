var DesignProperty = Backbone.Model.extend({});
var DesignPropertiesCollection = Backbone.Collection.extend({
  model : DesignProperty
});

var DesignPropertyView = Backbone.View.extend({
  el  : null,
  tagName : 'div',
  className: 'property hi3 hoff1 span14',
  
  initialize: function(model, pageModel, ind) {

    _.bindAll(this, 'render', 'renderTitle', 'style', 'select', 'amendAppState');
    this.model = model;
    this.model.bind('change', this.amendAppState);
    this.options = designOptions[this.model.get('type')];
    this.options['currentValue'] = this.model.get('value');

    this.pageModel = pageModel;
    this.ind = ind;

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
    var currentProps = this.pageModel.get('design-props');
    currentProps[this.ind] = this.model.toJSON();
    this.pageModel.set('design-props', currentProps);
    //this.style();
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
    e.preventDefault();
    $('.opt', this.el).removeClass('selected');
    $(e.target).addClass('selected');
    var val = String(e.target.id).replace('color-','');
    this.model.set('value', this.options.options[val]);
    return false;
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
      console.log(self.model.get('value'));
      console.log(option);
      var bool = (self.model.get('value') == option)?'selected':'';
      newElem += '<div class="opt '+ bool +'" style="background-image:'+ option +'"></div>';
    });
    newElem += '</div>';
    this.el.innerHTML += newElem;
  },

  select: function(e) {
    e.preventDefault();
    $('.opt', this.el).removeClass('selected');
    $(e.target).addClass('selected');
    var val = e.target.style.backgroundImage;
    console.log(val)
    this.model.set('value', val);
    return false;
  }
});


var DesignSizePickerPropertyView = DesignPropertyView.extend({
  className: 'property hi3 hoff1 span5',
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
    this.model.set('value', val);
    e.preventDefault();
    return false;
  }
});


var DesignFontPickerPropertyView = DesignPropertyView.extend({
  className: 'property hi3 hoff1 span9',
  events: {
    'change .size' : 'select'
  },
  render: function() {
    var self = this;
    this.renderTitle();
    var newElem = '<div class="size options"><select class="font">';
    _(this.options.options).each(function(option, ind){
      var bool = (self.model.get('value') == option)?'selected':'';
      newElem += '<option'+ bool +' value ="'+ ind +'">'+ option +'</option>';
    });
    newElem += '</select></div>';
    this.el.innerHTML += newElem;
  },

  select: function(e) {
    var val = e.target.value;
    this.model.set('value', this.options.options[val]);
    e.preventDefault();
    return false;
  }
});

var DesignEditorView = Backbone.View.extend({
  el : null,
  tagName    : 'div',
  className : 'props-pane',
  events: {

  },
  initialize: function(item) {
    _.bindAll(this, 'render', 
                    'newProperty');

    this.model = item;
    this.collection = new DesignPropertiesCollection();
    this.collection.bind('add', this.newProperty, this);

    this.render();
    this.collection.add(item.get('design-props'));
  },

  render: function() {

  },

  newProperty: function(item) {
    var type = item.get('type');
    var ind = _.indexOf(this.collection.models, item);

    var newView;
    switch(type){
      case "background-color":
      case "text-color":
      case "header-color":
        newView = new DesignColorPickerPropertyView(item, this.model, ind);
        break;
      case "background-image":
        newView = new DesignImagePickerPropertyView(item, this.model, ind);
        break;
      case "header-size":
      case "text-size":
        newView = new DesignSizePickerPropertyView(item, this.model, ind);
        break;
      case "header-family":
      case "text-family":
        newView = new DesignFontPickerPropertyView(item, this.model, ind);
        break;
    }
    this.el.appendChild(newView.el);
  }
});
