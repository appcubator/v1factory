from app_builder.codes import Code, DjangoModel, DjangoPageView
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
