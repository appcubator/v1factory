import sys
import tempfile
from subprocess import call
from shutil import copytree
from os.path import join
import os.path
import os



def generate_models_py(classes, INDENT_STR="  "):
  file_string = ''
  file_string += '### AUTOGENERATED by v1Factory ###\n\n'
  file_string += 'from django.db import models\n'
  mf_map = {'text' : 'Text',
            'number' : 'Float',
            'date' : 'DateTime',
            'email' : 'Email',}

  for m in classes:
    file_string += '\nclass {}(models.Model):\n'.format(m.name)
    for f in m.attributes.all():
      if f.type in mf_map:
        file_string += '{}{} = models.{}Field()\n'.format(INDENT_STR, f.name, mf_map[f.type])
      elif f.type in [ cls.name for cls in classes ]:
        file_string += '{}{} = models.ForegnKey({})\n'.format(INDENT_STR, f.name, f.type)
        pass
      else:
        print "Error, field {}:{} not a primitive type nor a model name".format(f.name, f.type)
        sys.exit()

  return file_string

def generate_urls_py(classes, templates):
  urls_string = ''
  urls_string += '### AUTOGENERATED by v1Factory ###\n\n'
  urls_string += 'from django.conf.urls import patterns, include, url\n'
  urls_string += """from django.conf.urls import patterns, include, url
from django.views.generic import RedirectView
from django.views.generic.list import ListView
from django.views.generic.edit import CreateView
from django.forms import ModelForm
from django.contrib.auth.models import User
"""
  for m in classes:
    for urls_string += 'from twitter.models import {}\n'.format(m.name)

  # begin urls section
  urls_string += "urlpatterns = patterns('django.views.generic.simple',\n"
  for tmp in templates:
    # parse the elements to see which queries are required.
  	urls_string += "  url(r'^%s$', 'direct_to_template', { 'template': '%s.html'}),\n" % (tmp.name, tmp.name)
  # end urls section
  urls_string += ")"
  return urls_string

def generate_templates(templates):
  template_strings = []
  for tmp in templates:
    # html render engine
    template_strings.append(tmp.render_to_html())
  return template_strings

class AnalyzedApp:
  def __init__(self, classes, templates, app_name):
    self.name = app_name
    self.classes = classes
    self.templates = templates

    # in the future, do some analysis to reduce the amount of code generated 


def create_django_project(classes, templates, STARTER_CODE_PATH="/Users/kssworld93/Projects/v1factory/app_builder/codegen/starter"):
  # create a temporary working directory
  tmpdir = join(tempfile.mkdtemp(), "djanggggg")
  # clone the starter code
  copytree(STARTER_CODE_PATH, tmpdir)

  analyzed_app = AnalyzedApp(classes=classes, templates=templates)

  # write urls
  urls_file = open(join(tmpdir, "urls.py"), "w")
  urls_file.write(generate_urls_py(analyzed_app))
  urls_file.close()
  # write models file
  models_file = open(join(tmpdir, "models.py"), "w")
  models_file.write(generate_models_py(analyzed_app))
  models_file.close()
  # make templates directory and write templates files
  templates_dir = join(tmpdir, os.path.normpath("templates"))
  if not os.path.exists(templates_dir):
    os.makedirs(templates_dir)
  for template in templates:
    template_file = open(join(templates_dir, "%s.html" % template.name), "w")
    template_file.write(template.html)
    template_file.close()

  return tmpdir
