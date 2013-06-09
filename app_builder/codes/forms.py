from app_builder import naming

from . import env


class DjangoForm(object):

    def __init__(self, identifier, model_id, field_ids):
        """
        For now it'll only work with model fields
        """
        self.identifier = identifier
        self.namespace = naming.Namespace(parent_namespace=identifier.ns)
        self.model_id = model_id
        self.code_path = 'webapp/forms.py'
        self.field_ids = field_ids

    def render(self):
        if len(self.field_ids) == 1:
            self.included_field_string = repr(str(self.field_ids[0])) + ','
        else:
            self.included_field_string = ', '.join([repr(str(i)) for i in self.field_ids])
        return env.get_template('form.py').render(form=self, imports=self.namespace.imports(), locals={})


# HACK TO BE REFACTORED LATER
class DjangoLoginForm(DjangoForm):

    def __init__(self, identifier):
        self.identifier = identifier
        self.namespace = naming.Namespace(parent_namespace=identifier.ns) # this is necessary so the coder can get imports from the namespace
        self.code_path = 'webapp/forms.py'

    def render(self):
        return ""

