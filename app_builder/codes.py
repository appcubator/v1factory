from app_builder import naming
from jinja2 import Environment, PackageLoader

env = Environment(trim_blocks = True, loader=PackageLoader('app_builder', 'code_templates'))

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

    @staticmethod
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

    def render(self):
        fields = []

        type_map = self.__class__._type_map
        field_namer = self.__class__.field_namer

        for f in self.el.fields:
            d = {'identifier': field_namer.get_identifier(f),
                  'django_type': type_map[f.type],
                  'kwargs': DjangoModel.kwargs(f),
                  'args': [],
                }
            fields.append(d)

        data = {'identifier': self.el.name,
                'fields': fields }
        return env.get_template('model.py').render(**data)

class DjangoView(object):
    pass

class Code(object):

    def __init__(self, name, el):
        self.name = name
        self.el = el
        self.code_path = "webapp/something"

    def render(self):
        return "%s for %d" % (self.name, id(self.el))
