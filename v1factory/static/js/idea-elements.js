uiLibrary = {
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
      attribs : {
        'src' : '/static/img/placeholder.png'
      },
      content : null,
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