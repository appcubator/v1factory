class DjangoView(object):

  def __init__(self, name=None, template=None, queries=None):
    self.name = name
    self.template = template
    self.queries = queries

  @classmethod
  def create(cls, page, analyzed_app, template):
    """Create a view from a page, analyzed app, and djangotemplate"""
    def get_queries_out_of_page(page):
      pass
    #queries = get_queries_out_of_page(page)
    queries = []
    self = cls(name=page.name, template=template, queries=queries)

    return self

  def identifier(self):
    return "view_"+self.name.replace(" ", "_")

  def view_path(self):
    return "webapp.views."+self.identifier()

  def url_keys(self):
    return []

  def template_repr(self):
    return repr("webapp/"+self.template.filename)
