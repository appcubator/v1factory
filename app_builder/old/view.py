class DjangoView(object):

  def __init__(self, name=None, template=None, queries=None, page=None):
    self.name = name
    self.template = template
    self.queries = queries
    self.page = page
    if self.page is not None:
      self.page._django_view = self # used for the goto/redirect of the form

  @classmethod
  def create(cls, page, analyzed_app, template):
    """Create a view from a page, analyzed app, and djangotemplate"""
    self = cls(name=page.name, template=template, queries=[], page=page)

    return self

  def identifier(self):
    return "view_"+self.name.replace(" ", "_").replace("-", "_")

  def view_path(self):
    return "webapp.views."+self.identifier()

  def url_keys(self):
    return []

  def template_repr(self):
    return repr("webapp/"+self.template.filename)

  def render(self, env):
    from jinja2 import Environment, PackageLoader
    template = env.get_template('view.py')
    return template.render(v = self)

class DjangoLogoutView(DjangoView):

  def identifier(self):
    return "logout"

  def view_path(self):
    return "webapp.views.logout"

  def render(self, env):
    from jinja2 import Environment, PackageLoader
    template = env.get_template('logout_view.py')
    return template.render(v = self)
