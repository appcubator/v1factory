define(['jquery-ui'], function() {

  var comp = {

    el : null,

    div : function(txt) {
      this.el = document.createElement('div');
      this.el.appendChild(document.createTextNode(txt));
      return this;
    },

    h1 : function(txt) {
      var newEl = document.createElement('h1');
      newEl.appendChild(document.createTextNode(txt));
      this.el.appendChild(newEl);
      this.el = newEl;
      return this;
    },

    span : function(txt) {
      var newEl = document.createElement('span');
      newEl.appendChild(document.createTextNode(txt));
      if(this.el){ this.el.appendChild(newEl); } else {this.el = newEl; }
      this.el = newEl;
      return this;
    },

    select: function(txt) {
      var newEl = document.createElement('select');
      newEl.appendChild(document.createTextNode(txt));
      if(this.el){ this.el.appendChild(newEl); } else {this.el = newEl; }
      this.el = newEl;
      return this;
    },

    option: function(txt) {
      var newEl = document.createElement('option');
      newEl.appendChild(document.createTextNode(txt));
      if(this.el){ this.el.appendChild(newEl); } else {this.el = newEl; }
      this.el = newEl;
      return this;
    },

    valProp: function(val) {
      this.el.setAttribute('value', val);
      return this;      
    },

    textarea: function(txt) {
      var newEl = document.createElement('textarea');
      newEl.value = txt;
      if(this.el){ this.el.appendChild(newEl); } else {this.el = newEl; }
      this.el = newEl;
      return this;
    },

    style: function(style) {
      this.el.setAttribute('style', style);
      return this;
    },

    id: function(id) {
      this.el.id = id;
      return this;
    },

    classN: function(clsName) {
      this.el.className = clsName;
      return this;
    },

    html : function(html) {
      this.el.innerHTML += html;
      return this;
    }
  };


  window.comp = comp;

  if (typeof window.define === "function" && window.define.amd) {
    window.define("comp", [], function() {
      return window.comp;
    });
  }

});
