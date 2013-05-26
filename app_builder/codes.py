from jinja2 import Environment, PackageLoader
from app_builder import naming

env = Environment(trim_blocks=True, loader=PackageLoader(
    'app_builder', 'code_templates'))


class DjangoPageView(object):

    def __init__(self, name, el):
        self.name = name
        self.el = el  # the page
        self.code_path = "webapp/pages.py"
        self.page_context = self.el.get_page_context()  # name, entity pairs

        # action is some kind of tree where the terminal nodes render
        # HTTPResponses.
        self.actions = None

    @classmethod
    def create_for_page(cls, page):
        self = cls(page.name, page)
        page._django_page_view = self
        return self

    def actionify(self, actions):
        # initially, you're going to get some data
        pass

    def render(self):
        return "NYI"
        data = {'identifier': self.name,
                'page_context': self.page_context,  # the args refer to url data
                }
        return env.get_template('view.py').render(**data)


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
        self.field_namer = naming.FieldNamer(model=self)
        self.fields = []

    def create_field(self, name, canonical_type, required):
        identifier = self.field_namer.get_identifier(name)
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
