from app_builder.codes import DjangoModel, DjangoPageView, DjangoTemplate, DjangoURLs, DjangoStaticPagesTestCase, DjangoQuery, DjangoForm, DjangoFormReceiver
from app_builder import naming


class AppComponentFactory(object):

    def __init__(self):
        self.model_namer = naming.CWNamespace()
        self.form_namer = naming.CWNamespace()
        self.view_namer = naming.USNamespace()
        self.fr_namer = naming.USNamespace()
        self.fr_url_namespace = naming.USNamespace()

    def create_model(self, entity):
        identifier = self.model_namer.new_identifier(entity.name)
        m = DjangoModel(identifier)

        for f in entity.fields:
            df = m.create_field(f.name, f.type, f.required)
                        # the django model will create an identifier based on
                        # the name
            f._django_field = df

        entity._django_model = m
        return m

    def create_view_for_page(self, page):
        identifier = self.view_namer.new_identifier(page.name)

        args = []
        for e in page.get_entities_from_url():
            model_id = e._django_model.identifier
            template_id = model_id
            args.append((e.name.lower()+'_id', {"model_id": model_id, "template_id": template_id}))

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

    def create_tree_structure_for_page_nodes(self, page):
        """
        Given a page, returns a django template which has references
        to the page's uielements. The resulting tree uses the layout of
        the uielements to create the layout of the page and
        it positions the uielements relative to their containers.

        """
        t = DjangoTemplate(page._django_view.identifier)
                            # this is an underscore-name, so it should be good as a filename
        t.create_tree([u for u in page.uielements]) # XXX HACK PLZ FIXME TODO
        t.page = page
        page._django_template = t
        page._django_view.template_code_path = t.filename
        return t

    def create_urls(self, app):
        u = DjangoURLs('webapp.pages')
        app._django_page_urls = u
        return u

    def create_fr_urls(self, app):
        u = DjangoURLs('webapp.form_receivers')
        app._django_fr_urls = u
        return u

    def add_page_to_urls(self, page):
        url_obj = page.app._django_page_urls

        route = (page.url_regex, page._django_view)
        url_obj.routes.append(route)

        return None

    def create_tests_for_static_pages(self, app):
        ident_url_pairs = []
        for p in app.pages:
            if p.is_static():
                ident_url_pairs.append((p._django_view.identifier, '/' + ''.join([x + '/' for x in p.url.urlparts])))
        d = DjangoStaticPagesTestCase(ident_url_pairs)
        return d

    def create_django_form_for_entity_based_form(self, uie):
        form_model = uie.container_info.form # bind to this name to save me some typing
        prim_name = form_model.action + '_' + form_model.entity
        form_id = self.form_namer.new_identifier(prim_name)
        model_id = form_model.entity_resolved._django_model.identifier
        field_ids = []
        for f in form_model.fields:
            try:
                field_ids.append(f.model_field._django_field.identifier)
            except AttributeError:
                pass
        form_obj = DjangoForm(form_id, model_id, field_ids)
        uie._django_form = form_obj
        return form_obj

    def create_form_receiver_for_form_object(self, uie):
        fr_id = self.fr_namer.new_identifier(uie._django_form.identifier)
        fr = DjangoFormReceiver(fr_id, uie._django_form.identifier)
        uie._django_form_receiver = fr
        return fr

    def create_url_for_form_receiver(self, uie):
        url_obj = uie.app._django_fr_urls

        url = self.fr_url_namespace.new_identifier(uie._django_form.identifier)
        route = (url, uie._django_form_receiver)
        url_obj.routes.append(route)

        self._url = url

        return None
