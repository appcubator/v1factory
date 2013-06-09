from app_builder import naming

from . import env


class DjangoQuery(object):

    def __init__(self, model_id):
        self.model_id = model_id

    def render(self):
        return "%s.objects.all()" % self.model_id


class DjangoField(object):

    _type_map = {'text': 'TextField',
                 'number': 'FloatField',
                 'date': 'DateTimeField',
                 '_CREATED': 'DateTimeField',
                 '_MODIFIED': 'DateTimeField',
                 'email': 'EmailField',
                 'image': 'TextField',
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
            kwargs['auto_now_add'] = True
        elif field.canon_type == '_MODIFIED':
            kwargs['auto_now'] = True
        if field.required:
            if field.canon_type in ['text', 'email', 'image']:
                kwargs['default'] = repr("")
            if field.canon_type in ['float', 'date']:
                kwargs['default'] = 0
        else:
            kwargs['blank'] = True
            if field.django_type not in ('TextField', 'CharField'):
                kwargs['null'] = True
        return kwargs

class DjangoRelatedField(object):
    """Should abide by the same interface as DjangoField"""
    _type_map = {
        'fk': 'ForeignKey',
        'm2m': 'ManyToManyField',
        'o2o': 'OneToOneField',
    }

    def __init__(self, identifier, relation_type, rel_model_id, rel_name_id, required=True, parent_model=None, quote=True):
        self.identifier = identifier
        self.rel_type = relation_type
        self.django_type = self.__class__._type_map[relation_type]
        self.required = required
        self.model = parent_model
        self.rel_model_id = rel_model_id
        self.rel_name_id = rel_name_id
        if quote:
            self.args = [repr(str(rel_model_id))]
        else:
            self.args = [str(rel_model_id)]

    def kwargs(field):
        kwargs = {}
        kwargs['related_name'] = repr(str(field.rel_name_id))
        if not field.required:
            kwargs['blank'] = repr(True)
            kwargs['null'] = repr(True)
        return kwargs


class DjangoModel(object):

    def __init__(self, identifier):
        self.identifier = identifier
        identifier.ref = self
        self.code_path = "webapp/models.py"
        self.namespace = naming.Namespace(parent_namespace=self.identifier.ns)
        self.fields = []

    def create_field(self, name, canonical_type, required):
        identifier = self.namespace.new_identifier(name)
        f = DjangoField(
            identifier, canonical_type, required=required, parent_model=self)
        self.fields.append(f)
        return f

    def create_relational_field(self, name, relation_type, rel_model_id, rel_name_id, required, quote=True):
        assert relation_type in ['o2o', 'm2m', 'fk']
        identifier = self.namespace.new_identifier(name)
        f = DjangoRelatedField(
            identifier, relation_type, rel_model_id, rel_name_id, required=required, parent_model=self, quote=quote)
        self.fields.append(f)
        return f

    def create_query(self): # will add more options for query later
        q = DjangoQuery(self.identifier)
        return q

    def render(self):
        return env.get_template('model.py').render(model=self, imports=self.namespace.imports(), locals={})


class DjangoUserModel(DjangoModel):

    def __init__(self, user_identifier, user_prof_identifier):
        """Provide:
        1. the identifier for the user (imported from django.contrib.models...),
        1. the identifier for the userprofile class (imported from django.contrib.models...),

        """
        super(DjangoUserModel, self).__init__(user_identifier)
        self.user_profile_identifier = user_prof_identifier
        self.namespace = user_prof_identifier.ns
        self.locals = {}
        self.locals['user o2o'] = self.namespace.new_identifier('user')

    def create_query(self):
        raise Exception("what up brah. this is not yet implemented")

    def render(self):
        return env.get_template('usermodel.py').render(model=self, imports=self.namespace.imports(), locals=self.locals)
