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
                }
            ],
            "forms": []
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
                "items": [
                    {
                        "name": "internal://Homepage"
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
                            "action": "login",
                            "uielements": [],
                            "form": {
                                "name": "Local Login",
                                "fields": [
                                    {
                                        "name": "username",
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
                                        "name": "Submit",
                                        "placeholder": "Login",
                                        "label": "Login",
                                        "displayType": "button",
                                        "type": "button",
                                        "options": []
                                    }
                                ],
                                "action": "login",
                                "goto": { "page_name":"Homepage", "urldata":{} },
                                "belongsTo": null
                            },
                            "entity": "User"
                        },
                        "content_attribs": {},
                        "context": null
                    }
                }],
            "name": "Homepage",
            "access_level": "all",
            "page_name": "Homepage",
            "ind": 0
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

