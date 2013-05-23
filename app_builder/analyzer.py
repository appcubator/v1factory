# -*- coding: utf-8 -*-

from dict_inited import DictInited
import os, os.path

def encode_braces(s):
    return '{{%s}}' % s.replace('{', '\{')

def decode_braces(s):
    assert s.startswith('{{') and s.endswith('}}'), "Not brace encoded"
    return s[2:-2].replace('\{', '{')

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


class Resolvable(object):
    """
    Mixin allowing you to specify attributes you want to resolve.
    See _resolve_attrs in LinkLang for example.
    """

    def resolve(self):
        for src_attr, dest_attr in self.__class__._resolve_attrs:
            path_string = decode_braces(getattr(self, src_attr))
            setattr(self, dest_attr,  self.app.find(path_string, name_allowed=True))

class LinkLang(DictInited, Resolvable):
    _schema = {
        "page_name": { "_type": "" },
        "urldata": { "_type": {} },
        # "page": { "_type": Page"} # DO NOT UNCOMMENT. this gets added after resolve.
    }

    _resolve_attrs = (('page_name', 'page'),)


class UIElement(object):

    def is_form(self):
        return self.__class__.__name__ == 'Form'

    def is_list(self):
        return self.__class__.__name__ == 'Iterator'

    def is_node(self):
        return self.__class__.__name__ == 'Node'

class Form(DictInited, UIElement):

    class FormInfo(DictInited, Resolvable):

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
                "goto": { "_type": LinkLang },
                "belongsTo": { "_one_of": [{ "_type": "" }, { "_type": None }] } # TODO may have reference
            }

        _schema = {
            "entity": { "_type": "" },
            "action": { "_type": "" },
            "form": { "_type" : FormInfoInfo }
        }

        _resolve_attrs = (('entity', 'entity_resolved'),)

    _schema = {
        "layout": { "_type": Layout },
        "content": { "_type": "" }, # TODO may have reference
        "container_info": { "_type": FormInfo }
    }


class Node(DictInited, UIElement): # a uielement with no container_info
    _schema = {
        "layout": { "_type": Layout },
        "content": { "_type": "" }, # TODO may have reference
        # "isSingle": { "_type" : True }, # don't need this because it's implied from tagname
        "content_attribs": { "_type" : {} }, # TODO may have reference
        "class_name": { "_type" : "" },
        "tagName": { "_type" : "" },
    }

class Iterator(DictInited, UIElement):

    class IteratorInfo(DictInited, Resolvable):

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

        _resolve_attrs = (("entity", "entity_resolved"),)

    _schema = {
        "layout": { "_type": Layout },
        "container_info": { "_type": IteratorInfo },
    }


class Navbar(DictInited):

    class NavbarItem(DictInited):
        _schema = {
            "name": { "_type": "" },
            #"link": { "_type": "" } # TODO
        }

    _schema = {
        "brandName": { "_one_of" : [{ "_type": "" }, {"_type" :None}] },
        "isHidden": { "_type": True },
        "items": { "_type": [], "_each": { "_type": NavbarItem }}
    }

class Page(DictInited):

    class URL(DictInited):
        _schema = {
            "urlparts": { "_type": [], "_each": { "_type" : "" }} # TODO might have a reference to an entity
        }

    _schema = {
        "name": { "_type" : "" },
        "url": { "_type": URL },
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
        userdict = {
            "name": "User",
            "fields": [
                {
                    "name": "First Name",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "Last Name",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "Email",
                    "type": "text",
                    "required": True
                },
            ]
        }
        userentity = Entity.create_from_dict(userdict)
        userentity.fields.extend(self.users.fields)
        userentity.is_user = True
        userentity.facebook = self.users.facebook # TODO finish this process
        self.entities.append(userentity)

        # HACK give everything a reference to the app
        for path, obj in filter(lambda u: isinstance(u[1], DictInited), self.iternodes()):
            obj.app = self

        # Fix reflang namespaces
        for path, fii in filter(lambda n: isinstance(n[1], Form.FormInfo.FormInfoInfo), self.iternodes()):
            if fii.belongsTo is not None:
                fii.belongsTo = encode_braces('entities/%s' % fii.belongsTo)
        for path, ll in filter(lambda n: isinstance(n[1], LinkLang), self.iternodes()):
            ll.page_name = encode_braces('pages/%s' % ll.page_name)

        for path, fi in filter(lambda n: isinstance(n[1], Form.FormInfo), self.iternodes()):
            fi.entity = encode_braces('entities/%s' % fi.entity) # "Posts" => "entities/Posts"

        for path, ii in filter(lambda n: isinstance(n[1], Iterator.IteratorInfo), self.iternodes()):
            ii.entity = encode_braces('entities/%s' % ii.entity) # "Posts" => "entities/Posts"


        # Resolve reflangs
        for path, rl in filter(lambda n: isinstance(n[1], Resolvable), self.iternodes()):
            rl.resolve()

        # TODO
#       inline references
#       relational fields (im especially dreading this)
#       code object stage

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
