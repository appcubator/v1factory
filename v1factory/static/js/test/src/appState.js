var appState = {
    "info": {
        "keywords": "",
        "description": ""
    },
    "users": [
        {
            "fields": [],
            "twitter": false,
            "linkedin": false,
            "facebook": false,
            "role": "Admin",
            "local": true
        },
        {
            "fields": [],
            "twitter": false,
            "linkedin": false,
            "facebook": false,
            "role": "Editor",
            "local": true
        },
        {
            "fields": [],
            "twitter": false,
            "linkedin": false,
            "facebook": false,
            "role": "Member",
            "local": true
        }
    ],
    "mobilePages": [],
    "emails": [
        {
            "content": "Dear {{User.First_Name}},\n\nThanks for signing up!\n\n- {{AppName}} Team",
            "name": "Welcome Email",
            "subject": "Thanks for Signing up!"
        }
    ],
    "entities": [
        {
            "name": "Class",
            "fields": [
                {
                    "name": "Name",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Description",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Professor",
                    "required": true,
                    "type": "fk",
                    "entity_name": "Teacher",
                    "related_name": "Classes"
                }
            ]
        },
        {
            "name": "Teacher",
            "fields": [
                {
                    "name": "Name",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Bio",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Favorite student",
                    "required": true,
                    "type": "o2o",
                    "entity_name": "Student",
                    "related_name": "teacher"
                }
            ]
        },
        {
            "name": "Student",
            "fields": [
                {
                    "name": "Name",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Bio",
                    "required": true,
                    "type": "text"
                },
                {
                    "name": "Classes",
                    "required": true,
                    "entity_name": "Class",
                    "type": "m2m",
                    "related_name": "enrolled students"
                }
            ]
        }
    ],
    "pages": [
        {
            "name": "Homepage",
            "access_level": "all",
            "url": {
                "urlparts": []
            },
            "footer": {
                "isFixed": true,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ],
                "customText": "Add custom footer text here"
            },
            "navbar": {
                "isFixed": true,
                "brandName": null,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ]
            },
            "uielements": []
        },
        {
            "name": "Registration Page",
            "access_level": "all",
            "navbar": {
                "isFixed": true,
                "brandName": null,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ]
            },
            "footer": {
                "isFixed": true,
                "isHidden": false,
                "links": [
                    {
                        "url": "internal://Homepage",
                        "title": "Homepage"
                    },
                    {
                        "url": "internal://Registration Page",
                        "title": "Registration Page"
                    }
                ],
                "customText": "Add custom footer text here"
            },
            "url": {
                "urlparts": [
                    "registration"
                ]
            },
            "uielements": []
        }
    ],
    "name": "AllNigherz"
}