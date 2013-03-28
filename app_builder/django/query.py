class DjangoQuery:
  def __init__(self, query, analyzed_app):
    self.query = query
    self.name = query.name
    self.entity = query.entity
    self.field_names = query.fields # TODO bind to the DjangoField instances
    self.belongs_to_user = query.user_filter
    self.sort_on = query.sort_on
    self.nrows = query.nrows
    self.query.django_query = self

  @classmethod
  def create(cls):
    pass

  def identifier(self):
    return self.name

  def find_model(self, models):
    self.model = models.get_by_name(self.entity.name)
    self.fields = []
    for field_name in self.field_names:
      f = self.model.fields.get_by_name(field_name)
      self.fields.append(f)

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    template = env.get_template('query.py')
    return template.render(query = self)

