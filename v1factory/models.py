from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
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
        "name":"registration",
        "design_props" : null,
        "uielements": [
          {
            "lib_id":4,
            "attribs": {},
            "tagName": "h1",
            "content":{ "text": "Sign Up" },
            "container_info":null,
            "layout" : {
              "width"  :12,
              "height" :8,
              "top"    :12,
              "left"   :12
            }
          },
          {
            "lib_id":7,
            "attribs": {},
            "content":{},
            "layout" : {
              "width"  :16,
              "height" :16,
              "top"    :1,
              "left"   :1
            },
            "container_info": {
              "entity":"User",
              "action":"signup"
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
            "container_info":null,
            "attribs":{},
            "tagName" : "h1",
            "content":{ "text":"Homepage" },
            "layout" : {
              "width"  :4,
              "height" :4,
              "top"    :1,
              "left"   :1
            }
          },
          {
            "lib_id":7,
            "attribs":{},
            "content":{},
            "layout" : {
              "width"  :4,
              "height" :4,
              "top"    :1,
              "left"   :1
            },
            "container_info":{
              "entity":"User",
              "action":"login"
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
        "page_name":"registration",
        "urlparts":["register"]
      }
    ]
}"""

class App(models.Model):
  name = models.CharField(max_length=100)
  owner = models.ForeignKey(User, related_name='apps')
  _state_json = models.TextField(blank=True, default=starter_app)
  _uie_state_json = models.TextField(blank=True, default=starter_app)

  @property
  def state(self):
    return simplejson.loads(self._state_json)

  @property
  def state_json(self):
    return self._state_json

  @property
  def uie_state(self):
    return simplejson.loads(self._uie_state_json)

  @property
  def uie_state_json(self):
    return self._uie_state_json

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
    try:
      simplejson.loads(self._uie_state_json)
    except simplejson.JSONDecodeError, e:
      raise ValidationError(e.msg)

  def summary_user_settings(self):
    """Human-readable summary of the user settings"""
    summary = ""
    summary += "Enabled auth modes:\t{};".format(", ".join([a for a,v in self.state['users'].items() if v]))
    return summary

  def summary_entities(self):
    """Human-readable summary of the entities"""
    summary = ""
    summary += "Entities:\t\t{};".format(", ".join([e['name'] for e in self.state['entities']]))
    return summary

  def summary_pages(self):
    """Human-readable summary of the pages"""
    summary = ""
    summary += "Pages:\t\t\t{};".format(", ".join(['("{}", {})'.format(u['page_name'], u['urlparts']) for u in self.state['urls']]))
    return summary

  def deploy(self):
    return "do the funky chicken"
    import sys, os
    import traceback
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

  def deploy_test(self):
    return "do the funky chicken"
    analyzed_app = AnalyzedApp(self.state, self.name)
    django_writer = DjangoWriter(analyzed_app)

    ### Also want to print:
    #     user settings
    #     entities
    #     urls/pages
    print "\n".join([ self.summary_user_settings(),
                      self.summary_entities(),
                      self.summary_pages() ])
    ###

    def print_test(heading, test_output_fun):
      import sys, traceback
      print "\n\n\n", 17*"#", 7*" ", heading, 7*" ", 17*"#"
      try:
        test_output = test_output_fun()
      except Exception:
        traceback.print_exc(file=sys.stdout)
      else:
        print "\n".join([ "> " + line for line in test_output.split('\n') ])
      print 17*"#", 7*" ", "END", 7*" ", 17*"#"

    print_test("urls.py", django_writer.urls_py_as_string)
    print_test("models.py", django_writer.models_py_as_string)
    print_test("model_forms.py", django_writer.model_forms_py_as_string)
    print_test("views.py", django_writer.views_py_as_string)
    print_test("form_receivers.py", django_writer.form_receivers_py_as_string)
    print_test("templates", lambda: "\n\nNEXT:\n".join([t[1] for t in django_writer.templates_as_strings()]))

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
