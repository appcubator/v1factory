class DjangoQuery:
  def __init__(self, query, analyzed_app):
    self.query = query
    self.name = query.name
    self.entity = query.entity
    self.fields = query.fields
    self.belongs_to_user = query.user_filter
    self.model = query.model
    self.sort_on = query.sort_on
    self.nrows = query.nrows
    self.query.django_query = self

  def identifier(self):
    return self.name

  def find_model(self, models):
    self.model = models.get_by_name(self.entity.name)

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    template = env.get_template('query.py')
    return template.render(query = self)

