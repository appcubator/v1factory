


test_json = r"""{
  "name":"NewestApp",
  "info":{
    "keywords":"",
    "domain":"v1factory.org",
    "description":"","name":""
  },
  "users":{
    "name":"User",
    "fields":[],
    "twitter":true,
    "linkedin":true,
    "facebook":true,
    "local":true
  },
  "entities":[{
      "name":"Game",
      "fields":[{"name":"Name","type":"text","required":true},
      {"name":"Description","type":"text","required":false},
      {"name":"Rating","type":"number","required":false},
      {"name":"Picture","type":"image","required":false}],
      "forms":[]
  }],
  "pages":[{
    "url":{"urlparts":[]},
    "navbar":{
      "isFixed":true,"brandName":"AlperGamez","isHidden":false,
      "items":[{"name":"internal://Homepage"},
               {"name":"internal://Registration Page"}]
    },
    "uielements":[{
      "style":"font-size: 32px;\nfont-weight: bold;",
      "isSingle":false,
      "content_attribs":{},
      "hoverStyle":"",
      "class_name":"header-1",
      "container_info":null,
      "content":"Welcome to your Alper Games,\nbest place to find popular games!",
      "tagName":"h1",
      "layout":{"t_padding":15,"top":0,"height":9,"width":12,"b_padding":15,"l_padding":0,"r_padding":0,"alignment":"center","left":0},
      "type":"headerTexts",
      "activeStyle":"",
      "context":null
    },{
      "style":"border-radius: 6px;\nwidth: 180px;",
      "isSingle":true,
      "content_attribs":{
        "src":"https://www.filepicker.io/api/file/HRLXf0LCR2u6ZotkOBeI",
        "href":"internal://New Game Page"},
        "hoverStyle":"",
        "class_name":"full-width-height",
        "container_info":null,
        "content":"https://www.filepicker.io/api/file/HRLXf0LCR2u6ZotkOBeI",
        "tagName":"img",
        "layout":{"t_padding":15,"top":11,"height":19,"width":5,"b_padding":15,"r_padding":15,"l_padding":15,"alignment":"center","left":1},
        "type":"images",
        "activeStyle":"",
        "context":null
      },{
        "style":"",
        "content_attribs":{
          "href":"internal://Registration Page"
        },
        "isSingle":false,
        "context":null,
        "hoverStyle":"",
        "class_name":"link-1",
        "container_info":null,
        "content":"or Sign up here &raquo;",
        "tagName":"a",
        "layout":{"t_padding":15,"b_padding":15,"l_padding":15,"r_padding":15,"alignment":"left","width":4,"top":37,"height":3,"left":7},
        "type":"links",
        "activeStyle":""
      },{
        "content":"",
        "isSingle":false,
        "container_info":{
          "action":"login",
          "uielements":[],
          "form":{
            "name":"Local Login",
            "fields":[{"name":"username","placeholder":"Username","label":"Username","displayType":"single-line-text","type":"text","options":[]},
            {"name":"password","placeholder":"Password","label":"Password","displayType":"password-text","type":"password","options":[]},
            {"name":"Submit","placeholder":"Login","label":"Login","displayType":"button","type":"button","options":[]}],
            "action":"login","goto":"internal://Homepage","belongsTo":null},"entity":"User"},
            "layout":{"width":4,"top":12,"height":15,"left":7,"t_padding":0,"b_padding":0,"l_padding":15,"r_padding":15,"alignment":"left"},
            "content_attribs":{},"context":null},{"layout":{"top":27,"left":7,"height":3,
            "width":2,"r_padding":0,"l_padding":0,"t_padding":15,"b_padding":15,"alignment":"center"},"context":null,"isSingle":false,"container_info":{
                "entity":"User","action":"facebook","form":{"name":"facebook","fields":[{"name":"",
                "placeholder":"Login w/ Facebook","label":"","displayType":"button","type":"button","options":[]}],
                "action":"facebook","goto":"internal://Homepage/","belongsTo":null},"uielements":[]},"content_attribs":{},"content":""},
                {"layout":{"top":27,"left":9,"height":3,"width":2,"t_padding":15,"b_padding":15,"r_padding":0,"l_padding":0,"alignment":"center"},
                "context":null,"isSingle":false,"container_info":{"entity":"User","action":"twitter","form":{"name":"twitter","fields":[{
                    "name":"","placeholder":"Login w/ Twitter","label":"","displayType":"button","type":"button","options":[]}],
                    "action":"twitter","goto":"internal://Homepage/","belongsTo":null},"uielements":[]},"content_attribs":{},"content":""},
                    {"layout":{"t_padding":15,"b_padding":15,"l_padding":15,"r_padding":15,"top":35,"left":1,"height":12,"width":5,"alignment":"left"},"context":null,"style":"","isSingle":false,"content_attribs":{},
                    "hoverStyle":"","class_name":"txt","content":"this was turkish","tagName":"span","activeStyle":"","type":"texts","container_info":null}],"name":"Homepage","access_level":"all","page_name":"Homepage","ind":0},{"navbar":{"isFixed":true,"brandName":null,"isHidden":false,"items":[{"name":"internal://Homepage"},{"name":"internal://Registration Page"}]},"url":{"urlparts":["registration"]},"uielements":[{"content":"Sign Up","layout":{"width":3,"top":1,"left":4,"height":5},"container_info":null,"type":"header-text","tagName":"h1","content_attribs":{},"context":null, "class_name":"nulll", "isSingle": false},{"content":"","isSingle":false,"container_info":{"action":"signup","uielements":[],"form":{"name":"Sign Up","fields":[{"name":"username","placeholder":"Username","label":"Username","displayType":"single-line-text","type":"text","options":[]},{"name":"password1","placeholder":"Password","label":"Password","displayType":"password-text","type":"password","options":[]},{"name":"password2","placeholder":"Confirm Password","label":"Confirm Password","displayType":"password-text","type":"password","options":[]},{"name":"email","placeholder":"Email Address","label":"Email Address","displayType":"email-text","type":"email","options":[]},{"name":"Sign Up","placeholder":"Sign Up","label":"Sign Up!","displayType":"button","type":"button","options":[]}],"action":"signup","goto":"internal://Homepage","belongsTo":null},"entity":"User"},"layout":{"width":3,"top":7,"left":4,"height":28},"context":null,"content_attribs":{}},{"layout":{"top":2,"left":1,"height":17,"width":3},"context":null,"style":"border-radius: 6px;\nwidth: 180px;","isSingle":true,"content_attribs":{"src":"https://www.filepicker.io/api/file/bZcS9sUkRZmPd4NoBqTe"},"hoverStyle":"","class_name":"img-width-fixed","content":"","tagName":"img","activeStyle":"","type":"images","container_info":null}],"name":"Registration Page","access_level":"all","page_name":"Registration Page","ind":1},{"name":"Game Page","url":{"urlparts":["Game_Page","{{Game}}"]},"access_level":"all","uielements":[{"layout":{"top":2,"left":3,"height":5,"width":6},"context":null,"style":"","isSingle":false,"content_attribs":{"style":"font-weight:bold; font-size:20px;"},"hoverStyle":"","class_name":"txt","content":"{{page.Game.Name}}","tagName":"span","activeStyle":"","container_info":null},{"layout":{"top":7,"left":3,"height":6,"width":6},"context":null,"style":"","isSingle":false,"content_attribs":{},"hoverStyle":"","class_name":"txt","content":"{{page.Game.Description}}","tagName":"span","activeStyle":"","container_info":null},{"layout":{"top":2,"left":1,"height":11,"width":2,"r_padding":0,"l_padding":0},"context":null,"style":"border-radius: 6px;\nwidth: 180px;","isSingle":true,"content_attribs":{"src":"/static/img/placeholder.png"},"hoverStyle":"","class_name":"img-width-fixed","content":"{{page.Game.Picture}}","tagName":"img","activeStyle":"","container_info":null},{"layout":{"top":2,"left":9,"height":3,"width":2},"context":null,"style":"","isSingle":false,"content_attribs":{"style":"font-weight:bold;"},"hoverStyle":"","class_name":"txt","content":"Rating:","tagName":"span","activeStyle":"","type":"texts","container_info":null},{"layout":{"top":5,"left":9,"height":8,"width":2},"context":null,"style":"","isSingle":false,"content_attribs":{},"hoverStyle":"","class_name":"txt","content":"{{page.Game.Rating}}","tagName":"span","activeStyle":"","container_info":null}],"navbar":{"brandName":null,"isHidden":false,"isFixed":true,"items":[]},"page_name":"Game Page","ind":2},{"name":"New Game Page","url":{"urlparts":["New_Game Page"]},"access_level":"all","uielements":[{"layout":{"top":7,"left":3,"height":23,"width":5},"context":null,"isSingle":false,"container_info":{"entity":"Game","action":"create","uielements":[],"form":{"name":"","fields":[{"name":"Name","displayType":"single-line-text","type":"text","label":"Name","placeholder":"Name","options":[]},{"name":"Description","displayType":"single-line-text","type":"text","label":"Description","placeholder":"Description","options":[]},{"name":"Rating","displayType":"single-line-text","type":"number","label":"Rating","placeholder":"Rating","options":[]},{"name":"Picture","displayType":"image-uploader","type":"image","label":"Picture","placeholder":"Picture","options":[]},{"name":"Submit","type":"button","label":" ","displayType":"button","placeholder":"Submit","options":[]}],"action":"create","goto":"internal://Homepage/","belongsTo":null}},"content_attribs":{},"content":""},{"layout":{"top":0,"left":3,"height":7,"width":5},"context":null,"style":"font-size: 32px;\nfont-weight: bold;","isSingle":false,"content_attribs":{},"hoverStyle":"","class_name":"header-1","content":"Put your favorite game!","tagName":"h1","activeStyle":"","type":"headerTexts","container_info":null}],"navbar":{"brandName":null,"isHidden":false,"isFixed":true,"items":[]}},{"name":"Games Page","url":{"urlparts":["Games_Page"]},"access_level":"all","uielements":[{"layout":{"top":0,"left":2,"height":68,"width":8},"context":null,"isSingle":false,"container_info":{"entity":"Game","action":"show","uielements":[],"query":{"fieldsToDisplay":[],"belongsToUser":false,"sortAccordingTo":"Date","numberOfRows":-1},"row":{"isListOrGrid":"list","layout":{"height":16,"width":9,"top":0,"left":0},"uielements":[{"layout":{"top":2,"left":2,"height":4,"width":6},"context":null,"style":"","isSingle":false,"content_attribs":{},"hoverStyle":"","class_name":"txt","content":"{{loop.Game.Name}}","tagName":"span","activeStyle":"","container_info":null},{"layout":{"top":6,"left":2,"height":4,"width":6},"context":null,"style":"","isSingle":false,"content_attribs":{},"hoverStyle":"","class_name":"txt","content":"{{loop.Game.Description}}","tagName":"span","activeStyle":"","container_info":null},{"layout":{"top":1,"left":0,"height":11,"width":2,"r_padding":15,"l_padding":15},"context":null,"style":"border-radius: 6px;\nwidth: 180px;","isSingle":true,"content_attribs":{"src":"/static/img/placeholder.png"},"hoverStyle":"","class_name":"img-width-fixed","content":"{{loop.Game.Picture}}","tagName":"img","activeStyle":"","container_info":null},{"layout":{"top":10,"left":2,"height":2,"width":6},"context":null,"style":"","isSingle":false,"content_attribs":{"href":"internal://Games Page"},"hoverStyle":"","class_name":"link-1","content":"See details...","tagName":"a","activeStyle":"","type":"links","container_info":null},{"layout":{"top":12,"left":0,"height":3,"width":8},"context":null,"style":"border-color:#49afcd;","isSingle":true,"cons_attribs":{"class":"span12"},"hoverStyle":"","class_name":"line-1","content":"","tagName":"hr","activeStyle":"","type":"lines","container_info":null,"content_attribs":{}}],"goesTo":null}},"content_attribs":{},"content":""}],"navbar":{"brandName":null,"isHidden":false,"isFixed":true,"items":[{"name":"internal://New Game Page"}]}}],"emails":[{"content":"Dear {{User.First_Name}},\n\nThanks for signing up!\n\n- {{AppName}} Team","name":"Welcome Email","subject":"Thanks for Signing up!"}]}
"""

import simplejson
test_dict = simplejson.loads(test_json)

from app_builder.dsl.json_schema_v2 import App
a = App.create_from_dict(test_dict)
