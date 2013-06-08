import re

from app_builder.codes import DjangoModel, DjangoUserModel
from app_builder.codes import DjangoPageView, DjangoTemplate
from app_builder.codes import DjangoURLs, DjangoStaticPagesTestCase, DjangoQuery
from app_builder.codes import DjangoForm, DjangoFormReceiver
from app_builder.codes import DjangoLoginForm, DjangoLoginFormReceiver, DjangoSignupFormReceiver
from app_builder.imports import create_import_namespace
from app_builder import naming
from app_builder.dynamicvars import Translator


class AppComponentFactory(object):

    def __init__(self):

        self.model_namespace = create_import_namespace('webapp/models.py')
        self.form_namespace = create_import_namespace('webapp/forms.py')
        self.view_namespace = create_import_namespace('webapp/pages.py')
        self.fr_namespace = create_import_namespace('webapp/form_receivers.py')
        self.urls_namespace = create_import_namespace('webapp/urls.py')
        self.tests_namespace = create_import_namespace('webapp/tests.py')


    # MODELS

    def create_model(self, entity):
        """
        Creates DjangoModel and the non relational fields for it.
        Additionally, deals with User model separately.
        """
        if entity.is_user:
            user_identifier = self.model_namespace.get_by_import('django.models.User')
            user_profile_identifier = self.model_namespace.new_identifier('UserProfile', cap_words=True)
            m = DjangoUserModel(user_identifier, user_profile_identifier)
            for f in filter(lambda x: not x.is_relational(), entity.user_profile_fields):
                #df = m.create_field(f.name, f.type, f.required)
                df = m.create_field(f.name, f.type, False) # make all field not required by default.
                            # the django model will create an identifier based on
                            # the name
                f._django_field_identifier = df.identifier
                f._django_field = df
            for f in entity.user_fields:
                x = {'username': 'username',
                     'First Name': 'first_name',
                     'Last Name': 'last_name',
                     'Email': 'email'
                    }
                f._django_field_identifier = x[f.name]

        else:
            identifier = self.model_namespace.new_identifier(entity.name, cap_words=True)
            m = DjangoModel(identifier)

            for f in filter(lambda x: not x.is_relational(), entity.fields):
                #df = m.create_field(f.name, f.type, f.required)
                df = m.create_field(f.name, f.type, False) # fields are not required by default.
                            # the django model will create an identifier based on
                            # the name
                f._django_field_identifier = df.identifier
                f._django_field = df

        # set references to each other on both.
        # entity reference used in v1script translation (dynamicvars.py)
        entity._django_model = m
        m._entity = entity
        return m

    def create_relational_fields_for_model(self, entity):
        m = entity._django_model

        for f in filter(lambda x: x.is_relational(), entity.fields):
            # get the related django model's id (from the imports.)
            rel_model = f.entity._django_model
            rel_model_id = m.namespace.get_by_ref(rel_model)
            # make an id for the related name in the related model's namespace
            # TODO FIXME potential bugs with related name and field name since they are really injected into the model.Model instance namespace
            rel_name_id = rel_model.namespace.new_identifier(f.related_name, ref=rel_model)

# TODO FIGURE THIS OUT (required)            df = m.create_relational_field(f.name, f.type, rel_model_id, rel_name_id, f.required)
            df = m.create_relational_field(f.name, f.type, rel_model_id, rel_name_id, False)
                        # the django model will create an identifier based on
                        # the name
            f._django_field_identifier = df.identifier
            f._django_field = df

    def import_model_into_namespace(self, entity, namespace):
        if namespace == 'views':
            ns = self.view_namespace
        elif namespace == 'forms':
            ns = self.form_namespace
        elif namespace == 'form receivers':
            ns = self.fr_namespace
        elif namespace == 'tests':
            ns = self.tests_namespace
        else:
            raise KeyError

        m = entity._django_model
        import_symbol = ('webapp.models', m.identifier)
        ns.find_or_create_import(import_symbol, m.identifier)


    # VIEWS

    def create_view_for_page(self, page):
        identifier = self.view_namespace.new_identifier(page.name)

        args = []
        for e in page.get_tables_from_url():
            model_id = e._django_model.identifier
            template_id = model_id
            args.append((e.name.lower()+'_id', {"model_id": model_id, "template_id": template_id, "ref": e._django_model}))

        v = DjangoPageView(identifier, args=args)
        page._django_view = v
        return v

    def find_or_create_query_for_view(self, uie):

        entity = uie.container_info.entity_resolved
        # TODO implement filtering of queries
        dq = DjangoQuery(entity._django_model.identifier)

        # TODO add to parent in a nicer way.
        def get_parent(obj):
            # app/pages/0/uielements/3  => app/pages/0
            parent_path = obj._path[:obj._path.rfind('/')]
            parent_path = parent_path[:parent_path.rfind('/')]
            return obj.app.find(parent_path)
        page = get_parent(uie)
        view = page._django_view
        view.add_query(dq)

        return dq


    # HTML GEN

    def init_translator(self, app):
        self.v1_translator = Translator(app.tables)

    def properly_name_variables_in_template(self, page):
        # find things in braces and replace them with this function:
        translate = lambda m: "{{ %s }}" % self.v1_translator.v1script_to_app_component(m.group(1).strip(), page=page) 
        translate_all = lambda x: re.sub(r'\{\{ ?([^\}]*) ?\}\}', translate, x)

        for uie in page.uielements:
            uie.visit_strings(translate_all)

    def create_tree_structure_for_page_nodes(self, page):
        """
        Given a page, returns a django template which has references
        to the page's uielements. The resulting tree uses the layout of
        the uielements to create the layout of the page and
        it positions the uielements relative to their containers.

        """
        t = DjangoTemplate(page._django_view.identifier)
                            # this is an underscore-name, so it should be good as a filename
        t.create_tree(page.uielements)
        t.page = page
        page._django_template = t
        page._django_view.template_code_path = t.filename
        return t


    # URL NAMESPACES

    def create_urls(self, app):
        url_patterns_id = self.urls_namespace.new_identifier('urlpatterns', ref='MISC.urlpatterns')
        u = DjangoURLs('webapp.pages', self.urls_namespace, url_patterns_id, first_time=True)
        app._django_page_urls = u
        return u

    def create_fr_urls(self, app):
        url_patterns_id = self.urls_namespace.get_by_ref('MISC.urlpatterns')
        u = DjangoURLs('webapp.form_receivers', self.urls_namespace, url_patterns_id, first_time=False)
        app._django_fr_urls = u
        return u


    # ADDING ROUTES

    def add_page_to_urls(self, page):
        url_obj = page.app._django_page_urls

        route = (page.url_regex, page._django_view)
        url_obj.routes.append(route)

    def create_url_for_form_receiver(self, uie):
        url_obj = uie.app._django_fr_urls

        url = self.urls_namespace.new_identifier(uie._django_form.identifier)
        route = (repr('^%s/$' % url), uie._django_form_receiver)
        url_obj.routes.append(route)

        # this assumes the form receiver is the this module
        uie.set_post_url('{%% url webapp.form_receivers.%s %%}' % uie._django_form_receiver.identifier)


    # FORMS

    def create_django_form_for_entity_based_form(self, uie):
        form_model = uie.container_info.form # bind to this name to save me some typing
        if form_model.action not in ['create', 'edit']:
            return None
        prim_name = form_model.action + '_' + form_model.entity_resolved.name
        form_id = self.form_namespace.new_identifier(prim_name, cap_words=True)
        model_id = form_model.entity_resolved._django_model.identifier
        field_ids = []
        for f in form_model.fields:
            try:
                assert not f.is_relational()
                field_ids.append(f.model_field._django_field_identifier)
            except AttributeError:
                pass
        form_obj = DjangoForm(form_id, model_id, field_ids)
        uie._django_form = form_obj
        return form_obj


## START HACKING
    def create_login_form_if_not_exists(self, uie):
        if hasattr(self, '_django_login_form'):
            form_obj = self._django_login_form
        else:
            prim_name = 'LoginForm'
            form_id = self.form_namespace.find_or_create_import('django.forms.AuthForm', prim_name)
            form_obj = DjangoLoginForm(form_id)

        uie._django_form = form_obj
        return form_obj

    def create_signup_form_if_not_exists(self, uie):
        if hasattr(self, '_django_signup_form'):
            form_obj = self._django_signup_form
        else:
            prim_name = 'SignupForm'
            form_id = self.form_namespace.find_or_create_import('django.forms.UserCreationForm', prim_name)
            form_obj = DjangoLoginForm(form_id)
        uie._django_form = form_obj
        return form_obj

    def create_login_form_receiver_if_not_created(self, uie):
        if hasattr(self, '_django_login_form_receiver'):
            fr = self._django_login_form_receiver
        else:
            fr_id = self.fr_namespace.new_identifier('Login')
            if 'django.auth.login' not in self.fr_namespace.imports():
                self.fr_namespace.find_or_create_import('django.auth.login', 'auth_login')
            fr = DjangoLoginFormReceiver(fr_id, uie._django_form.identifier)
        uie._django_form_receiver = fr
        return fr

    def create_signup_form_receiver_if_not_created(self, uie):
        if hasattr(self, '_django_signup_form_receiver'):
            fr = self._django_signup_form_receiver
        else:
            fr_id = self.fr_namespace.new_identifier('Sign Up')
            if 'django.auth.login' not in self.fr_namespace.imports():
                self.fr_namespace.find_or_create_import('django.auth.login', 'auth_login')
            if 'django.auth.authenticate' not in self.fr_namespace.imports():
                self.fr_namespace.find_or_create_import('django.auth.authenticate', 'authenticate')
            fr = DjangoSignupFormReceiver(fr_id, uie._django_form.identifier)
        uie._django_form_receiver = fr
        return fr

    def create_url_for_form_receiver_if_not_created(self, uie):
        url_obj = uie.app._django_fr_urls
        for url, ref in url_obj.routes:
            if ref == uie._django_form_receiver:
                return None
        return self.create_url_for_form_receiver(uie)

## END HACKING


    def import_form_into_form_receivers(self, uie):
        f = uie._django_form
        import_symbol = ('webapp.forms', f.identifier)
        self.fr_namespace.find_or_create_import(import_symbol, f.identifier)

    def create_form_receiver_for_form_object(self, uie):
        fr_id = self.fr_namespace.new_identifier(uie._django_form.identifier)
        fr = DjangoFormReceiver(fr_id, uie._django_form.identifier)
        uie._django_form_receiver = fr
        return fr

    # TESTS

    def create_tests_for_static_pages(self, app):
        ident_url_pairs = []
        for p in app.pages:
            if p.is_static():
                ident_url_pairs.append((p._django_view.identifier, '/' + ''.join([x + '/' for x in p.url.urlparts])))
        d = DjangoStaticPagesTestCase(ident_url_pairs, self.tests_namespace)
        return d
