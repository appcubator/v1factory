from app_builder.codes import Code, DjangoModel, DjangoPageView
from app_builder import naming


class AppComponentFactory(object):

    def __init__(self):
        self.model_namer = naming.ModelNamer()

    def create_model(self, entity):
        identifier = self.model_namer.get_identifier(entity.name)
        m = DjangoModel(identifier)

        for f in entity.fields:
            m.create_field(f.name, f.type, f.required)
                        # the django model will create an identifier based on
                        # the name

        entity._django_model = m
        return m

    def create_view_for_page(self, page):
        pass
