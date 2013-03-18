from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
import simplejson
import re
import os, sys, subprocess
import traceback
import os.path
import shlex
import subprocess
import django.conf
import random
import string
import time
import shutil
from django.core.exceptions import ValidationError

DEFAULT_STATE_DIR = os.path.join(os.path.dirname(__file__), os.path.normpath("default_state"))

def copytree(src, dst, symlinks=False, ignore=None):
  for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(dst, item)
    if os.path.isdir(s):
      shutil.copytree(s, d, symlinks, ignore)
    else:
      shutil.copy2(s, d)

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
  name = models.CharField(max_length=100)
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

  @property
  def subdomain(self):
    return self.owner.username + "-" + self.name

  @property
  def app_path(self):
    return "/var/www/apps/" + self.owner.username + "/"+ self.name

  @property
  def config_path(self):
    return "/var/www/configs/" + self.owner.username + "/" + self.name

  # TODO deprecate this.
  def randomly_name(self):
    self.name = "".join( [ random.choice(string.ascii_lowercase) for i in xrange(6) ] )

  def is_initialized(self):
    """checks if this app has already been initialized"""
    return os.path.isdir(self.app_path) and os.path.isfile(self.config_path)

  def apache_config(self):
    apache_config = """
<VirtualHost *:80>
	ServerName {}.v1factory.com
	ServerAdmin founders@v1factory.com

	WSGIScriptAlias / {}/wsgi.py
	WSGIDaemonProcess {} python-path={}:/var/www/libs/lib/python2.7/site-packages
	WSGIProcessGroup {}

	<Directory {}>
	<Files wsgi.py>
	Order deny,allow
	Allow from all
	</Files>
	</Directory>

	Alias /static/ {}/static/
	<Directory {}/static/>
	Order deny,allow
	Allow from all
	</Directory>

	LogLevel info 
	ErrorLog {}/error.log
	CustomLog {}/access.log combined
</VirtualHost>
""".format(self.subdomain, self.app_path, self.subdomain, self.app_path, self.subdomain, *(5*[self.app_path]))
    return apache_config

  def do_initial_config(self):
    """setup apache config and write a blank app to the app path"""
    try:
      os.makedirs(os.path.dirname(self.config_path))
    except OSError:
      print "Config directory already exists."
    a_conf = open(self.config_path, "w")
    a_conf.write(self.apache_config())
    a_conf.close()

    os.makedirs(self.app_path)
    # should probably restart apache2

  def write_to_fs(self):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    a = AnalyzedApp(self.state)
    dw = analyzed_app_to_app_components(a)
    tmp_project_dir = DjangoAppWriter(dw).write_to_fs()

    print "Project written to " + tmp_project_dir
    return tmp_project_dir


  def deploy(self):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    # GENERATE CODE
    tmp_project_dir = self.write_to_fs()
    print "Project written to " + tmp_project_dir

    if not django.conf.settings.PRODUCTION:
      return tmp_project_dir

    # INITIALIZE APACHE
    if not self.is_initialized():
      print "Project not initialized... Initializing"
      #self.randomly_name()
      #self.save()
      self.do_initial_config()
    else:
      print "Project already initialized... skipping this step"

    child_env = os.environ.copy()
    if "DJANGO_SETTINGS_MODULE" in child_env:
      del child_env["DJANGO_SETTINGS_MODULE"]

    # COPY THE CODE TO THE RIGHT DIRECTORY
    print "Removing existing app code"
    for f in os.listdir(self.app_path):
      if f in ["db"]:
        continue
      f_path = os.path.join(self.app_path, f)
      if os.path.isfile(f_path):
        os.remove(f_path)
      else:
        shutil.rmtree(f_path)
    print "Copying temp project dir to the real path -> " + self.app_path
    copytree(tmp_project_dir, self.app_path)

    # CODE TO RUN AFTER APP CODE HAS BEEN DEPLOYED
    commands = []
    commands.append('python manage.py syncdb --noinput')
    for c in commands:
      print "Running `{}`".format(c)
      subprocess.call(shlex.split(c), env=child_env, cwd=self.app_path, stdout=sys.stdout, stderr=sys.stderr)

    return

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
