class DjangoQuery:
  def __init__(self, query, analyzed_app):
    self.query = query
    self.name = query.name
    self.entity = query.entity
    self.query.django_query = self

  def identifier(self):
    return self.name

  def find_model(self, models):
    self.model = models.get_by_name(self.entity.name)
