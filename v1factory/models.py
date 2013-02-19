from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from app_builder.models import Class, Template, Route
from app_builder.codegen import AnalyzedApp
from app_builder.codegen.writers import DjangoWriter
import simplejson

class App(models.Model):
  name = models.CharField(max_length=100)
  owner = models.ForeignKey(User, related_name='apps')
  _state_json = models.TextField(blank=True, default='{}')

  @property
  def state(self):
    return simplejson.loads(self._state_json)

  @property
  def state_json(self):
    return self._state_json

  @property
  def entities(self):
    return self.state['entities']

  @property
  def pages(self):
    return self.state['pages']

  @property
  def urls(self):
    return self.state['urls']

  def get_absolute_url(self):
    return reverse('v1factory.views.app_page', args=[str(self.id)])

  def deploy(self):
    import sys, os
    import subprocess

    analyzed_app = AnalyzedApp(self.state, self.name)
    django_writer = DjangoWriter(analyzed_app)
    tmp_project_dir = django_writer.write()

    commands = []
    commands.append('git init')
    commands.append('git add .')
    commands.append('git commit -m "deploy"')
    commands.append('heroku keys:add')
    commands.append('git remote add heroku git@heroku.com:warm-reaches-8765.git')
    commands.append('git push -f heroku master')
    for c in commands:
      print "Running `{}`".format(c)
      subprocess.call(c.split(' '), cwd=tmp_project_dir, env=os.environ.copy(), stdout=sys.stdout, stderr=sys.stderr)
    return tmp_project_dir

class AbstractUIElement(models.Model):
  name = models.CharField(max_length=100)
  html = models.TextField()
  css = models.TextField(blank=True)

  class Meta:
    abstract=True

class LibUIElement(AbstractUIElement):
  pass

class UIElement(AbstractUIElement):
  src_lib_element = models.ForeignKey(LibUIElement)
  user = models.ForeignKey(User)
