"A class for every file in the webapp, which knows how to create and write itself."

import re
from manager import Manager
import os
import os.path
import shutil
import tempfile
from os.path import join


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
    t = DjangoTemplate(p, analyzed_app)
    templates.add(t)
    v = DjangoView(p, analyzed_app, t)
    views.add(v)
    urls.add( DjangoUrl(p, v, analyzed_app) )

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

  def __init__(self, page, analyzed_app, template):
    self.name = page.name
    self.page = page
    self.app = analyzed_app
    self.template = template

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
    return repr("webapp/"+self.template.filename)

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
  env = Environment(loader=PackageLoader('app_builder.codegen', 'code_templates/template_templates'))

  def __init__(self, page, analyzed_app):
    self.name = page.name
    self.filename = page.name + ".html"
    self.page = page
    self.app = analyzed_app

  def render(self):
    template = DjangoTemplate.env.get_template('template.html')
    return template.render(uielements=self.page.uielements, css_props=self.page.design_props)

class DjangoApp:
  """Wrap all the app components. Nuff said"""

  def __init__(self, d_models, d_views, d_urls, d_templates):
    self.models = d_models
    self.views = d_views
    self.urls = d_urls
    self.templates = d_templates


class DjangoAppWriter:
  """Write django apps. Nuff said"""
  from jinja2 import Environment, PackageLoader
  env = Environment(loader=PackageLoader('app_builder.codegen', 'code_templates'))

  bpsrc = os.path.join(os.path.dirname(__file__), os.path.normpath("code_boilerplate"))

  def __init__(self, django_app):
    self.django_app = django_app

  """ Main app content """

  def render_models_py(self):
    template = DjangoAppWriter.env.get_template('models.py')
    return template.render(classes=list(self.django_app.models.each()))

  def render_urls_py(self):
    template = DjangoAppWriter.env.get_template('urls.py')
    return template.render(urls=list(self.django_app.urls.each()), form_receivers=[])

  def render_views_py(self):
    template = DjangoAppWriter.env.get_template('views.py')
    return template.render(views=self.django_app.views.each(), models=self.django_app.models.each(), form_receivers=[])

  def render_templates(self):
    templates = []
    for t in self.django_app.templates.each():
      templates.append( (t.filename, t.render(),) )

    return templates

  def render_css(self):
    return ""

  """ Directory Structure """

  """
  ./
    Procfile
    requirements.txt

    __init__.py
    manage.py
    settings.py
    wsgi.py
    urls.py

    webapp/
      __init__.py
      models.py
      views.py

    templates/
      base.html
      webapp/
        <template files>

    static/
      reset.css
      bootstrap.css
      style.css
      script.js
      jslibs/
        backbone.js
        underscore.js
        bootstrap.min.js
  """

  def write_to_fs(self, dest=None):
    if dest is None:
      dest = tempfile.mkdtemp()

    bpsrc = DjangoAppWriter.bpsrc

    # if dir is not empty, throw an exception
    dest = os.path.normpath(dest)
    if os.listdir(dest):
      raise Exception("I'm not going to write into a nonempty directory, that's dangerous")

    # create directories
    if not os.path.exists(dest):
      os.makedirs(dest)
    webapp_dir = join(dest, "webapp")
    templates_dir = join(dest, "templates")
    templates_webapp_dir = join(templates_dir, "webapp")
    static_dir = join(dest, "static")
    static_jslibs_dir = join(static_dir, "jslibs")
    os.mkdir(webapp_dir)
    os.mkdir(templates_dir)
    os.mkdir(templates_webapp_dir)
    os.mkdir(static_dir)

    def f_transporter(src_str, dest_str, f, *args, **kwargs):
      src_tokens = src_str.split('/')
      dest_tokens = dest_str.split('/')
      return f(join(bpsrc, *src_tokens), join(dest, *dest_tokens), *args, **kwargs)

    def write_string(content, dest_str):
      dest_tokens = dest_str.split('/')
      f = open(join(dest, *dest_tokens), "w")
      f.write(content)
      f.close()

    def copy_file(src_str, dest_str):
      return f_transporter(src_str, dest_str, shutil.copyfile)

    # copy boilerplate
    copy_file('heroku/Procfile', 'Procfile')
    copy_file('heroku/runtime.txt', 'runtime.txt')
    copy_file('requirements.txt', 'requirements.txt')
    copy_file('__init__.py', '__init__.py')
    copy_file('manage.py', 'manage.py')
    copy_file('settings.py', 'settings.py')
    copy_file('wsgi.py', 'wsgi.py')

    # main webapp files
    copy_file('__init__.py', 'webapp/__init__.py')
    write_string(self.render_models_py(), 'webapp/models.py')
    write_string(self.render_views_py(), 'webapp/views.py')
    write_string(self.render_urls_py(), 'urls.py')

    # templates
    copy_file('base.html', 'templates/base.html')
    for fname, template in self.render_templates():
      write_string(template, 'templates/webapp/{}'.format(fname))

    # static
    f_transporter('jslibs', 'static/jslibs', shutil.copytree)
    copy_file('script.js', 'static/script.js')
    write_string(self.render_css(), 'static/style.css')
    # TODO copy the other css files here too later.

    return dest
