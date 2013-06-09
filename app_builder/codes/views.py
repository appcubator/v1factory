from app_builder import naming
from . import env


class DjangoPageView(object):

    def __init__(self, identifier, args=None, template_code_path="", queries=None):
        """
        args is a list of tuples: (identifier, some_data_as_dict)
        """
        self.identifier = identifier
        self.code_path = "webapp/pages.py"

        self.locals = {}
        # args, make a namespace for the function
        self.namespace = naming.Namespace(parent_namespace=self.identifier.ns)
        self.locals['request'] = self.namespace.new_identifier('request', ref="VIEW.REQUEST")
        self.locals['page_context'] = self.namespace.new_identifier('page_context')
        if args is None:
            args = []
        self.args = [ (self.namespace.new_identifier(arg, ref=data['ref']), data) for arg, data in args ]

        # continuing args, make a namespace for page context
        self.pc_namespace = naming.Namespace()
        for arg, data in self.args:
            name_attempt = data.get('template_id', 'BADNAME') # helps a test pass
            data['template_id'] = self.pc_namespace.new_identifier(str(name_attempt), ref=data['ref'])

        # queries
        self.queries = []
        if queries is None:
            queries = []
        for q_obj in queries:
            self.add_query(q_obj)

        self.template_code_path = template_code_path

    def add_query(self, dq_obj):
        template_id = self.pc_namespace.new_identifier(dq_obj.model_id + 's') # very crude pluralize
        self.queries.append((template_id, dq_obj.render()))

    def render(self):
        return env.get_template('view.py').render(view=self, imports=self.namespace.imports(), locals=self.locals)


class DjangoFormReceiver(object):

    def __init__(self, identifier, form_id):
        """
        For now it'll only work with fields that are directly associate with the model
        """
        self.identifier = identifier
        self.namespace = naming.Namespace(parent_namespace=self.identifier.ns)
        self.locals = {'request': self.namespace.new_identifier('request')}
        self.form_id = form_id
        self.code_path = 'webapp/form_receivers.py'

    def render(self):
        return env.get_template('form_receiver.py').render(fr=self, imports=self.namespace.imports(), locals=self.locals)


class DjangoCustomFormReceiver(DjangoFormReceiver):

    def __init__(self, saved_thing_id, *args, **kwargs):
        super(DjangoCustomFormReceiver, self).__init__(*args, **kwargs)
        self.args = []
        self.locals['obj'] = self.namespace.new_identifier(saved_thing_id)
        self.relation_assignments = []
        self.commit = True
        self.after_save_saves = []

    def add_args(self, args):
        args = [ (self.namespace.new_identifier(arg, ref=data['ref']), data) for arg, data in args ]
        for arg, data in args:
            name_attempt = data.get('inst_id', 'BADNAME') # helps a test pass
            data['inst_id'] = self.pc_namespace.new_identifier(str(name_attempt), ref=data['ref']) 
        self.args.extend(args)


    def render(self):
        return env.get_template('form_receiver_custom_1.py').render(fr=self, imports=self.namespace.imports(), locals=self.locals)


class DjangoLoginFormReceiver(DjangoFormReceiver):

    def render(self):
        return env.get_template('login_form_receiver.py').render(fr=self, imports=self.namespace.imports(), locals=self.locals)


class DjangoSignupFormReceiver(DjangoFormReceiver):

    """
    def __init__(self, identifier, user_profile_form_id):
        super(DjangoSignupFormReceiver, self).__init__(identifier)
        #self.user_profile_form_id = user_profile_form_id
        """

    def render(self):
        return env.get_template('signup_form_receiver.py').render(fr=self, imports=self.namespace.imports(), locals=self.locals)
