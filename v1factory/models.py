from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.conf import settings
import simplejson
import re
from django.core.exceptions import ValidationError
import os.path
import requests

DEFAULT_STATE_DIR = os.path.join(os.path.dirname(__file__), os.path.normpath("default_state"))

def get_default_uie_state():
  f = open(os.path.join(DEFAULT_STATE_DIR, "uie_state.json"))
  s = f.read()
  simplejson.loads(s) # makes sure it's actually valid
  f.close()
  return s

def get_default_app_state():
  f = open(os.path.join(DEFAULT_STATE_DIR, "app_state.json"))
  s = f.read()
  simplejson.loads(s) # makes sure it's actually valid
  f.close()
  return s


class App(models.Model):
  name = models.CharField(max_length=100, unique=True)
  owner = models.ForeignKey(User, related_name='apps')
  _state_json = models.TextField(blank=True, default=get_default_app_state)
  _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)

  def get_state(self):
    return simplejson.loads(self._state_json)

  def set_state(self, val):
    self._state_json = simplejson.dumps(val)

  state = property(get_state, set_state)

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

  def write_to_tmpdir(self):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    a = AnalyzedApp(self.state)
    dw = analyzed_app_to_app_components(a)
    tmp_project_dir = DjangoAppWriter(dw, simplejson.loads(self.uie_state_json)).write_to_fs()

    return tmp_project_dir

  def subdomain(self):
    subdomain = self.owner.username.lower() + "-" + self.name.lower()
    if not settings.PRODUCTION or settings.STAGING:
      subdomain = "dev-" + subdomain # try to avoid name collisions with production apps
      subdomain = subdomain + '.staging'
    return subdomain

  def deploy(self):
    # this will post the data to v1factory.com
    subdomain = self.subdomain()
    post_data = {
                 "subdomain": subdomain,
                 "app_json": self.state_json,
                 "uie_json": self.uie_state_json,
                 "user_info": simplejson.dumps({ "username" : "placeholder" }),
                 "deploy_secret": "v1factory rocks!"
                }
    # deploy to the staging server unless this is the production server.
    if settings.PRODUCTION and not settings.STAGING:
      r = requests.post("http://v1factory.com/deployment/push/", data=post_data, headers={"X-Requested-With":"XMLHttpRequest"})
    else:
      r = requests.post("http://staging.v1factory.com/deployment/push/", data=post_data, headers={"X-Requested-With":"XMLHttpRequest"})

    if r.status_code == 200:
      return "http://%s.v1factory.com" % subdomain
    else:
      raise Exception(r.content)

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

  def delete(self, *args, **kwargs):
    try:
      post_data = {"subdomain": self.subdomain()}
      r = requests.post("http://v1factory.com/deployment/delete/", post_data)
    except Exception:
      print "Warning: could not reach v1factory server."
    else:
      if r.status_code != 200:
        print "Error: v1factory could not delete the deployment. Plz do it manually."
    finally:
      super(App, self).delete(*args, **kwargs)

class UIElement(models.Model):
  """Describes the UIElement. If app is none, this belongs to the Library."""
  app = models.ForeignKey(App, blank=True, null=True, default=None)
  name = models.CharField(max_length=100)
  class_name = models.CharField(max_length=100)
  html = models.TextField()
  css = models.TextField()
  tagname = models.CharField(max_length=100)

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


class UITheme(models.Model):
  name = models.CharField(max_length=255, blank=True)
  designer = models.ForeignKey(User, blank=True, null=True)
  parent_theme = models.ForeignKey('self', blank=True, null=True, default=None)

  _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)

  #Audit field
  created_on = models.DateTimeField(auto_now_add = True)
  updated_on = models.DateTimeField(auto_now = True)

  def get_state(self):
    return simplejson.loads(self._uie_state_json)

  def set_state(self, val):
    self._uie_state_json = simplejson.dumps(val)

  uie_state = property(get_state, set_state)

  def to_dict(self):
    return { 'id' : self.id,
             'name' : self.name,
             'designer' : User.objects.values().get(pk=self.designer_id),
             'statics' : self.statics.values(),
             'uie_state' : self.uie_state }

  def clone(self, user=None):
    new_self = UITheme(name=self.name,
                       _uie_state_json=self._uie_state_json,
                       parent_theme=self,
                       designer=user)
    return new_self


class StaticFile(models.Model):
  name = models.CharField(max_length=255)
  url = models.TextField()
  type = models.CharField(max_length=100)
  app = models.ForeignKey(App, blank=True, null=True, related_name="statics")
  theme = models.ForeignKey(UITheme, blank=True, null=True, related_name="statics")
