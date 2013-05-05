from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError

import os.path
import re
import requests
import simplejson

DEFAULT_STATE_DIR = os.path.join(os.path.dirname(__file__), os.path.normpath("default_state"))

def get_default_data(filename):
  f = open(os.path.join(DEFAULT_STATE_DIR, filename))
  s = f.read()
  simplejson.loads(s) # makes sure it's actually valid
  f.close()
  return s

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

def get_default_theme_state():
  f = open(os.path.join(DEFAULT_STATE_DIR, "flat_ui_theme.json"))
  s = f.read()
  simplejson.loads(s) # makes sure it's actually valid
  f.close()
  return s


class App(models.Model):
  name = models.CharField(max_length=100)
  owner = models.ForeignKey(User, related_name='apps')

  subdomain = models.CharField(max_length=50, blank=True)

  _state_json = models.TextField(blank=True, default=get_default_app_state)
  _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)

  def save(self, *args, **kwargs):
    if self.subdomain == "":
      self.subdomain = self.u_name()
    return super(App, self).save(*args, **kwargs)

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

  def write_to_tmpdir(self, d_user):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    a = AnalyzedApp(self.state)
    dw = analyzed_app_to_app_components(a, d_user)
    tmp_project_dir = DjangoAppWriter(dw, self.css()).write_to_fs()

    return tmp_project_dir

  def u_name(self):
    """Used to be the way we generate subdomains, but now it's just a function
    that almost always returns a unique name for this app"""
    u_name = self.owner.username.lower() + "-" + self.name.replace(" ", "-").lower()
    if not settings.PRODUCTION or settings.STAGING:
      u_name = u_name + '.staging'
      if not settings.STAGING:
        u_name = "dev-" + u_name
    return u_name

  def url(self):
    return "http://%s.appcubator.com/" % self.subdomain

  def github_url(self):
    return "https://github.com/v1factory/" + self.u_name()

  def css(self, deploy=True):
    """Use uiestate, less, and django templates to generate a string of the CSS"""
    from django.template import Context, loader
    t = loader.get_template('app-editor-less-gen.html')
    context = Context({"app":self, "deploy":deploy})
    css_string = t.render(context)
    return css_string

  def deploy(self, d_user):
    # this will post the data to appcubator.com
    post_data = {
                 "u_name": self.u_name(),
                 "subdomain": self.subdomain,
                 "app_json": self.state_json,
                 "css": self.css(),
                 "d_user" : simplejson.dumps(d_user),
                 "deploy_secret": "v1factory rocks!"
                }
    # deploy to the staging server unless this is the production server.
    if settings.PRODUCTION and not settings.STAGING:
      r = requests.post("http://appcubator.com/deployment/push/", data=post_data, headers={"X-Requested-With":"XMLHttpRequest"})
    else:
      r = requests.post("http://staging.appcubator.com/deployment/push/", data=post_data, headers={"X-Requested-With":"XMLHttpRequest"})

    if r.status_code == 200:
      return "http://%s.appcubator.com" % self.subdomain
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
      post_data = {"u_name": self.u_name()}
      if settings.STAGING:
        r = requests.post("http://staging.appcubator.com/deployment/delete/", post_data)
      elif settings.PRODUCTION:
        r = requests.post("http://appcubator.com/deployment/delete/", post_data)
      else:
        raise Exception("")

    except Exception:
      print "Warning: could not reach appcubator server."
    else:
      if r.status_code != 200:
        print "Error: appcubator could not delete the deployment. Plz do it manually."
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
    try:
      designer = User.objects.get(pk=self.designer_id).username,
    except User.DoesNotExist:
      designer = 'v1 Factory'


    return { 'id' : self.id,
             'name' : self.name,
             'designer' : designer,
             'statics' : simplejson.dumps(list(self.statics.values())),
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

# Used to keep track of any of our APIs usage.
# Count is incremented on each successful use.
class ApiKeyCounts(models.Model):
  api_key = models.CharField(max_length=255)
  api_count = models.IntegerField(default=0)

# Keeps track of individual usages, so we can do time based
# control and analytics later on.
class ApiKeyUses(models.Model):
  api_key = models.ForeignKey(ApiKeyCounts, related_name="api_key_counts")
  api_use = models.DateField(auto_now_add=True)


def load_initial_themes():
  s = get_default_data('flat_ui_theme.json')
  t = UITheme(name="Flat UI Kit")
  t.set_state(simplejson.loads(s))
  t.full_clean()
  t.save()

  return t

class DomainRegistration(models.Model):
  MAX_FREE_DOMAINS = 3

  user = models.ForeignKey(User, related_name="domains", blank=True, null=True)
  domain = models.CharField(max_length=50)
  _domain_info_json = models.TextField()
  dns_configured = models.IntegerField(default=0)

  @property
  def domain_info(self):
    return simplejson.loads(self._domain_info_json)

  #Audit field
  created_on = models.DateTimeField(auto_now_add = True)
  updated_on = models.DateTimeField(auto_now = True)

  from v1factory.domains import DomainAPI
  api = DomainAPI()

  @classmethod
  def check_availability(self, domain):
    return DomainRegistration.api.check_availability(domain)

  @classmethod
  def register_domain(self, domain, test_only=False):
    d = cls()
    d.domain = d
    if test_only:
      d._domain_info_json = "lol"
    else:
      d._domain_info_json = simplejson.dumps(DomainRegistration.api.register_domain(domain, money_mode=True))
      d.save()
    return d

  def configure_dns(self, staging=True):
    DomainRegistration.api.configure_domain_records(domain, staging=staging)
    self.dns_configured = 1
    self.save()

class TutorialLog(models.Model):
  user = models.ForeignKey(User, related_name="logs")
  opened_on = models.DateTimeField(auto_now_add = True)
  title =  models.CharField(max_length=300, blank = True)
  directory =  models.CharField(max_length=50, blank = True)

  @classmethod
  def create_log(cls, user, title, directory):
    log = cls(user = user, title = title, directory = directory)
    log.save()

  @classmethod
  def get_percentage(cls, user):
    log = cls.objects.filter(user=user).exclude(directory='').values("directory").annotate(n=models.Count("pk"))
    percentage = (len(log)*100) / 15
    return percentage
