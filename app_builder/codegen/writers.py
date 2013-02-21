import sys
import tempfile
from shutil import copytree
from os.path import join
import os.path
import os

from . import *

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
    if f['type'] in DjangoWriter.mf_map:
      return  '{} = models.{}Field()\n'.format(f['name'], DjangoWriter.mf_map[f['type']])
    elif f['type'] in [ cls['name'] for cls in self.app.classes ]:
      return '{} = models.ForegnKey({})\n'.format(f['name'], f['type'])
    else:
      print "Error, field {}:{} not a primitive type nor a model name".format(f['name'], f['type'])
      sys.exit() # XXX raise an exception instead.

  def models_py_as_string(self):
    """Given the entities of the app and their attributes, return the models.py file as a string."""
    generic_imports = "from django.contrib.auth.models import User\n"
    generic_imports += "from django.db import models\n"

    # first put the import statements
    file_string = generic_imports

    # for each entity, declare a class and write the fields.
    for m in self.app.classes:
      file_string += 'class {}(models.Model):\n'.format(m['name'])
      for f in m['fields']:
        # go in an indent level
        file_string += '  ' + DjangoWriter.code_for_field(f)

    return file_string

  def model_imports(self):
    imports = []
    imports.append("from django.contrib.auth.models import User")
    for m in self.app.classes:
      imports.append('from {}.models import {}'.format(APP_NAME, m['name']))
    return '\n'.join(imports) + '\n'

# MODEL FORMS (form details, used as a base for form submission)

  @staticmethod
  def generate_model_form_code(form):
    form_string = ''
    form_string += 'class {}Form{}(ModelForm):\n'.format(form.entity, form.form_id)
    form_string += '  class Meta:\n'
    form_string += '    model = {}\n'.format(form.entity)
    fields_params = ' '.join([ "'{}',".format(f) for f in form.included_fields])
    form_string += '    fields = ({})\n'.format(fields_params)
    return form_string

  def model_forms_py_as_string(self):
    """Given knowledge of all the forms, return the models.py file as a string."""
    filestring = ''
    filestring += 'from django.forms import ModelForm\n'
    for f in self.app.forms:
      filestring += '\n' + DjangoWriter.generate_form_code(f)
    return filestring

  def model_form_imports(self):
    imports = []
    for f in self.app.forms:
      imports.append('from {}.model_forms import {}Form{}'.format(APP_NAME, f.entity, f.form_id))
    return '\n'.join(imports)

# FORM RECEIVERS (to capture the POSTS and save the object, or return validation errors)

  @staticmethod
  def generate_form_receiver(form):
    filestring = ''
    filestring += '@require_POST\n'
    filestring += 'def save_{}Form{}(request):\n'.format(form.entity, form.form_id)
    filestring += '  new_form = {}Form{}(request.POST)\n'.format(form.entity, form.form_id)
    filestring += '  if new_form.is_valid():\n'
    filestring += '    obj = new_form.save()\n'
    filestring += '    return HttpResponse("OK")\n'
    filestring += '  else:\n'
    filestring += '    return HttpResponse(simplejson.dumps({ "errors" : [(k, v[0].__unicode__()) for k, v in new_form.errors.items()] }), status=400)\n'
    return filestring

  def form_receivers_py_as_string(self):
    filestring = "from django.http import HttpResponse\n"
    filestring+= "from django.contrib.auth.decorators import login_required\n"
    filestring+= "from django.views.decorators.http import require_GET, require_POST\n"
    filestring+= "from django.utils import simplejson\n"
    filestring+= "from django.shortcuts import redirect, render, get_object_or_404\n\n"
    filestring+= self.model_form_imports() + '\n\n' 

    for f in self.app.forms:
      filestring += '\n'+ DjangoWriter.generate_form_receiver(f)
    return filestring

# CONTROLLERS (functions are namespaced by "view_" to avoid name collisions with models or anything else)

  @staticmethod
  def generate_controller_for_page(page):
    """For a single page, generate the controller function which will be executed.
         Should include the declaration, queries, and render the write template."""
    # function declaration
    url_data_params = [ u.lower() + '_id' for u in page.url_data ] # User => user_id
    function = "@require_GET"
    function += "def view_{}(request{}):\n".format(page.name, ''.join([ ', ' + u for u in url_data_params ]))

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
    filestring = "from django.http import HttpResponse, HttpRequest\n"
    filestring+= "from django.contrib.auth.decorators import login_required\n"
    filestring+= "from django.views.decorators.http import require_GET, require_POST\n"
    filestring+= "from django.utils import simplejson\n"
    filestring+= "from django.shortcuts import redirect, render, get_object_or_404\n"
    filestring += self.model_imports()
    filestring += '\n\n'.join([ DjangoWriter.generate_controller_for_page(p) for p in self.app.pages ])
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
    entry = "url(r'{}', '{}.views.view_{}'),".format(url_parts_to_regex(page.url_parts), APP_NAME, page.name)
    return entry

  def generate_form_url_entry(form):
    entry = "url(r'^formsubmit/{}/{}/$, '{}.form_receivers.save_{}Form{}'),".format(form.entity, form.form_id, APP_NAME, form.entity, form.form_id)

  def urls_py_as_string(self):
    urls_string = 'from django.conf.urls import patterns, include, url\n'
    urls_string += "urlpatterns = patterns('',\n"
    urls_string += "  url(r'', include('social_auth.urls')),\n"
    urls_string += "  url(r'^login/$', 'django.contrib.auth.views.login' ),\n"
    urls_string += "  url(r'^logout/$', 'django.contrib.auth.views.logout'),\n"
    for p in self.app.pages:
      urls_string += '  {}\n'.format(DjangoWriter.generate_url_entry(p))
    urls_string += '\n'
    for f in self.app.forms:
      urls_string += '  {}\n'.format(DjangoWriter.generate_form_url_entry(f))
    urls_string += ')'
    return urls_string

# TEMPLATES

  @staticmethod
  def generate_template_code(page):
    """Given a page, return the template code"""
# in the future, add template variable names
    return page.to_html()

  def templates_as_strings(self):
    """Return a list of tuples: (filename, template content)"""
    kilter = [] # yes this is intentionally a bad variable name.
    for p in self.app.pages:
      twoplee = ('{}.html'.format(p.name), DjangoWriter.generate_template_code(p))
      kilter.append(twoplee)
    return kilter

# WRITE THE WHOLE THING

  def write(self, STARTER_CODE_PATH="/Users/kssworld93/Projects/v1factory/app_builder/codegen/starter", dest=None):
    print AnalyzedApp.__name__
    if dest is None:
      # create a temporary working directory
      dest = join(tempfile.mkdtemp(), "djanggggg")

    # clone the starter code
    copytree(STARTER_CODE_PATH, dest)

    # create inner app directory to hold models and views
    inner_app_dir = join(dest, APP_NAME)
    if not os.path.exists(inner_app_dir):
      os.makedirs(inner_app_dir)
    init_py = open(join(inner_app_dir, "__init__.py"), "w")
    init_py.write("# ;)")
    init_py.close()

    # write urls
    urls_file = open(join(dest, "urls.py"), "w")
    urls_file.write(self.urls_py_as_string())
    urls_file.close()

    # write models file
    models_file = open(join(inner_app_dir, "models.py"), "w")
    models_file.write(self.models_py_as_string())
    models_file.close()

    # write model forms file
    views_file = open(join(inner_app_dir, "model_forms.py"), "w")
    views_file.write(self.model_forms_py_as_string())
    views_file.close()

    # write form receivers file
    views_file = open(join(inner_app_dir, "form_receivers.py"), "w")
    views_file.write(self.form_receivers_py_as_string())
    views_file.close()

    # write views file
    views_file = open(join(inner_app_dir, "views.py"), "w")
    views_file.write(self.views_py_as_string())
    views_file.close()

    # make templates directory and write templates files
    templates_dir = join(dest, os.path.normpath("templates"))
    if not os.path.exists(templates_dir):
      os.makedirs(templates_dir)
    for fname, content in self.templates_as_strings():
      template_file = open(join(templates_dir, APP_NAME, fname), "w")
      template_file.write(content)
      template_file.close()

    return dest
