test_json = r"""{
    "name": "NewestApp",
    "info": {
        "keywords": "",
        "domain": "v1factory.org",
        "description": "",
        "name": ""
    },
    "users": {
        "name": "User",
        "fields": [],
        "twitter": true,
        "linkedin": true,
        "facebook": true,
        "local": true
    },
    "entities": [
        {
            "name": "Game",
            "fields": [
                {
                    "name": "Name",
                    "type": "text",
                    "required": true
                },
                {
                    "name": "Description",
                    "type": "text",
                    "required": false
                },
                {
                    "name": "Rating",
                    "type": "number",
                    "required": false
                },
                {
                    "name": "Picture",
                    "type": "image",
                    "required": false
                },
                {
                    "name": "models",
                    "type": "image",
                    "required": false
                }
            ],
            "forms": []
        },{
                    "name":"Class",
                    "fields": [{
                            "name":"Name",
                            "required":true,
                            "type":"text"
                        },{
                            "name":"Description",
                            "required":true,
                            "type":"text"
                        },{
                            "name":"Professor",
                            "required":true,
                            "type": "fk",
                            "entity_name": "Teacher",
                            "related_name": "Classes"
                        }]
                },{
                    "name":"Teacher",
                    "fields": [{
                            "name":"Name",
                            "required":true,
                            "type":"text"
                        },{
                            "name":"Bio",
                            "required":true,
                            "type":"text"
                        },{
                            "name":"Favorite student",
                            "required":true,
                            "type":"o2o",
                            "entity_name": "Student",
                            "related_name": "teacher"
                        }]
                },{
                    "name":"Student",
                    "fields": [{
                            "name":"Name",
                            "required":true,
                            "type":"text"
                        },{
                            "name":"Bio",
                            "required":true,
                            "type":"text"
                        },{
                            "name": "Classes",
                            "required":true,
                            "entity_name":"Class",
                            "type": "m2m",
                            "related_name": "enrolled students"
                        }]
                }
    ],
    "pages": [
        {
            "url": {
                "urlparts": []
            },
            "navbar": {
                "isFixed": true,
                "brandName": "AlperGamez",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    }
                ]
            },
            "footer": {
                "isFixed": true,
                "customText": "",
                "brandName": "AlperGamez",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    }
                ]
            },
            "uielements": [
                {
                    "layout": {
                        "top": 0,
                        "height": 9,
                        "width": 12,
                        "alignment": "center",
                        "left": 0,
                        "t_padding": 15,
                        "b_padding": 15,
                        "l_padding": 0,
                        "r_padding": 0
                    },
                    "type":"node",
                    "data": {
                        "style": "font-size: 32px;\nfont-weight: bold;",
                        "isSingle": false,
                        "content_attribs": {},
                        "hoverStyle": "",
                        "class_name": "header-1",
                        "container_info": null,
                        "content": "Welcome to Alper Games<br>",
                        "tagName": "h1",
                        "type": "headerTexts",
                        "activeStyle": "",
                        "context": null
                    }
                },
                {
                    "layout": {
                        "width": 4,
                        "top": 12,
                        "height": 15,
                        "left": 7,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "type": "form",
                    "data": {
                        "content": "",
                        "container_info": {
                            "uielements": [],
                            "form": {
                                "fields": [
                                    {
                                        "field_name": "Name",
                                        "placeholder": "Name",
                                        "label": "Name",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "options": []
                                    },
                                    {
                                        "field_name": "Description",
                                        "placeholder": "Description",
                                        "label": "Desc",
                                        "displayType": "paragraph-text",
                                        "type": "password",
                                        "options": []
                                    },
                                    {
                                        "placeholder": "Submit"
                                    }
                                ],
                                "entity": "Game",
                                "action": "create",
                                "goto": { "page_name":"Homepage", "urldata":{} },
                                "belongsTo": null
                            }
                        },
                        "content_attribs": {},
                        "context": null
                    }
                },{
                    "layout": {
                        "width": 4,
                        "top": 12,
                        "height": 15,
                        "left": 7,
                        "t_padding": 0,
                        "b_padding": 0,
                        "l_padding": 0,
                        "r_padding": 0,
                        "alignment": "left"
                    },
                    "type": "form",
                    "data": {
                        "content": "",
                        "container_info": {
                            "uielements": [],
                            "form": {
                                "fields": [
                                    {
                                        "field_name": "username",
                                        "placeholder": "Username",
                                        "label": "Username",
                                        "displayType": "single-line-text",
                                        "type": "text",
                                        "options": []
                                    },
                                    {
                                        "name": "password",
                                        "placeholder": "Password",
                                        "label": "Password",
                                        "displayType": "password-text",
                                        "type": "password",
                                        "options": []
                                    },
                                    {
                                        "placeholder": "Login",
                                        "label": "Login",
                                        "displayType": "button",
                                        "type": "button",
                                        "options": []
                                    }
                                ],
                                "entity": "User",
                                "action": "login",
                                "goto": { "page_name":"Homepage", "urldata":{} },
                                "belongsTo": null
                            }
                        },
                        "content_attribs": {},
                        "context": null
                    }
                }],
            "name": "Homepage",
            "access_level": "all",
            "page_name": "Homepage",
            "ind": 0
        },
        {
            "url": {
                "urlparts": ["game", {"entity_name":"Game"}, {"entity_name":"Class"}]
            },
            "navbar": {
                "isFixed": true,
                "brandName": "AlperGamez",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    }
                ]
            },
            "footer": {
                "customText": "",
                "isFixed": true,
                "brandName": "AlperGamez",
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    }
                ]
            },
            "uielements": [
                {
                    "layout": {
                        "top": 0,
                        "height": 9,
                        "width": 12,
                        "alignment": "center",
                        "left": 0,
                        "t_padding": 15,
                        "b_padding": 15,
                        "l_padding": 0,
                        "r_padding": 0
                    },
                    "type":"node",
                    "data": {
                        "style": "font-size: 32px;\nfont-weight: bold;",
                        "isSingle": false,
                        "content_attribs": {},
                        "hoverStyle": "",
                        "class_name": "header-1",
                        "container_info": null,
                        "content": "GAMEPAGE<br> {{ CurrentUser.First Name }}{{ Page.Game.Description }}{{ Page.Class.Professor.Favorite student.teacher.Favorite student.Bio }},
                        "tagName": "h1",
                        "type": "headerTexts",
                        "activeStyle": "",
                        "context": null
                    }
                }],
            "name": "game page",
            "access_level": "all"
        }],
    "emails": [
        {
            "content": "Dear {{User.First_Name}},\n\nThanks for signing up!\n\n- {{AppName}} Team",
            "name": "Welcome Email",
            "subject": "Thanks for Signing up!"
        }
    ]
}"""

import simplejson
test_dict = simplejson.loads(test_json)

from app_builder.analyzer import App
app = App.create_from_dict(test_dict)

from app_builder.controller import main

def test():
    return main(app)

test()
