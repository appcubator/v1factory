from app_builder.coder import Coder
from app_builder import naming

from jinja2 import Environment, PackageLoader

import objgraph
import re

env = Environment(trim_blocks = True, loader=PackageLoader('app_builder', 'code_templates'))


# Code classes

class DjangoModel(object):

    _type_map = {'text' : 'TextField',
                'number' : 'FloatField',
                'date' : 'DateTimeField',
                '_CREATED' : 'DateTimeField',
                '_MODIFIED' : 'DateTimeField',
                'email' : 'EmailField',
                'fk' : 'ForeignKey',
                'm2m' : 'ManyToManyField',
                'image' : 'TextField',
                'onetoone': 'OneToOneField',
    }

    field_namer = naming.FieldNamer()

    def __init__(self, name, el):
        self.name = name
        self.el = el
        self.code_path = "webapp/models.py"

    @classmethod
    def create_for_entity(cls, entity):
        self = cls("model", entity)
        return self

    def render(self):
        fields = []

        type_map = self.__class__._type_map
        field_namer = self.__class__.field_namer

        def kwargs(field):
            kwargs = {}
            if field.type == '_CREATED':
                kwargs['auto_now_add'] = repr(True)
            elif field.type == '_MODIFIED':
                kwargs['auto_now'] = repr(True)
            if field.required:
                if field.type in ['text', 'email', 'image']:
                    kwargs['default'] = repr("")
                if field.type in ['float', 'date']:
                    kwargs['default'] = repr(0)
            if not field.required:
                kwargs['blank'] = repr(True)
            return kwargs

        for f in self.el.fields:
            d = {'identifier': field_namer.get_identifier(f),
                  'django_type': type_map[f.type],
                  'kwargs': kwargs(f),
                  'args': [],
                }
            fields.append(d)

        data = {'identifier': self.el.name,
                'fields': fields }
        return env.get_template('model.py').render(**data)

class Code(object):

    def __init__(self, name, el):
        self.name = name
        self.el = el
        self.code_path = "webapp/something"

    def render(self):
        return "%s for %d" % (self.name, id(self.el))









# tha main, naw mean?

def main(app):
    codes = []
    def create(event_name, el, *args, **kwargs):
        create_map = { 'model': DjangoModel.create_for_entity }
        try:
            c = create_map[event_name](el)
        except KeyError:
            c = Code(event_name, el)
        codes.append(c)


    for ent in app.entities:
        create('model', ent)
    for p in app.pages:
        create('view for page', p)
        create('url to serve page', p.url)
        for uie in p.uielements:
            if uie.is_form():
                create('html form for uie', uie)
                create('find or create form receiver', uie)
            elif uie.is_list():
                create('find or add the needed data to the view', uie)
                create('html for-loop for list', uie)
            elif uie.is_node():
                create('html node', uie)
            else:
                assert False

    cc = Coder('/dev/null')
    for c in codes:
        cc.add_code(c)
    for rel_path, code in cc.itercode():
        if rel_path == 'webapp/models.py':
            from pyflakes.api import check
            print code
            print check(code, 'models.py')






# brainstorming

## you can think of generating bytecode which looks like CREATE CODE ID=132234 WITH identifier=WHATERVER etc...

# code really should be an object.
# people can make their own code classes?
# ok, so code classes should stand on their own, be fully testable, etc.
# i can start with models


# code itself is a tree
# so we are transforming the app tree into this tree...
# for each page
    # conditional loading
    # how would i add that feature?
        # add some data to the analyzer
        # edit the extremely flexible code template.
        # how does the program know what code to write?
        # there must be a programming language which describes how to write code...
        # code templates are limited in their sophistication, and they quickly get messy.
        # use a function to create data, then render the data in the template-
        # use the template only as a presentation layer
