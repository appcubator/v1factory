import os, sys, subprocess
import simplejson
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
import requests

def copytree(src, dst, symlinks=False, ignore=None):
  """shutil.copytree wrapper which works even when the dest dir exists"""
  for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(dst, item)
    if os.path.isdir(s):
      shutil.copytree(s, d, symlinks, ignore)
    else:
      shutil.copy2(s, d)

class Deployment(models.Model):
  subdomain = models.CharField(max_length=255, unique=True)
  app_state_json = models.TextField(blank=True)
  uie_state_json = models.TextField(blank=True)
  app_dir = models.TextField()
  config_file_path = models.TextField()

  #Audit field
  created_on = models.DateTimeField(auto_now_add = True)
  updated_on = models.DateTimeField(auto_now = True)

  @classmethod
  def create(cls, subdomain, app_state=None):
    self = cls(subdomain=subdomain)
    self.app_dir = "/var/www/apps/" + subdomain
    self.config_file_path = "/var/www/configs/" + subdomain
    if app_state is not None:
      self.app_state_json = simplejson.dumps(app_state)
    return self

  def apache_config(self):
    return fillout_config(self.subdomain, self.app_dir)

  def initialize(self):
    """Setup apache config and write a blank app to the app path"""

    # make app directory
    try:
      os.makedirs(self.app_dir)
    except OSError:
      pass

    a_conf = open(self.config_file_path, "w")
    a_conf.write(self.apache_config())
    a_conf.close()


  def is_initialized(self):
    """checks if this app has already been initialized"""
    return os.path.isdir(self.app_dir) and os.path.isfile(self.config_file_path)

  def write_to_tmpdir(self):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    a = AnalyzedApp(simplejson.loads(self.app_state_json))
    dw = analyzed_app_to_app_components(a)
    tmp_project_dir = DjangoAppWriter(dw, simplejson.loads(self.uie_state_json)).write_to_fs()

    return tmp_project_dir

  def update_app_state(self, app_dict):
    self.app_state_json = simplejson.dumps(app_dict)
    return self

  def update_uie_state(self, uie_dict):
    self.uie_state_json = simplejson.dumps(uie_dict)
    return self

  def deploy(self):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    # GENERATE CODE
    tmp_project_dir = self.write_to_tmpdir()
    print "Project written to " + tmp_project_dir

    if not django.conf.settings.PRODUCTION:
      return tmp_project_dir

    child_env = os.environ.copy()
    if "DJANGO_SETTINGS_MODULE" in child_env:
      del child_env["DJANGO_SETTINGS_MODULE"]
    # Hack to make syncdb work.
    child_env["PATH"] = "/var/www/v1factory/venv/bin:" + child_env["PATH"]

    # COPY THE CODE TO THE RIGHT DIRECTORY
    print "Removing existing app code"
    for f in os.listdir(self.app_dir):
      if f in ["db", ".git"]:
        continue
      f_path = os.path.join(self.app_dir, f)
      if os.path.isfile(f_path):
        os.remove(f_path)
      else:
        shutil.rmtree(f_path)
    print "Copying temp project dir to the real path -> " + self.app_dir
    copytree(tmp_project_dir, self.app_dir)

    # COMMANDS TO RUN AFTER APP CODE HAS BEEN DEPLOYED
    commands = []
    commands.append('python manage.py syncdb --noinput')
    debug_info = []
    for c in commands:
      print "Running `{}`".format(c)
      log_msg = subprocess.check_output(shlex.split(c), env=child_env, cwd=self.app_dir)
      print log_msg
      debug_info.append(log_msg)

    return "\n".join(debug_info)

  def delete(self, delete_files=True, *args, **kwargs):
    try:
      # delete app files
      if delete_files:
        os.remove(self.config_file_path)
        shutil.rmtree(self.app_dir)

      # try to delete github repo
      repo_name = self.subdomain
      assert repo_name != 'v1factory'
      r = requests.delete("https://api.github.com/repos/v1factory/%s" % repo_name, auth=('v1factory', 'obscurepassword321'))

      # try to restart server
      ret_code = subprocess.call(["sudo", "/var/www/v1factory/reload_apache.sh"])
      assert(ret_code == 0)
    except Exception, e:
      print e
    finally:
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
def fillout_config(subdomain, app_dir):
  return APACHE_CONFIG_TMPL.format(subdomain, app_dir, subdomain, app_dir, subdomain, *(5*[app_dir]))
