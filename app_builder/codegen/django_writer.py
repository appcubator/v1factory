"A class for every file in the webapp, which knows how to create and write itself."

import re
from manager import Manager


def analyzed_app_to_app_components(analyzed_app):
  models = Manager(DjangoModel)
  views = Manager(DjangoView)
  urls = Manager(DjangoUrl)
  templates = Manager(DjangoTemplate)

  for m in analyzed_app.models.each():
    models.add( DjangoModel(m, analyzed_app) )

  for p in analyzed_app.pages.each():
# url has to know about the view
# view has to know about the templates location
# template has to know about the view's context
    v = DjangoView(p, analyzed_app)
    views.add(v)
    urls.add( DjangoUrl(p, v, analyzed_app) )
    templates.add( DjangoTemplate(p, analyzed_app) )

  dw = DjangoApp(models, views, urls, templates)
  return dw

class DjangoModel:
  """
  Represents a database model.
  Knows how to write itself as a class.
  Knows how to import itself.
  """

  def __init__(self, model, django_app):
    self.name = model.name
    self.fields = Manager(DjangoField)

    for f in model.fields:
      df = DjangoField(f, self, django_app)
      self.fields.add(df)

  def foreign_key_name(self):
    return self.name.lower()+"_id"

  def identifier(self):
    if self.name == "User":
      return "UserProfile"
    else:
      return self.name

  def import_line(self):
    return "from webapp.models import " + self.identifier()

class DjangoField:
  """
  Represents a model's field. Has a name, a type, maybe some relationship things, etc.
  """

  _type_map = {'text' : 'Text',
            'number' : 'Float',
            'date' : 'DateTime',
            '_CREATED' : 'DateTime',
            '_MODIFIED' : 'DateTime',
            'email' : 'Email',}

  def __init__(self, field, model, django_app):
    self.name = field.name
    self.field_type = field.content_type
    self.required = field.required

    # case on the model type to add the correct type of object as the model
    if isinstance(model, DjangoModel):
      self.model = model
    elif isinstance(model, str):
      model_obj = DjangoModel.objects.search_by_name(model)
      assert(model_obj is not None)
      self.model = model_obj
    else:
      raise Exception("Didn't recognized the type of the given model (not a DjangoModel or str)")

    # ensure the field type is recognized
    if self.field_type not in DjangoField._type_map:
      raise Exception("This field type is not yet implemented: %s" % self.field_type)

  def identifier(self):
    """What will this field be referred to as a variable?"""
    return "m_" + self.name

  def django_type(self):
    return DjangoField._type_map[self.field_type]

  def args(self):
    return []

  def kwargs(self):
    kwargs = {}
    if self.field_type == '_CREATED':
      kwargs['auto_now_add'] = repr(True)
    elif self.field_type == '_MODIFIED':
      kwargs['auto_now'] = repr(True)
    if not self.required:
      kwargs['blank'] = repr(True)
    return kwargs

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.codegen', 'code_templates'))
    template = env.get_template('model_fields.py')
    return template.render(f = self)

class Query:
  """Remembers the variable name and the executing line of the query"""
  pass


class DjangoView:

  def __init__(self, page, analyzed_app):
    self.name = page.name
    self.page = page
    self.app = analyzed_app

  def identifier(self):
    return "view_"+self.name

  def view_path(self):
    return "webapp.views."+self.identifier()
    pass

  def queries(self):
    return []

  def url_keys(self):
    return []

  def template_repr(self):
    return repr("here/lies/template.html")

class DjangoUrl:

  def __init__(self, page, view, analyzed_app):
    self.name = page.name
    self.page = page
    self.app = analyzed_app
    self.view = view

  def url_parts_to_regex(self):
    url_parts = self.page.route.urlparts
    id_regex = r'(\d+)'
    def repl_model_with_id_regex(s):
      if isinstance(s, str) or isinstance(s, unicode):
        return s
      else:
        from analyzer import Model
        assert(isinstance(s, Model))
        return id_regex

    return '^' + ''.join(map(lambda x : repl_model_with_id_regex(x) + r'/', url_parts)) + '$'

  def url_repr(self):
    return repr(self.url_parts_to_regex())

  def view_path_repr(self):
    return repr(self.view.view_path())

class HTMLRenderer:

  def html_from_uie(self, uie):
    pass

class DjangoTemplate:
  from jinja2 import Environment, PackageLoader
  env = Environment(loader=PackageLoader('app_builder.codegen.dev', 'code_templates/template_templates'))

  def __init__(self, page, analyzed_app):
    self.name = page.name
    self.page = page
    self.app = analyzed_app

  def render(self):
    template = DjangoTemplate.env.get_template('template.html')
    return template.render(uielements=self.page.uielements)

class DjangoApp:
  """Write the different appcomponents to code."""
  from jinja2 import Environment, PackageLoader
  env = Environment(loader=PackageLoader('app_builder.codegen.dev', 'code_templates'))

  _single = None

  def __init__(self, d_models, d_views, d_urls, d_templates):
    self.models = d_models
    self.views = d_views
    self.urls = d_urls
    self.templates = d_templates

    if DjangoApp._single is None:
      DjangoApp._single = self
    else:
      raise Exception("you can only create one at a time.")

  def write_models_py(self):
    template = DjangoApp.env.get_template('models.py')
    return template.render(classes=list(self.models.each()))

  def write_urls_py(self):
    template = DjangoApp.env.get_template('urls.py')
    return template.render(urls=list(self.urls.each()), form_receivers=[])

  def write_views_py(self):
    template = DjangoApp.env.get_template('views.py')
    return template.render(views=self.views.each(), models=self.models.each(), form_receivers=[])

  def write_templates(self):
    templates = []
    for t in self.templates.each():
      templates.append(t.render())

    return templates
