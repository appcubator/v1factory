from app_builder.codes import Code, DjangoModel, DjangoPageView, DjangoTemplate
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
        # TODO create the code object and add to the page

    def create_html_node(self, uie):
        pass # just create the node

    def create_html_structure(self, page):

        # TODO name the template html files
        t = DjangoTemplate('dummy', 'dummy.html')
        t.create_tree(page.uielements)
        return t
