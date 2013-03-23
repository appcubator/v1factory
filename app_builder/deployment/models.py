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
from django.db import models

"""
design decisions.

always deploy in prefix-suffix form.
"""


class Deployment(models.Model):
  subdomain = models.CharField(unique=True)
  app_dir = models.CharField(unique=True)
  config_file_path = models.Charfield(unique=True)
  app_state_json = models.TextField()

  #Audit field
  created_on = models.DateTimeField(auto_now_add = True)
  updated_on = models.DateTimeField(auto_now = True)

  @classmethod
  def create(cls, subdomain, app_state=''):
    self = cls(subdomain=subdomain)
    self.app_dir = "/var/www/apps/anon/" + subdomain
    self.app_state_json = simplejson.dumps(app_state)

  def apache_config(self):
    return fillout_config(APACHE_STRING, self.subdomain, self.app_dir)

  def initialize(self):
    """Setup apache config and write a blank app to the app path"""
    try:
      os.makedirs(os.path.dirname(self.config_file_path))
    except OSError:
      raise Exception("Error - could not initialize config.")
    try:
      os.makedirs(self.app_dir)
    except OSError:
      raise Exception("Error - could not make app dir.")

    a_conf = open(self.config_file_path, "w")
    a_conf.write(self.apache_config())
    a_conf.close()

    # should probably restart apache2



# what are the inputs needed to deploy an app?
# the app state
# the subdomain you want the app to go

# this module should manage:
# the path of app it will end up in
# the path of the configuration file




def require_valid_subdomain(f):
  def is_valid_subdomain(s):
    if s.find('\n') != -1:
      return False
    return bool(re.match(r"[a-zA-Z]$"))
  def ret_fun(subdomain, *args, **kwargs):
    if is_valid_subdomain(subdomain):
      return f(subdomain, *args, **kwargs)
    else
      raise Exception()
  return ret_fun


@require_valid_subdomain
def initialize(subdomain):
  """setup apache config and write a blank app to the app path"""
  # TODO if the config already exists, raise an exception
  try:
    os.makedirs(os.path.dirname(self.config_file_path))
  except OSError:
    print "Config directory already exists."
  a_conf = open(self.config_file_path, "w")
  a_conf.write(self.apache_config())
  a_conf.close()

  os.makedirs(self.app_dir)
  # should probably restart apache2






  @property
  def subdomain(self):
    return self.owner.username + "-" + self.name

  @property
  def app_dir(self):
    return "/var/www/apps/" + self.owner.username + "/"+ self.name

  @property
  def config_file_path(self):
    return "/var/www/configs/" + self.owner.username + "/" + self.name

  #def randomly_name(self):
  #  self.name = "".join( [ random.choice(string.ascii_lowercase) for i in xrange(6) ] )

  def is_initialized(self):
    """checks if this app has already been initialized"""
    return os.path.isdir(self.app_dir) and os.path.isfile(self.config_file_path)


  def _configure_dat_app(self):
    """setup apache config and write a blank app to the app path"""
    try:
      os.makedirs(os.path.dirname(self.config_file_path))
    except OSError:
      print "Config directory already exists."
    a_conf = open(self.config_file_path, "w")
    a_conf.write(self.apache_config())
    a_conf.close()

    os.makedirs(self.app_dir)
    # should probably restart apache2

  def do_initial_config(self):

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
      self.do_initial_config()
    else:
      print "Project already initialized... skipping this step"

    child_env = os.environ.copy()
    if "DJANGO_SETTINGS_MODULE" in child_env:
      del child_env["DJANGO_SETTINGS_MODULE"]

    # COPY THE CODE TO THE RIGHT DIRECTORY
    print "Removing existing app code"
    for f in os.listdir(self.app_dir):
      if f in ["db"]:
        continue
      f_path = os.path.join(self.app_dir, f)
      if os.path.isfile(f_path):
        os.remove(f_path)
      else:
        shutil.rmtree(f_path)
    print "Copying temp project dir to the real path -> " + self.app_dir
    copytree(tmp_project_dir, self.app_dir)

    # CODE TO RUN AFTER APP CODE HAS BEEN DEPLOYED
    commands = []
    commands.append('python manage.py syncdb --noinput')
    for c in commands:
      print "Running `{}`".format(c)
      subprocess.call(shlex.split(c), env=child_env, cwd=self.app_dir, stdout=sys.stdout, stderr=sys.stderr)

    return

  def delete(*args, delete_files=True, **kwargs):
    if delete_files:
      # TODO actually delete all the files.
      pass
    super(Deployment, self).delete(*args, **kwargs)








# This was ugly in the main code so I moved it down here.
APACHE_CONFIG_TMPL = """
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
"""
def fillout_config(self, subdomain, app_dir):
  return APACHE_CONFIG_TMPL.format(subdomain, app_dir, subdomain, app_dir, subdomain, *(5*[app_dir]))
