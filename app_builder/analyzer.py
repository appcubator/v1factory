# -*- coding: utf-8 -*-

from dict_inited import DictInited
import os
import os.path


def encode_braces(s):
    return '{{%s}}' % s.replace('{', '\{')


def decode_braces(s):
    assert s.startswith('{{') and s.endswith('}}'), "Not brace encoded"
    return s[2:-2].replace('\{', '{')

class Resolvable(object):

    """
    Mixin allowing you to specify attributes you want to resolve.
    See _resolve_attrs in LinkLang for example.
    """

    def resolve(self):
        assert hasattr(self, app), "You must have something at attribute \"app\""
        for src_attr, dest_attr in self.__class__._resolve_attrs:
            path_string = decode_braces(getattr(self, src_attr))
            setattr(self, dest_attr,  self.app.find(
                path_string, name_allowed=True))


# Entities


class EntityField(DictInited):
    _schema = {
        "name": {"_type": ""},
        "required": {"_type": True},
        "type": {"_type": ""}
    }


class Entity(DictInited):
    _schema = {
        "name": {"_type": ""},
        "fields": {"_type": [], "_each": {"_type": EntityField}},
    }

    def __init__(self, *args, **kwargs):
        super(Entity, self).__init__(*args, **kwargs)
        self.is_user = False


class UserConfig(DictInited):
    _schema = {
        "facebook": {"_type": True},
        "linkedin": {"_type": True},
        "twitter": {"_type": True},
        "local": {"_type": True},
        "fields": {
            "_type": [],
            "_each": {"_type": EntityField}
        }
    }


# Pages
class LinkLang(DictInited, Resolvable):
    _schema = {
        "page_name": {"_type": ""},
        "urldata": {"_type": {}},
        # "page": { "_type": Page"} # DO NOT UNCOMMENT. this gets added after resolve.
    }

    _resolve_attrs = (('page_name', 'page'),)


class Navbar(DictInited):

    class NavbarItem(DictInited):
        _schema = {
            "name": {"_type": ""},
            # "link": { "_type": "" } # TODO
        }

    _schema = {
        "brandName": {"_one_of": [{"_type": ""}, {"_type": None}]},
        "isHidden": {"_type": True},
        "items": {"_type": [], "_each": {"_type": NavbarItem}}
    }

from app_builder.uielements import UIElement

class Page(DictInited):

    class URL(DictInited):

        class EntityLang(DictInited, Resolvable):
            _schema = {"name": {"_type": ""}, "entity_name": {"_type": ""}}
            _resolve_attrs = (('entity_name', 'entity'),)

        _schema = {
            "urlparts": {"_type": [], "_each": {"_one_of": [{"_type": ""}, {"_type": EntityLang}]}}  # TODO might have a reference to an entity
        }

    _schema = {
        "name": {"_type": ""},
        "url": {"_type": URL},
        "navbar": {"_type": Navbar},
        "uielements": {"_type": [], "_each": {"_type": UIElement}},
        "access_level": {"_type": ""}
    }

    def get_page_context(self):
        return [(el.name, el.entity) for el in filter(lambda x: isinstance(x, Page.URL.EntityLang), self.url.urlparts)]


class Email(DictInited):
    _schema = {
        "name": {"_type": ""},
        "subject": {"_type": ""},
        "content": {"_type": ""},
    }

# Put it all together, you get an App

from app_builder.uielements import Form, Iterator

class App(DictInited):
    _schema = {
        "name": {"_type": "", "_minlength": 2, "_maxlength": 255},
        "info": {"_type": {}, "_mapping": {
            "domain": {"_type": ""},
            "description": {"_type": ""},
            "keywords": {"_type": ""},
        }},
        "users": {"_type": UserConfig},
        "entities": {"_type": [], "_each": {"_type": Entity}},
        "pages": {"_type": [], "_each": {"_type": Page}},
        "emails": {"_type": [], "_each": {"_type": Email}},
    }

    def render(self, coder):
        self.users.render(self, coder)  # pass the app and the coder
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
        userentity.facebook = self.users.facebook  # TODO finish this process
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
            fi.entity = encode_braces(
                'entities/%s' % fi.entity)  # "Posts" => "entities/Posts"

        for path, ii in filter(lambda n: isinstance(n[1], Iterator.IteratorInfo), self.iternodes()):
            ii.entity = encode_braces(
                'entities/%s' % ii.entity)  # "Posts" => "entities/Posts"

        # Resolve reflangs
        for path, rl in filter(lambda n: isinstance(n[1], Resolvable), self.iternodes()):
            rl.resolve()

        # TODO
#       inline references
#       relational fields (im especially dreading this)
#       code object stage

        return self
