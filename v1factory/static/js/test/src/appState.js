var appState = {
    "name": "EasyApp",
    "users": {
        "facebook": true,
        "linkedin": true,
        "twitter": false,
        "local": true,
        "fields": [
            {
                "name": "First Name",
                "required": true,
                "type": "text"
            },
            {
                "name": "Last Name",
                "required": true,
                "type": "text"
            },
            {
                "name": "Email",
                "required": true,
                "type": "text"
            },
            {
                "name": "School",
                "type": "text",
                "required": true
            }
        ],
        "name": "User"
    },
    "entities": [
        {
            "name": "Student",
            "fields": [
                {
                    "name": "Name",
                    "type": "text",
                    "required": true
                },
                {
                    "name": "Email",
                    "type": "text",
                    "required": true
                },
                {
                    "name": "Grade",
                    "type": "text",
                    "required": true
                }
            ]
        }
    ],
    "pages": [
        {
            "name": "Registration Page",
            "design_props": [
                {
                    "type": "background-image",
                    "value": "/static/img/sample_bg.png"
                },
                {
                    "type": "background-color",
                    "value": "#eee"
                },
                {
                    "type": "text-color",
                    "value": "#000"
                },
                {
                    "type": "text-size",
                    "value": "12px"
                },
                {
                    "type": "text-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                },
                {
                    "type": "header-color",
                    "value": "#666"
                },
                {
                    "type": "header-size",
                    "value": "16px"
                },
                {
                    "type": "header-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                }
            ],
            "uielements": [
                {
                    "type": "header-text",
                    "tagName": "h1",
                    "content": "Sign Up",
                    "container_info": null,
                    "layout": {
                        "width": 3,
                        "height": 1,
                        "top": 1,
                        "left": 4
                    },
                    "content_attribs": {}
                },
                {
                    "layout": {
                        "width": 1,
                        "height": 8,
                        "top": 0,
                        "left": 0
                    },
                    "container_info": {
                        "entity": "User",
                        "action": "signup",
                        "uielements": [
                            {
                                "tagName": "input",
                                "tagType": "text-input",
                                "cons_attribs": {
                                    "name": "username",
                                    "type": "text"
                                },
                                "content_attribs": {
                                    "placeholder": "Username"
                                },
                                "content": "",
                                "isSingle": true,
                                "layout": {
                                    "top": 0,
                                    "left": 0,
                                    "width": 4,
                                    "height": 1
                                },
                                "container_info": null
                            },
                            {
                                "type": "password",
                                "tagName": "input",
                                "tagType": "password",
                                "cons_attribs": {
                                    "name": "password1",
                                    "type": "password"
                                },
                                "content_attribs": {
                                    "placeholder": "Password"
                                },
                                "content": "",
                                "isSingle": true,
                                "layout": {
                                    "top": 1,
                                    "left": 0,
                                    "width": 4,
                                    "height": 1
                                },
                                "container_info": null
                            },
                            {
                                "type": "password",
                                "tagName": "input",
                                "tagType": "password",
                                "cons_attribs": {
                                    "name": "password2",
                                    "type": "password"
                                },
                                "content_attribs": {
                                    "placeholder": "Password"
                                },
                                "content": "",
                                "isSingle": true,
                                "layout": {
                                    "top": 2,
                                    "left": 0,
                                    "width": 4,
                                    "height": 1
                                },
                                "container_info": null,
                                "lib_id": 1
                            },
                            {
                                "type": "text-input",
                                "tagName": "input",
                                "tagType": "text",
                                "cons_attribs": {
                                    "name": "name",
                                    "type": "text"
                                },
                                "content_attribs": {
                                    "placeholder": "Display Name"
                                },
                                "content": "",
                                "isSingle": true,
                                "layout": {
                                    "top": 3,
                                    "left": 0,
                                    "width": 4,
                                    "height": 1
                                },
                                "container_info": null
                            },
                            {
                                "type": "text-input",
                                "tagName": "input",
                                "tagType": "text",
                                "cons_attribs": {
                                    "name": "email",
                                    "type": "text"
                                },
                                "content_attribs": {
                                    "placeholder": "Email address"
                                },
                                "content": "",
                                "isSingle": true,
                                "layout": {
                                    "top": 4,
                                    "left": 0,
                                    "width": 4,
                                    "height": 1
                                },
                                "container_info": null
                            },
                            {
                                "type": "button",
                                "tagName": "input",
                                "tagType": "submit",
                                "class_name": "btn",
                                "content_attribs": {
                                    "value": "Sign Up"
                                },
                                "cons_attribs": {
                                    "type": "submit"
                                },
                                "content": "",
                                "isSingle": true,
                                "layout": {
                                    "top": 5,
                                    "left": 0,
                                    "width": 4,
                                    "height": 1
                                },
                                "container_info": null
                            }
                        ]
                    },
                    "content_attribs": {},
                    "content": ""
                },
                {
                    "container_info": {
                        "entity": "Student",
                        "action": "table",
                        "uielements": [],
                        "query": {
                            "cid": "c73",
                            "attributes": {
                                "name": "Student",
                                "fields": [
                                    {
                                        "name": "Name",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "Email",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "Grade",
                                        "type": "text",
                                        "required": true
                                    }
                                ]
                            },
                            "collection": [
                                {
                                    "facebook": true,
                                    "linkedin": true,
                                    "twitter": false,
                                    "local": true,
                                    "fields": [
                                        {
                                            "name": "First Name",
                                            "required": true,
                                            "type": "text"
                                        },
                                        {
                                            "name": "Last Name",
                                            "required": true,
                                            "type": "text"
                                        },
                                        {
                                            "name": "Email",
                                            "required": true,
                                            "type": "text"
                                        },
                                        {
                                            "name": "School",
                                            "type": "text",
                                            "required": true
                                        }
                                    ],
                                    "name": "User"
                                },
                                {
                                    "name": "Student",
                                    "fields": [
                                        {
                                            "name": "Name",
                                            "type": "text",
                                            "required": true
                                        },
                                        {
                                            "name": "Email",
                                            "type": "text",
                                            "required": true
                                        },
                                        {
                                            "name": "Grade",
                                            "type": "text",
                                            "required": true
                                        }
                                    ]
                                }
                            ],
                            "_changing": false,
                            "_previousAttributes": {
                                "name": "Student",
                                "fields": [
                                    {
                                        "name": "Name",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "Email",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "Grade",
                                        "type": "text",
                                        "required": true
                                    }
                                ]
                            },
                            "changed": {
                                "fields": [
                                    {
                                        "name": "Name",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "Email",
                                        "type": "text",
                                        "required": true
                                    },
                                    {
                                        "name": "Grade",
                                        "type": "text",
                                        "required": true
                                    }
                                ]
                            },
                            "_pending": false,
                            "_events": {
                                "all": [
                                    {
                                        "context": [
                                            {
                                                "facebook": true,
                                                "linkedin": true,
                                                "twitter": false,
                                                "local": true,
                                                "fields": [
                                                    {
                                                        "name": "First Name",
                                                        "required": true,
                                                        "type": "text"
                                                    },
                                                    {
                                                        "name": "Last Name",
                                                        "required": true,
                                                        "type": "text"
                                                    },
                                                    {
                                                        "name": "Email",
                                                        "required": true,
                                                        "type": "text"
                                                    },
                                                    {
                                                        "name": "School",
                                                        "type": "text",
                                                        "required": true
                                                    }
                                                ],
                                                "name": "User"
                                            },
                                            {
                                                "name": "Student",
                                                "fields": [
                                                    {
                                                        "name": "Name",
                                                        "type": "text",
                                                        "required": true
                                                    },
                                                    {
                                                        "name": "Email",
                                                        "type": "text",
                                                        "required": true
                                                    },
                                                    {
                                                        "name": "Grade",
                                                        "type": "text",
                                                        "required": true
                                                    }
                                                ]
                                            }
                                        ],
                                        "ctx": [
                                            {
                                                "facebook": true,
                                                "linkedin": true,
                                                "twitter": false,
                                                "local": true,
                                                "fields": [
                                                    {
                                                        "name": "First Name",
                                                        "required": true,
                                                        "type": "text"
                                                    },
                                                    {
                                                        "name": "Last Name",
                                                        "required": true,
                                                        "type": "text"
                                                    },
                                                    {
                                                        "name": "Email",
                                                        "required": true,
                                                        "type": "text"
                                                    },
                                                    {
                                                        "name": "School",
                                                        "type": "text",
                                                        "required": true
                                                    }
                                                ],
                                                "name": "User"
                                            },
                                            {
                                                "name": "Student",
                                                "fields": [
                                                    {
                                                        "name": "Name",
                                                        "type": "text",
                                                        "required": true
                                                    },
                                                    {
                                                        "name": "Email",
                                                        "type": "text",
                                                        "required": true
                                                    },
                                                    {
                                                        "name": "Grade",
                                                        "type": "text",
                                                        "required": true
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            },
                            "defaults": {
                                "name": "default name"
                            },
                            "idAttribute": "id",
                            "fieldsToDisplay": [
                                "Name",
                                "Email",
                                "Grade"
                            ],
                            "belongsToUser": false,
                            "sortAccordingTo": "Date",
                            "numberOfRows": "All"
                        }
                    },
                    "layout": {
                        "top": 7,
                        "left": 4,
                        "width": 4,
                        "height": 8
                    },
                    "content_attribs": {},
                    "content": ""
                }
            ],
            "access_level": "all",
            "page_name": "Registration Page",
            "ind": 0
        },
        {
            "name": "Homepage",
            "design_props": [
                {
                    "type": "background-image",
                    "value": "/static/img/sample_bg.png"
                },
                {
                    "type": "background-color",
                    "value": "#eee"
                },
                {
                    "type": "text-color",
                    "value": "#000"
                },
                {
                    "type": "text-size",
                    "value": "12px"
                },
                {
                    "type": "text-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                },
                {
                    "type": "header-color",
                    "value": "#666"
                },
                {
                    "type": "header-size",
                    "value": "16px"
                },
                {
                    "type": "header-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                }
            ],
            "uielements": [
                {
                    "container_info": null,
                    "content_attribs": {},
                    "tagName": "h1",
                    "content": "Homepage",
                    "layout": {
                        "width": 4,
                        "height": 1,
                        "top": 1,
                        "left": 5
                    }
                },
                {
                    "type": "link",
                    "tagName": "a",
                    "content_attribs": {
                        "href": "{{Registration Page}}"
                    },
                    "content": "Registration",
                    "isSingle": false,
                    "layout": {
                        "top": 2,
                        "left": 5,
                        "width": 4,
                        "height": 1
                    },
                    "container_info": null
                },
                {
                    "container_info": {
                        "entity": "Student",
                        "action": "table",
                        "uielements": [],
                        "query": {
                            "name": "Student",
                            "fields": [
                                {
                                    "name": "Name",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "Email",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "Grade",
                                    "type": "text",
                                    "required": true
                                }
                            ]
                        }
                    },
                    "layout": {
                        "top": 26,
                        "left": 6,
                        "width": 4,
                        "height": 8
                    },
                    "content_attribs": {},
                    "content": ""
                }
            ],
            "access_level": "all",
            "page_name": "Homepage",
            "ind": 1
        },
        {
            "name": "yolo",
            "design_props": [
                {
                    "type": "background-image",
                    "value": "/static/img/sample_bg.png"
                },
                {
                    "type": "background-color",
                    "value": "#eee"
                },
                {
                    "type": "text-color",
                    "value": "#000"
                },
                {
                    "type": "text-size",
                    "value": "12px"
                },
                {
                    "type": "text-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                },
                {
                    "type": "header-color",
                    "value": "#666"
                },
                {
                    "type": "header-size",
                    "value": "16px"
                },
                {
                    "type": "header-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                }
            ],
            "access_level": "all",
            "uielements": [
                {
                    "container_info": {
                        "entity": "Student",
                        "action": "table",
                        "uielements": [],
                        "query": {
                            "name": "Student",
                            "fields": [
                                {
                                    "name": "Name",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "Email",
                                    "type": "text",
                                    "required": true
                                },
                                {
                                    "name": "Grade",
                                    "type": "text",
                                    "required": true
                                }
                            ]
                        }
                    },
                    "layout": {
                        "top": 7,
                        "left": 6,
                        "width": 4,
                        "height": 8
                    },
                    "content_attribs": {},
                    "content": ""
                }
            ],
            "page_name": "yolo",
            "ind": 2
        },
        {
            "name": "safd",
            "design_props": [
                {
                    "type": "background-image",
                    "value": "/static/img/sample_bg.png"
                },
                {
                    "type": "background-color",
                    "value": "#eee"
                },
                {
                    "type": "text-color",
                    "value": "#000"
                },
                {
                    "type": "text-size",
                    "value": "12px"
                },
                {
                    "type": "text-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                },
                {
                    "type": "header-color",
                    "value": "#666"
                },
                {
                    "type": "header-size",
                    "value": "16px"
                },
                {
                    "type": "header-family",
                    "value": "\"Helvetica Neue\", Helvetica, \"Lucida Grande\""
                }
            ],
            "access_level": "all",
            "uielements": [
                {
                    "layout": {
                        "top": 15,
                        "left": 9,
                        "width": 4,
                        "height": 8
                    },
                    "tagName": "span",
                    "content_attribs": {},
                    "content": "{{User_First Name}}",
                    "isSingle": false,
                    "style": "",
                    "class_name": "txt",
                    "container_info": null
                },
                {
                    "layout": {
                        "top": 0,
                        "left": 0,
                        "width": 4,
                        "height": 8
                    },
                    "container_info": {
                        "entity": "Student",
                        "action": "table-gal",
                        "uielements": [],
                        "query": {
                            "fieldsToDisplay": [
                                "Name",
                                "Email",
                                "Grade"
                            ],
                            "belongsToUser": false,
                            "sortAccordingTo": "by-Name",
                            "numberOfRows": "First-10"
                        }
                    },
                    "content_attribs": {},
                    "content": ""
                },
                {
                    "layout": {
                        "top": 13,
                        "left": 4,
                        "width": 4,
                        "height": 8
                    },
                    "container_info": {
                        "entity": "Student",
                        "action": "addbutton",
                        "uielements": [
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "value": "Add Student"
                                },
                                "cons_attribs": {
                                    "type": "submit"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "  display: inline-block;\n  *display: inline;\n  padding: 4px 12px;\n  margin-bottom: 0;\n  *margin-left: .3em;\n  font-size: 14px;\n  line-height: 20px;\n  color: #333333;\n  text-align: center;\n  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);\n  vertical-align: middle;\n  cursor: pointer;\n  background-color: #f5f5f5;\n  *background-color: #e6e6e6;\n  background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#e6e6e6));\n  background-image: -webkit-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);\n  background-repeat: repeat-x;\n  border: 1px solid #cccccc;\n  *border: 0;\n  border-color: #e6e6e6 #e6e6e6 #bfbfbf;\n  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);\n  border-bottom-color: #b3b3b3;\n  -webkit-border-radius: 4px;\n     -moz-border-radius: 4px;\n          border-radius: 4px;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff', endColorstr='#ffe6e6e6', GradientType=0);\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);\n  *zoom: 1;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n     -moz-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n",
                                "class_name": "btn-1",
                                "type": "button",
                                "layout": {
                                    "top": 0,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            }
                        ]
                    },
                    "content_attribs": {},
                    "content": ""
                },
                {
                    "layout": {
                        "top": 31,
                        "left": 9,
                        "width": 4,
                        "height": 8
                    },
                    "container_info": {
                        "entity": "Student",
                        "action": "create",
                        "uielements": [
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "placeholder": "Student Name",
                                    "name": "Name"
                                },
                                "cons_attribs": {
                                    "tagType": "text"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "min-height:32px;\nbackground-color: #ffffff;\nborder: 1px solid #cccccc;\n-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n-moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\nbox-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n-webkit-transition: border linear 0.2s, box-shadow linear 0.2s;\n-moz-transition: border linear 0.2s, box-shadow linear 0.2s;\n-o-transition: border linear 0.2s, box-shadow linear 0.2s;\ntransition: border linear 0.2s, box-shadow linear 0.2s;\ndisplay: inline-block;\nheight: 20px;\npadding: 4px 6px;\nmargin-bottom: 10px;\nfont-size: 14px;\nline-height: 20px;\ncolor: #555555;\nvertical-align: middle;\n-webkit-border-radius: 4px;\n-moz-border-radius: 4px;\nborder-radius: 4px;",
                                "class_name": "inpt-1",
                                "type": "text-input",
                                "layout": {
                                    "top": 0,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "placeholder": "Student Email",
                                    "name": "Email"
                                },
                                "cons_attribs": {
                                    "tagType": "text"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "min-height:32px;\nbackground-color: #ffffff;\nborder: 1px solid #cccccc;\n-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n-moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\nbox-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n-webkit-transition: border linear 0.2s, box-shadow linear 0.2s;\n-moz-transition: border linear 0.2s, box-shadow linear 0.2s;\n-o-transition: border linear 0.2s, box-shadow linear 0.2s;\ntransition: border linear 0.2s, box-shadow linear 0.2s;\ndisplay: inline-block;\nheight: 20px;\npadding: 4px 6px;\nmargin-bottom: 10px;\nfont-size: 14px;\nline-height: 20px;\ncolor: #555555;\nvertical-align: middle;\n-webkit-border-radius: 4px;\n-moz-border-radius: 4px;\nborder-radius: 4px;",
                                "class_name": "inpt-1",
                                "type": "text-input",
                                "layout": {
                                    "top": 2,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "placeholder": "Student Grade",
                                    "name": "Grade"
                                },
                                "cons_attribs": {
                                    "tagType": "text"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "min-height:32px;\nbackground-color: #ffffff;\nborder: 1px solid #cccccc;\n-webkit-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n-moz-box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\nbox-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);\n-webkit-transition: border linear 0.2s, box-shadow linear 0.2s;\n-moz-transition: border linear 0.2s, box-shadow linear 0.2s;\n-o-transition: border linear 0.2s, box-shadow linear 0.2s;\ntransition: border linear 0.2s, box-shadow linear 0.2s;\ndisplay: inline-block;\nheight: 20px;\npadding: 4px 6px;\nmargin-bottom: 10px;\nfont-size: 14px;\nline-height: 20px;\ncolor: #555555;\nvertical-align: middle;\n-webkit-border-radius: 4px;\n-moz-border-radius: 4px;\nborder-radius: 4px;",
                                "class_name": "inpt-1",
                                "type": "text-input",
                                "layout": {
                                    "top": 4,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "value": "Create"
                                },
                                "cons_attribs": {
                                    "type": "submit"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "  display: inline-block;\n  *display: inline;\n  padding: 4px 12px;\n  margin-bottom: 0;\n  *margin-left: .3em;\n  font-size: 14px;\n  line-height: 20px;\n  color: #333333;\n  text-align: center;\n  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);\n  vertical-align: middle;\n  cursor: pointer;\n  background-color: #f5f5f5;\n  *background-color: #e6e6e6;\n  background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#e6e6e6));\n  background-image: -webkit-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);\n  background-repeat: repeat-x;\n  border: 1px solid #cccccc;\n  *border: 0;\n  border-color: #e6e6e6 #e6e6e6 #bfbfbf;\n  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);\n  border-bottom-color: #b3b3b3;\n  -webkit-border-radius: 4px;\n     -moz-border-radius: 4px;\n          border-radius: 4px;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff', endColorstr='#ffe6e6e6', GradientType=0);\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);\n  *zoom: 1;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n     -moz-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n",
                                "class_name": "btn-1",
                                "type": "button",
                                "layout": {
                                    "top": 6,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            }
                        ]
                    },
                    "content_attribs": {},
                    "content": ""
                },
                {
                    "layout": {
                        "top": 36,
                        "left": 10,
                        "width": 4,
                        "height": 8
                    },
                    "container_info": {
                        "entity": "Student",
                        "action": "show",
                        "uielements": [
                            {
                                "tagName": "span",
                                "content_attribs": {},
                                "content": "{{Student_Name}}",
                                "isSingle": false,
                                "style": "",
                                "class_name": "txt",
                                "type": "text",
                                "layout": {
                                    "top": 0,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "span",
                                "content_attribs": {},
                                "content": "{{Student_Email}}",
                                "isSingle": false,
                                "style": "",
                                "class_name": "txt",
                                "type": "text",
                                "layout": {
                                    "top": 4,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "span",
                                "content_attribs": {},
                                "content": "{{Student_Grade}}",
                                "isSingle": false,
                                "style": "",
                                "class_name": "txt",
                                "type": "text",
                                "layout": {
                                    "top": 8,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            }
                        ]
                    },
                    "content_attribs": {},
                    "content": ""
                },
                {
                    "container_info": {
                        "entity": "Student",
                        "action": "create",
                        "uielements": [
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "placeholder": "Student Name",
                                    "name": "Name"
                                },
                                "cons_attribs": {
                                    "tagType": "text"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "",
                                "class_name": "inpt-1",
                                "type": "text-input",
                                "layout": {
                                    "top": 0,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "placeholder": "Student Email",
                                    "name": "Email"
                                },
                                "cons_attribs": {
                                    "tagType": "text"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "",
                                "class_name": "inpt-1",
                                "type": "text-input",
                                "layout": {
                                    "top": 2,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "placeholder": "Student Grade",
                                    "name": "Grade"
                                },
                                "cons_attribs": {
                                    "tagType": "text"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "",
                                "class_name": "inpt-1",
                                "type": "text-input",
                                "layout": {
                                    "top": 4,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            },
                            {
                                "tagName": "input",
                                "content_attribs": {
                                    "value": "Create"
                                },
                                "cons_attribs": {
                                    "type": "submit"
                                },
                                "content": "",
                                "isSingle": true,
                                "style": "  display: inline-block;\n  *display: inline;\n  padding: 4px 12px;\n  margin-bottom: 0;\n  *margin-left: .3em;\n  font-size: 14px;\n  line-height: 20px;\n  color: #333333;\n  text-align: center;\n  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.75);\n  vertical-align: middle;\n  cursor: pointer;\n  background-color: #f5f5f5;\n  *background-color: #e6e6e6;\n  background-image: -moz-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#ffffff), to(#e6e6e6));\n  background-image: -webkit-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: -o-linear-gradient(top, #ffffff, #e6e6e6);\n  background-image: linear-gradient(to bottom, #ffffff, #e6e6e6);\n  background-repeat: repeat-x;\n  border: 1px solid #cccccc;\n  *border: 0;\n  border-color: #e6e6e6 #e6e6e6 #bfbfbf;\n  border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);\n  border-bottom-color: #b3b3b3;\n  -webkit-border-radius: 4px;\n     -moz-border-radius: 4px;\n          border-radius: 4px;\n  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffffff', endColorstr='#ffe6e6e6', GradientType=0);\n  filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);\n  *zoom: 1;\n  -webkit-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n     -moz-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 1px 2px rgba(0, 0, 0, 0.05);\n",
                                "class_name": "btn-1",
                                "type": "button",
                                "layout": {
                                    "top": 6,
                                    "left": 0,
                                    "width": 4,
                                    "height": 4
                                },
                                "container_info": null
                            }
                        ]
                    },
                    "layout": {
                        "top": 18,
                        "left": 3,
                        "width": 4,
                        "height": 8
                    },
                    "content_attribs": {},
                    "content": ""
                }
            ],
            "page_name": "safd",
            "ind": 3
        }
    ],
    "urls": [
        {
            "page_name": "Homepage",
            "urlparts": []
        },
        {
            "page_name": "Registration Page",
            "urlparts": [
                "register"
            ]
        },
        {
            "urlparts": [],
            "page_name": "yolo"
        },
        {
            "urlparts": [],
            "page_name": "safd"
        }
    ]
}