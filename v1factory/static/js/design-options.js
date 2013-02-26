var designOptions = {
  'background-color' : {
    id: "backgroundColor",
    name: "Background Color",
    type: "color-picker",
    options: ['#333', '#444', '#555', '#666', '#888'],
    css: 'background-color:<%=content%>;'
  },
  'background-image' : {
    id: "backgroundImage",
    name: "Background Image",
    type: "image-picker",
    options: ['url(/static/img/sample_bg.png)', 'url(/static/img/escheresque_ste.png)', 'url(/static/img/kindajean.png)'],
    css: 'background-image:<%=content%>;'
  },
  'text-color' : {
    id: "textColor",
    name: "Text Color",
    type: "color-picker",
    options: ['#333', '#444', '#555', '#666', '#fff'],
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
    options: ['#333', '#444', '#555', '#666', '#777'],
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