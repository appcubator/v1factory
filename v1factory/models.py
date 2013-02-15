from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from app_builder.models import Class, Template
from app_builder.codegen.django import create_django_project

class App(models.Model):
  name = models.CharField(max_length=100)
  owner = models.ForeignKey(User, related_name='apps')

  classes = models.ManyToManyField(Class, related_name="+")
  templates = models.ManyToManyField(Template, related_name="+")

  def get_absolute_url(self):
    return reverse('v1factory.views.app_page', args=[str(self.id)])

  def deploy(self):
    import sys, os
    import subprocess
    tmp_project_dir = create_django_project(self.classes.all(), self.templates.all())
    print tmp_project_dir
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
