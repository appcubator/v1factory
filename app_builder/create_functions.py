from app_builder.codes import DjangoModel, DjangoPageView, DjangoTemplate, DjangoURLs, DjangoStaticPagesTestCase
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
        page_context = page.get_page_context()  # name, entity pairs
        v = DjangoPageView(identifier, page_context=page_context)
        # the core of djangoview will be the actions.
        page._django_view = v
        return v

    def find_or_create_query_for_view(self, uie):
        def get_parent(obj):
            # app/pages/0/uielements/3  => app/pages/0
            parent_path = obj._path[:obj._path.rfind('/')]
            parent_path = parent_path[:parent_path.rfind('/')]
            return obj.app.find(parent_path)
        page = get_parent(uie)
        view = page._django_view
        # TODO create the code object and add to the view function

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
        # TODO make the url more legit
        route = ("r'^" + ''.join([x + '/' for x in page.url.urlparts]) + "$'", page._django_view)
        url_obj.routes.append(route)

        return None

    def create_tests_for_static_pages(self, app):
        ident_url_pairs = []
        for p in app.pages:
            ident_url_pairs.append((p._django_view.identifier, '/' + ''.join([x + '/' for x in p.url.urlparts])))
        d = DjangoStaticPagesTestCase(ident_url_pairs)
        return d
