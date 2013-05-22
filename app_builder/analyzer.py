# -*- coding: utf-8 -*-

from dict_inited import DictInited
import os, os.path

# Entities
class EntityField(DictInited):
    _schema = {
        "name": { "_type" : "" },
        "required": { "_type": True },
        "type": { "_type" : "" }
    }


class Entity(DictInited):
    _schema = {
        "name": { "_type" : "" },
        "fields": { "_type": [], "_each": { "_type": EntityField }},
    }

    def __init__(self, *args, **kwargs):
        super(Entity, self).__init__(*args, **kwargs)
        self.is_user = False


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


# Pages
class Layout(DictInited):
    _schema = {
        "width": { "_type": 0, "_min": 1, "_max": 64 },
        "height": { "_type": 0, "_min": 1 },
        "top": { "_type": 0, "_min": 0 },
        "left": { "_type": 0, "_min": 0, "_max": 64 },
        "t_padding": { "_type": "", "_default": ""},
        "b_padding": { "_type": "", "_default": ""},
        "l_padding": { "_type": "", "_default": ""},
        "r_padding": { "_type": "", "_default": ""},
        "alignment": { "_type": "", "_default": "left" },
        "font-size": { "_type": "", "_default": "" },
    }


class Form(DictInited):

    class FormInfo(DictInited):

        class FormInfoInfo(DictInited):

            class FormField(DictInited):
                _schema = {
                    "name": { "_type" : "" },
                    "placeholder": { "_type" : "" },
                    "label": { "_type" : "" },
                    "displayType": { "_type" : "" },
                    "type": { "_type" : "" }, #FIXME what is the diff btwn this and the above
                    "options": { "_type" : [], "_each": { "_type" : "" }} # XXX what is this?
                }

            _schema = {
                "name": { "_type" : "" },
                "action": { "_type":"" },
                "fields": { "_type" : [], "_each": { "_type": FormField }},
                "goto": { "_type": "" }, # TODO may have reference
                "belongsTo": { "_one_of": [{ "_type": "" }, { "_type": None }] } # TODO may have reference
            }

        _schema = {
            "entity": { "_type": "" },
            "action": { "_type": "" },
            "form": { "_type" : FormInfoInfo }
        }

    _schema = {
        "layout": { "_type": Layout },
        "content": { "_type": "" }, # TODO may have reference
        "container_info": { "_type": FormInfo }
    }


class Node(DictInited): # a uielement with no container_info
    _schema = {
        "layout": { "_type": Layout },
        "content": { "_type": "" }, # TODO may have reference
        # "isSingle": { "_type" : True }, # don't need this because it's implied from tagname
        "content_attribs": { "_type" : {} }, # TODO may have reference
        "class_name": { "_type" : "" },
        "tagName": { "_type" : "" },
    }

class Iterator(DictInited):

    class IteratorInfo(DictInited):

        class Query(DictInited):
            _schema = {
                "belongsToUser": { "_type": True },
                "sortAccordingTo": { "_type": ""},
                "numberOfRows": { "_type": 0 }
            }

        class Row(DictInited):
            _schema = {
                "isListOrGrid": { "_type": ""},
                "layout": { "_type": Layout },
                "uielements": { "_type": [],"_each": { "_type": Node }},
            }

        _schema = {
            "entity": { "_type": "" }, # TODO may have reference
            "action": { "_type": "" },
            "uielements": { "_type": [],"_each": { "_type": Node }},
            "query": { "_type": Query},
            "row": { "_type": Row}
        }

    _schema = {
        "layout": { "_type": Layout },
        "container_info": { "_type": IteratorInfo },
    }


class Navbar(DictInited):

    class NavbarItem(DictInited):
        _schema = {
            "name": { "_type": "" }, # TODO may have reference
            #"link": { "_type": "" }
        }

    _schema = {
        "brandName": { "_one_of" : [{ "_type": "" }, {"_type" :None}] },
        "isHidden": { "_type": True },
        "items": { "_type": [], "_each": { "_type": NavbarItem }}
    }

class Page(DictInited):
    _schema = {
        "name": { "_type" : "" },
        "url": { "_type": {}, "_mapping": {
            "urlparts": { "_type": [], "_each": { "_type" : "" }} # TODO might have a reference to an entity
        }},
        "navbar": { "_type": Navbar },
        "uielements": { "_type": [], "_each": { "_one_of": [{"_type": Iterator}, {"_type": Form}, {"_type": Node}]}},
        "access_level": { "_type" : "" }
    }

class Email(DictInited):
    _schema = {
        "name": { "_type": "" },
        "subject": { "_type": "" },
        "content": { "_type": "" },
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
        "pages": { "_type": [], "_each": { "_type":Page }},
        "emails": { "_type": [], "_each": { "_type":Email }},
    }

    def render(self, coder):
        self.users.render(self, coder) # pass the app and the coder
        self.entities.render(self, coder)

    @classmethod
    def create_from_dict(cls, data, *args, **kwargs):
        # preprocess data
        self = super(App, cls).create_from_dict(data, *args, **kwargs)

        # create the user entity based on userconfig
        """
        userdict = { "name": "User" } # TODO Fill in with default values
        userentity = Entity.create_from_dict(userdict)
        userentity.is_user = True
        userentity.facebook = self.users.facebook # TODO finish this process
        self.entities.append(userentity)
        """

        # changing string refs to proper ref lang (in form: goto, belongsTo, entity)
        for path, fii in filter(lambda n: isinstance(n[1], Form.FormInfo.FormInfoInfo), self.iternodes()):
            if fii.belongsTo is not None:
                fii.belongsTo = 'entities/' + fii.belongsTo

            fii.goto = 'pages/' + fii.goto # This is wrong. it's a link lang, bro.

        for path, fi in filter(lambda n: isinstance(n[1], Form.FormInfo), self.iternodes()):
            fi.entity = 'entities/' + fi.entity # "Posts" => "entities/Posts"

        """
        for ni in filter(lambda n: isinstance(n, NavbarItem), self.iternodes()):
            ni.link = 'pages/' + ni.link # FIXME this is actually wrong, it should be a link lang
        """

        """
        self.resolve_refs()
        self.resolve_context_lang()
        self.resolve_links()""" # NYI
        return self


class Coder(object):

    def __init__(self, app_dir):
        self.app_dir = app_dir
        self._codes = {}

    def write_to_file(self, relative_path_to_file, content):

        self._codes[relative_path_to_file] += content

    def code(self):
        for relative_path, code in self._codes.iteritems():
            target_file_path = os.path.join(self.app_dir, relative_path)
            os.makedirs(target_file_path)
            f = open(target_file_path, "w")
            f.write(code)
            f.close()
            self._codes[relative_path] = ""
