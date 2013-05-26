from jinja2 import Environment, PackageLoader
from app_builder import naming

env = Environment(trim_blocks=True, loader=PackageLoader(
    'app_builder', 'code_templates'))


class DjangoPageView(object):

    def __init__(self, identifier, page_context={}):
        self.identifier = identifier
        self.code_path = "webapp/pages.py"
        self.page_context = page_context

        # action is some kind of tree where the terminal nodes render
        # HTTPResponses.
        self.actions = None

    def render(self):
        return env.get_template('view.py').render(view=self)


class DjangoField(object):

    _type_map = {'text': 'TextField',
                 'number': 'FloatField',
                 'date': 'DateTimeField',
                 '_CREATED': 'DateTimeField',
                 '_MODIFIED': 'DateTimeField',
                 'email': 'EmailField',
                 'fk': 'ForeignKey',
                 'm2m': 'ManyToManyField',
                 'image': 'TextField',
                 'onetoone': 'OneToOneField',
                 }

    def __init__(self, identifier, canonical_type, required=False, parent_model=None):
        """parent_model is a DjangoModel instance"""
        self.identifier = identifier
        self.canon_type = canonical_type
        self.django_type = self.__class__._type_map[canonical_type]
        self.required = required
        self.model = parent_model
        self.args = []

    def kwargs(field):
        kwargs = {}
        if field.canon_type == '_CREATED':
            kwargs['auto_now_add'] = repr(True)
        elif field.canon_type == '_MODIFIED':
            kwargs['auto_now'] = repr(True)
        if field.required:
            if field.canon_type in ['text', 'email', 'image']:
                kwargs['default'] = repr("")
            if field.canon_type in ['float', 'date']:
                kwargs['default'] = repr(0)
        if not field.required:
            kwargs['blank'] = repr(True)
        return kwargs


class DjangoModel(object):

    def __init__(self, identifier):
        self.identifier = identifier
        self.code_path = "webapp/models.py"
        self.field_namer = naming.USNamespace()
        self.fields = []

    def create_field(self, name, canonical_type, required):
        identifier = self.field_namer.new_identifier(name)
        f = DjangoField(
            identifier, canonical_type, required=required, parent_model=self)
        self.fields.append(f)
        return f

    def render(self):
        return env.get_template('model.py').render(model=self)


class Code(object):

    def __init__(self, name, el):
        self.name = name
        self.el = el
        self.code_path = "webapp/something"

    def render(self):
        return "%s for %d" % (self.name, id(self.el))
