# -*- coding: utf-8 -*-

from validator_v2 import DictInited

# Users

class EntityField(DictInited):
    _schema = {
        "name": { "_type" : "" },
        "required": { "_type": False },
        "type": { "_type" : "" }
    }

class UserConfig(DictInited):
    _schema = {
        "facebook": { "_type": True },
        "linkedin": { "_type": True },
        "twitter": { "_type": True },
        "local": { "_type": True },
        "fields": {
            "_type": [],
            "_each": { "_type": EntityField }
        }
    }


# Entities
class Entity(DictInited):
    _schema = {
        "name": { "_type" : "" },
        "fields": { "_type": [], "_each": { "_type": EntityField }},
    }


# Pages
class Layout(DictInited):
    _schema = {
        "width": { "_type": 0, "_min": 1, "_max": 64 },
        "height": { "_type": 0, "_min": 1 },
        "top": { "_type": 0, "_min": 0 },
        "left": { "_type": 0, "_min": 0, "_max": 64 }
    }


class UIElement(DictInited):
    _schema = {
        "layout": { "_type": Layout },
        "content": { "_type": "" },
    }
    # this is going to get a container_info key later on


class Node(DictInited):
    _schema = {
        "layout": { "_type": Layout },
        "content": { "_type": "" },
    }


class Form(DictInited):
    _schema = {
        "name": { "_type" : "" },
        "action": { "_type":"" },
        "fields": { "_type" : [], "_each": { "_type" : {}, "_mapping": {
            "name": { "_type" : "" },
            "placeholder": { "_type" : "" },
            "label": { "_type" : "" },
            "displayType": { "_type" : "" },
            "type": { "_type" : "" },
            "options": { "_type" : [], "_each": { "_type" : "" }}
        }}},
    }


class FormContainer(DictInited):
    _schema = {
        "entity": { "_type": "" },
        "action": { "_type": "" },
        "form": { "_type" : Form }
    }


class Iterator(DictInited):
    _schema = {
        "entity": { "_type": "" },
        "action": { "_type": "" },
        "uielements": { "_type": [],"_each": { "_type": Node }}
    }


UIElement._schema['container_info'] = { "_one_of": [ {"_type": FormContainer},
                                                     {"_type": Iterator},
                                                     {"_type": None } ] }


class Page(DictInited):
    _schema = {
        "name": { "_type" : "" },
        "url": { "_type": {}, "_mapping": {
            "urlparts": { "_type": [],
                "_each": { "_type" : "" }
            }
        }},
        "uielements": { "_type": [], "_each": { "_type": UIElement }},
        "access_level": { "_type" : "" }
    }


# Put it all together, you get an App
class App(DictInited):
    _schema = {
        "name": { "_type" : "", "_minlength": 2, "_maxlength": 255 },
        "info": { "_type": {}, "_mapping":{
            "domain": { "_type":"" },
            "description": { "_type":"" },
            "keywords": { "_type":"" },
        }},
        "users": { "_type": UserConfig },
        "entities": { "_type": [], "_each": { "_type":Entity }},
        "pages": { "_type": [], "_each": {"_type":Page} }
    }
