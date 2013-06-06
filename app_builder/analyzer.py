# -*- coding: utf-8 -*-

from dict_inited import DictInited
import os
import os.path

from app_builder.analyzer_utils import encode_braces, decode_braces
from app_builder.resolving import Resolvable, LinkLang, EntityLang
from app_builder import naming
from jinja2 import Environment, PackageLoader

env = Environment(trim_blocks=True, lstrip_blocks=True, loader=PackageLoader(
    'app_builder.code_templates', 'htmlgen'))


# tables

class EntityField(DictInited):
    _schema = {
        "name": {"_type": ""},
        "required": {"_type": True},
        "type": {"_type": ""}
    }

    def is_relational(self): 
        return False


class EntityRelatedField(DictInited, Resolvable):
    _schema = { 
        "name": {"_type": ""},
        "required": {"_type": True},
        "type": {"_type":""}, # one to one, many to one, many to many
        "entity_name": {"_type" : ""},
        'related_name': {"_type": ""}
    }
    _resolve_attrs = (('entity_name', 'entity'),)

    def is_relational(self): 
        return True

    def __init__(self, *args, **kwargs):
        super(EntityRelatedField, self).__init__(*args, **kwargs)
        self.entity_name = encode_braces('tables/%s' % self.entity_name)


class Entity(DictInited):
    _schema = {
        "name": {"_type": ""},
        "fields": {"_type": [], "_each": {"_one_of":[{"_type": EntityRelatedField}, {"_type": EntityField}]}},
    }

    def __init__(self, *args, **kwargs):
        super(Entity, self).__init__(*args, **kwargs)
        self.is_user = False

    def relational_fields(self):
        return filter(lambda x: x.is_relational(), self.fields)


class UserRole(DictInited):
    _schema = {
        "name": {"_type":""},
        "fields": {
            "_type": [],
            "_each": {"_one_of":[{"_type": EntityField}, {"_type": EntityRelatedField}]}
        }
    }


# Pages

class Navbar(DictInited):

    class NavbarItem(DictInited):
        _schema = {
            "url": {"_type": ""},
            "title": { "_type": "" }
        }

    _schema = {
        "brandName": {"_one_of": [{"_type": ""}, {"_type": None}]},
        "isHidden": {"_type": True},
        "links": {"_type": [], "_each": {"_type": NavbarItem}}
    }

    def render(self):
        if self.brandName is None:
            self.brandName = self.app.name
        return env.get_template('navbar.html').render(navbar=self)

class Footer(DictInited):

    class FooterItem(DictInited):
        _schema = {
            "url": {"_type": ""},
            "title": { "_type": "" }
        }

    _schema = {
        "customText": {"_type": ""},
        "isHidden": {"_type": True},
        "links": {"_type": [], "_each": {"_type": FooterItem}}
    }

from app_builder.uielements import UIElement

class Page(DictInited):

    class URL(DictInited):

        _schema = {
            "urlparts": {"_type": [], "_each": {"_one_of": [{"_type": ""}, {"_type": EntityLang}]}}
        }

    _schema = {
        "name": {"_type": ""},
        "url": {"_type": URL},
        "navbar": {"_type": Navbar},
        "footer": {"_type": Footer},
        "uielements": {"_type": [], "_each": {"_type": UIElement}},
        "access_level": {"_type": ""}
    }

    @property
    def url_regex(page):
        url_regex = "r'^"
        for x in page.url.urlparts:
            if isinstance(x, basestring):
                url_regex += naming.make_safe(x) + '/'
            else:
                url_regex += r'(\d+)/'
        url_regex += "$'"
        return url_regex

    def is_static(self):
        # returns true iff there are no tables in the url parts
        return len(filter(lambda x: isinstance(x, EntityLang), self.url.urlparts)) == 0

    def get_tables_from_url(self):
        return [l.entity for l in filter(lambda x: isinstance(x, EntityLang), self.url.urlparts)]


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
            "description": {"_type": ""},
            "keywords": {"_type": ""},
        }},
        "users": {"_type": [], "_each": {"_type": UserRole}},
        "tables": {"_type": [], "_each": {"_type": Entity}},
        "pages": {"_type": [], "_each": {"_type": Page}},
        "emails": {"_type": [], "_each": {"_type": Email}},
    }

    @classmethod
    def create_from_dict(cls, data, *args, **kwargs):
        # preprocess data
        self = super(App, cls).create_from_dict(data, *args, **kwargs)

        # create the user entity based on userconfig
        userdict = {
            "name": "User",
            "fields": [
                {
                    "name": "username",
                    "type": "text",
                    "required": True
                },
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
        userentity.user_fields = [f for f in userentity.fields] # create a new list, bc the old one is mutated later
        userentity.user_profile_fields = [f for f in self.users[0].fields] # users[0] is the first user role. this is temp.
        userentity.fields.extend(self.users[0].fields)
        userentity.is_user = True
        self.tables.append(userentity)
        self.userentity = userentity # just a convenience for the posterity

        # HACK replace uielements with their subclass
        for p in self.pages:
            p.uielements = [u.subclass for u in p.uielements]

        # HACK give everything a reference to the app
        for path, obj in filter(lambda u: isinstance(u[1], DictInited), self.iternodes()):
            obj.app = self

        # Fix reflang namespaces
        for path, fii in filter(lambda n: isinstance(n[1], Form.FormInfo.FormInfoInfo), self.iternodes()):
            if fii.belongsTo is not None:
                fii.belongsTo = encode_braces('tables/%s' % fii.belongsTo)
            fii.entity = encode_braces('tables/%s' % fii.entity)

        for path, ll in filter(lambda n: isinstance(n[1], LinkLang), self.iternodes()):
            ll.page_name = encode_braces('pages/%s' % ll.page_name)

        for path, el in filter(lambda n: isinstance(n[1], EntityLang), self.iternodes()):
            el.entity_name = encode_braces('tables/%s' % el.entity_name)

        for path, ii in filter(lambda n: isinstance(n[1], Iterator.IteratorInfo), self.iternodes()):
            ii.entity = encode_braces(
                'tables/%s' % ii.entity)  # "Posts" => "tables/Posts"

        # Resolve reflangs
        for path, rl in filter(lambda n: isinstance(n[1], Resolvable), self.iternodes()):
            rl.resolve()


        return self
