from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from app_builder.models import Class, Template, Route
from app_builder.codegen import AnalyzedApp
from app_builder.codegen.writers import DjangoWriter
import simplejson
import re

starter_app = """{
    "name":"name me pls",
    "users": {
        "facebook":false,
        "linkedin":false,
        "twitter":false,
        "local":true,
        "fields":[]
    },
    "entities":[],
    "pages":[{
                "name":"login",
                "uielements":[{
                                    "lib-id":4,
                                    "context":{"text":"Login"},
                                    "container-info":null
                            },{
                                    "lib-id":7,
                                    "context":{"text":""},
                                    "container-info":{
                                        "entity":"Session",
                                        "action":"create",
                                        "elements":[{
                                                        "lib-id":8,
                                                        "field-name":"username",
                                                        "context":{"text":"",
                                                                    "field_name":"username"},
                                                        "container-info":null
                                                    },{
                                                        "lib-id":8,
                                                        "field-name":"password",
                                                        "context":{"text":"",
                                                                    "field_name":"password"},
                                                        "container-info":null
                                                    },{
                                                        "lib-id":10,
                                                        "context":{"text":"submit"},
                                                        "container-info":null
                                                    }]
                                    }
                }],
                "access-level":"all"
            },{
                "name":"registration",
                "uielements":[{
                                    "lib-id":4,
                                    "context":{"text":"Sign Up"},
                                    "container-info":null
                            },{
                                    "lib-id":7,
                                    "context":{"text":""},
                                    "container-info":{
                                        "entity":"User",
                                        "action":"create",
                                        "elements":[{
                                                        "lib-id":8,
                                                        "field-name":"username",
                                                        "context":{"text":"Username",
                                                                    "field_name":"username"},
                                                        "container-info":null
                                                    },{
                                                        "lib-id":8,
                                                        "field-name":"password",
                                                        "context":{"text":"Password",
                                                                    "field_name":"password"},
                                                        "container-info":null
                                                    },{
                                                        "lib-id":8,
                                                        "field-name":"email",
                                                        "context":{"text":"Email Address",
                                                                    "field_name":"email"},
                                                        "container-info":null
                                                    },{
                                                        "lib-id":10,
                                                        "context":{"text":"Register"},
                                                        "container-info":null
                                                    }]
                                    }
                }],
                "access-level":"all"
            },{
                "name":"homepage",
                "uielements": [{
                                    "lib-id":4,
                                    "context":{"text":"Homepage"},
                                    "container-info":null
                                }],
                "access-level": "all"
            }],
        "urls":[{
                    "page_name":"homepage",
                    "urlparts":[]
                },{
                    "page_name":"login",
                    "urlparts":["login"]
                },{
                    "page_name":"registration",
                    "urlparts":["register"]
                }]
}"""

class App(models.Model):
  name = models.CharField(max_length=100)
  owner = models.ForeignKey(User, related_name='apps')
  _state_json = models.TextField(blank=True, default=starter_app)

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

  def clean(self):
    try:
      simplejson.loads(self._state_json)
    except simplejson.JSONDecodeError, e:
      raise ValidationError(e.msg)


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
    commands.append('heroku run python manage.py syncdb')
    for c in commands:
      print "Running `{}`".format(c)
      subprocess.call(c.split(' '), cwd=tmp_project_dir, env=os.environ.copy(), stdout=sys.stdout, stderr=sys.stderr)
    return tmp_project_dir

class UIElement(models.Model):
  app = models.ForeignKey(App, blank=True, null=True, default=None)
  name = models.CharField(max_length=100)
  class_name = models.CharField(max_length=100)
  html = models.TextField()
  css = models.TextField()
  type = models.CharField(max_length=100) # later on, introduce choices here

  _login_form_templ = """<form class="login" method="POST" action="{% url 'account_login' %}">
  {% csrf_token %}
  <h2>Login</h2>
  {}{}{}
  <p><input type="text" name="username" placeholder="Username" /></p>
  <p><input type="password" name="password" placeholder="Password" /></p>
  <button class="primaryAction" type="submit">Sign In</button>
</form>"""

  @staticmethod
  def get_login_form(twitter="", linkedin="", facebook=""):
    """Create login, the strings passed in represent the auth url"""

    def buttonify(provider_name):
      social_login_btn = "<a href=\"{}\"><img src=\"{}\" /></a>"
      if len(provider_name) > 0:
        return social_login_btn.format(provider_name, "{{ STATIC_URL }}images/icon_%s.png" % provider_name)
      else:
        return ""

    twitter = buttonify(twitter)
    linkedin = buttonify(linkedin)
    facebook = buttonify(facebook)

    return _login_form_templ.format(facebook, twitter, linkedin)

  @classmethod
  def get_library(cls):
    return cls.objects.filter(app=None)

  context_regex = re.compile(r'<%= (.+) %>')

  def get_required_context(self):
    context_names = re.findall(context_regex, self.lib_el.html)
    return context_names

class StaticFile(models.Model):
  name = models.CharField(max_length=255)
  url = models.TextField()
  type = models.CharField(max_length=100)
  app = models.ForeignKey(App)
