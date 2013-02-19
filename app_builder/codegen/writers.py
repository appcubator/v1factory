import sys
import tempfile
from shutil import copytree
from os.path import join
import os.path
import os

class DjangoWriter:

  def __init__(self, analyzed_app):
    self.app = analyzed_app

# MODELS

  # our language => django field prefix
  mf_map = {'text' : 'Text',
            'number' : 'Float',
            'date' : 'DateTime',
            'email' : 'Email',}

  @staticmethod
  def code_for_field(f):
    if f['type'] in mf_map:
      return  '{} = models.{}Field()\n'.format(f['name'], mf_map[f['type'])
    elif f['type'] in [ cls['name'] for cls in app.classes ]:
      return '{} = models.ForegnKey({})\n'.format(f['name'], f['type'])
    else:
      print "Error, field {}:{} not a primitive type nor a model name".format(f['name'], f['type'])
      sys.exit() # XXX raise an exception instead.

  def models_py_as_string(self):
    """Given the entities of the app and their attributes, return the models.py file as a string."""
    generic_imports = "from django.contrib.auth.models import User\n"+
                      "from django.db import models\n"

    # first put the import statements
    file_string = generic_imports

    # for each entity, declare a class and write the fields.
    for m in app.classes:
      file_string += 'class {}(models.Model):\n'.format(m['name'])
      for f in m['fields']:
        # go in an indent level
        file_string += '  ' + code_for_field(f)

    return file_string

  def model_imports(self):
    imports = []
    imports.append("from django.contrib.auth.models import User")
    for m in self.app.classes:
      imports.append('from {}.models import {}'.format(APP_NAME, m.name))
    return '\n'.join(imports) + '\n'

# CONTROLLERS (functions are namespaced by "view_" to avoid name collisions with models or anything else)

  @staticmethod
  def generate_controller_for_page(page):
    """For a single page, generate the controller function which will be executed.
         Should include the declaration, queries, and render the write template."""
    # function declaration
    url_data_params = [ u.lower() + '_id' for u in page.url_data ] # User => user_id
    function = "def view_{}(request{}):\n".format(page.name, [ ', ' + u for u in url_data_params ])

    # setup the context, start with the url data, if it was passed
    function += "  page_context = {}\n"
    for i, (model_name, param_name) in enumerate(zip(page.url_data, url_data_params)):
      function += "  page_context['url_q{}'] = get_object_or_404({}, pk={})\n".format(i, model_name, param_name)

    # now do the queries
    for i, q in enumerate(page.queries):
      function += "  page_context['q{}'] = {}\n".format(i, q)

    # and render the right template
    function += "  return render(request, '{}/{}.html', page_context)\n".format(APP_NAME, page.name)

    return function

  def views_py_as_string(self):
    """Generate views.py, including imports and a view function for each page."""
    filestring = "from django.http import HttpResponse, HttpRequest\n"+
                 "from django.contrib.auth.decorators import login_required\n"+
                 "from django.views.decorators.http import require_GET, require_POST\n"+
                 "from django.utils import simplejson\n"+
                 "from django.shortcuts import redirect, render, get_object_or_404\n"
    filestring += model_imports()
    filestring += '\n\n'.join([ generate_view_code(p) for p in self.app.pages ])
    return filestring

  def view_imports(self):
    """Imports required for the views."""
    s = ''
    for p in self.app.pages:
      s += 'from {}.views import view_{}\n'.format(APP_NAME, p.name)

    return s

# ROUTES/URLS

  @staticmethod
  def generate_url_entry(page):
    entry = "url(r'{}', '{}.views.view_{}'),".format(url_parts_to_regex(self.url_parts), APP_NAME, self.name)
    return entry

  def urls_py_as_string(self):
    urls_string = 'from django.conf.urls import patterns, include, url\n'
    urls_string += 'urlpatterns = patterns('',\n'+
                   "  url(r'', include('social_auth.urls')),\n"+
                   "  url(r'^login/$', 'django.contrib.auth.views.login' ),\n"+
                   "  url(r'^logout/$', 'django.contrib.auth.views.logout'),\n"
    for p in self.app.pages:
      urls_string += '  {}\n'.format(generate_url_entry(p))
    urls_string += ')'
    return urls_string

# TEMPLATES

  @staticmethod
  def generate_template_code(page):
    """Given a page, return the template code"""
    return "<html><body>YOLO this page name is {}. Please implement this function.</body></html>".format(page.name)

  def templates_as_strings(self):
    """Return a list of tuples: (filename, template content)"""
    kilter = [] # yes this is intentionally a bad variable name.
    for p in self.app.pages:
      twoplee = ('{}.html'.format(APP_NAME, p.name), generate_template_code(p))
      kilter.append(twoplee)
    return kilter

# WRITE THE WHOLE THING

  def write(self, STARTER_CODE_PATH="/Users/kssworld93/Projects/v1factory/app_builder/codegen/starter", dest=None):
    if dest is None:
      # create a temporary working directory
      dest = join(tempfile.mkdtemp(), "djanggggg")

    # clone the starter code
    copytree(STARTER_CODE_PATH, dest)

    # create inner app directory to hold models and views
    inner_app_dir = join(dest, APP_NAME)
    os.makedirs(inner_app_dir)
    init_py = open(join(inner_app_dir, "__init__.py"), "w").write("# ;)").close()

    # write urls
    urls_file = open(join(inner_app_dir, "urls.py"), "w")
    urls_file.write(self.urls_py_as_string())
    urls_file.close()

    # write models file
    models_file = open(join(inner_app_dir, "models.py"), "w")
    models_file.write(self.models_py_as_string())
    models_file.close()

    # write views file
    views_file = open(join(inner_app_dir, "views.py"), "w")
    views_file.write(self.views_py_as_string())
    views_file.close()

    # make templates directory and write templates files
    templates_dir = join(dest, os.path.normpath("templates"))
    if not os.path.exists(templates_dir):
      os.makedirs(templates_dir)
    for fname, content in self.templates_as_strings():
      template_file = open(join(templates_dir, "%s.html" % template.name), "w")
      template_file.write(content)
      template_file.close()

    return dest
