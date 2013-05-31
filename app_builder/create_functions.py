from app_builder.codes import DjangoModel, DjangoPageView, DjangoTemplate, DjangoURLs, DjangoStaticPagesTestCase, DjangoQuery
from app_builder import naming


class AppComponentFactory(object):

    def __init__(self):
        self.model_namer = naming.CWNamespace()
        self.view_namer = naming.USNamespace()

    def create_model(self, entity):
        identifier = self.model_namer.new_identifier(entity.name)
        m = DjangoModel(identifier)

        for f in entity.fields:
            m.create_field(f.name, f.type, f.required)
                        # the django model will create an identifier based on
                        # the name

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
        t.create_tree([u.subclass for u in page.uielements]) # XXX HACK PLZ FIXME TODO
        t.page = page
        page._django_template = t
        page._django_view.template_code_path = t.filename
        return t

    def create_urls(self, app):
        u = DjangoURLs('webapp.pages')
        app._django_urls = u
        return u

    def add_page_to_urls(self, page):
        url_obj = page.app._django_urls

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
