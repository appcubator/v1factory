from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from app_builder.models import Class, Template, Route
from app_builder.codegen import AnalyzedApp
from app_builder.codegen.writers import DjangoWriter
import simplejson
import re

starter_app = """{
    "name":"EasyApp",
    "users": {
      "facebook":false,
      "linkedin":false,
      "twitter":false,
      "local":true,
      "fields":[]
    },
    "entities":[],
    "pages":[
      {
        "name":"login",
        "design_props" : null,
        "uielements":[
          {
            "lib_id":4,
            "text":"Login",
            "attrib":{},
            "container_info":null,
            "layout": {
              "width"  :4,
              "height" :4,
              "top"    :1,
              "left"   :1
            }
          },
          {
            "lib_id":7,
            "attrib":{},
            "layout" : {
              "width"  :4,
              "height" :4,
              "top"    :1,
              "left"   :1
            },
            "container_info":{
            "entity":"Session",
            "action":"create",
            "uielements":[
              {
                "lib_id":8,
                "attrib" : {
                  "placeholder":"Username",
                  "name":"username",
                  "type":"text"
                },
                "layout" : {
                  "width"  :4,
                  "height" :4,
                  "top"    :1,
                  "left"   :1
                },
                "field_name":"username",
                "container_info":null
              },
              {
                "lib_id":8,
                "attrib" : {
                  "placeholder":"Password",
                  "name":"password",
                  "type":"password"
                },
                "layout" : {
                  "width"  :4,
                  "height" :4,
                  "top"    :1,
                  "left"   :1
                },
                "container_info":null
              },
              {
                "lib_id":10,
                "text": "Login",
                "attrib" : {
                  "type":"submit"
                },
                "layout" : {
                  "width"  :4,
                  "height" :4,
                  "top"    :1,
                  "left"   :1
                },
                "container_info":null
              }
            ]
          }
          }
        ],
        "access_level" : "all"
      },
      {
        "name":"registration",
        "design_props" : null,
        "layout" : {
          "width"  :4,
          "height" :4,
          "top"    :1,
          "left"   :1
        },
        "uielements": [
          {
            "lib_id":4,
            "text": "Sign Up",
            "attrib": {},
            "container_info":null,
            "layout" : {
              "width"  :4,
              "height" :4,
              "top"    :1,
              "left"   :1
            }
          },
          {
            "lib_id":7,
            "attrib": {},
            "layout" : {
              "width"  :4,
              "height" :4,
              "top"    :1,
              "left"   :1
            },
            "container_info": {
              "entity":"User",
              "action":"create",
              "uielements":[
                {
                  "lib_id":8,
                  "attrib": {
                    "name":"username",
                    "placeholder":"Username",
                    "type":"text"
                  },
                  "container_info":null,
                  "layout" : {
                    "width"  :4,
                    "height" :4,
                    "top"    :1,
                    "left"   :1
                  }
                },
                {
                  "lib_id":8,
                  "attrib" : {
                    "placeholder":"Password",
                    "name":"password",
                    "type":"password"
                  },
                  "container_info":null,
                  "layout" : {
                    "height" :4,
                    "top"    :1,
                    "left"   :1,
                    "width"  :4
                  }
                },
                {
                  "lib_id":8,
                  "attrib" : {
                    "placeholder":"Email",
                    "name":"email",
                    "type":"text"
                  },
                  "container_info":null,
                  "layout": {
                    "width"  :4,
                    "height" :4,
                    "top"    :1,
                    "left"   :1
                  }
                },
                {
                  "lib_id":10,
                  "text":"Continue",
                  "attrib" : {
                    "type":"submit"
                  },
                  "container_info":null,
                  "layout" : {
                    "height" :4,
                    "top"    :1,
                    "left"   :1,
                    "width"  :4
                  }
                }
              ]
            }
          }
        ],
        "access_level":"all"
      },
      {
        "name":"homepage",
        "design_props" : [],
        "uielements": [
          {
            "lib_id":4,
            "text":"Homepage",
            "container_info":null,
            "attrib":{},
            "layout" : {
              "width"  :4,
              "height" :4,
              "top"    :1,
              "left"   :1
            }
          }
        ],
        "access_level": "all"
      }
    ],
    "urls": [
      {
        "page_name":"homepage",
        "urlparts":[]
      },
      {
        "page_name":"login",
        "urlparts":["login"]
      },
      {
        "page_name":"registration",
        "urlparts":["register"]
      }
    ]
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
  """Describes the UIElement. If app is none, this belongs to the Library."""
  app = models.ForeignKey(App, blank=True, null=True, default=None)
  name = models.CharField(max_length=100)
  class_name = models.CharField(max_length=100)
  html = models.TextField()
  css = models.TextField()
  tagname = models.CharField(max_length=100)

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
