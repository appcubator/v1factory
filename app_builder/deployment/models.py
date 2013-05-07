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
import logging
logger = logging.getLogger("deployment.models")

def copytree(src, dst, symlinks=False, ignore=None):
  """shutil.copytree wrapper which works even when the dest dir exists"""
  for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(dst, item)
    if os.path.isdir(s):
      if not os.path.isdir(d):
        os.makedirs(d)
      copytree(s, d, symlinks, ignore)
    else:
      shutil.copy2(s, d)

class Deployment(models.Model):
  subdomain = models.CharField(max_length=50, unique=True)
  u_name = models.CharField(max_length=100, unique=True)
  app_state_json = models.TextField(blank=True)
  css = models.TextField(blank=True)
  app_dir = models.TextField()
  config_file_path = models.TextField()

  #Audit field
  created_on = models.DateTimeField(auto_now_add = True)
  updated_on = models.DateTimeField(auto_now = True)

  @classmethod
  def create(cls, subdomain, u_name=None, app_state=None):
    self = cls(subdomain=subdomain, u_name=u_name)
    self.app_dir = "/var/www/apps/" + u_name
    self.config_file_path = "/var/www/configs/" + u_name
    if app_state is not None:
      self.app_state_json = simplejson.dumps(app_state)
    return self

  def apache_config(self):
    try:
      domain = simplejson.loads(self.app_state_json)['info']['domain']
    except Exception, e:
      print e
      print "could not extract domain from app state"
      domain = None

    return fillout_config(self.u_name, self.subdomain, self.app_dir, domain=domain)

  def initialize(self):
    """Setup apache config and write a blank app to the app path"""

    # make app directory
    try:
      os.makedirs(self.app_dir)
    except OSError: # directory is already there! no problemo
      pass

    a_conf = open(self.config_file_path, "w")
    a_conf.write(self.apache_config())
    a_conf.close()


  def is_initialized(self):
    """checks if this app has already been initialized"""
    return os.path.isdir(self.app_dir) and os.path.isfile(self.config_file_path)

  def write_to_tmpdir(self, d_user):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    a = AnalyzedApp(simplejson.loads(self.app_state_json))
    dw = analyzed_app_to_app_components(a, d_user)
    tmp_project_dir = DjangoAppWriter(dw, self.css).write_to_fs()

    return tmp_project_dir

  def update_app_state(self, app_dict):
    self.app_state_json = simplejson.dumps(app_dict)
    return self

  def update_css(self, css):
    self.css = css
    return self

  def deploy(self, d_user):
    from app_builder.analyzer import AnalyzedApp
    from app_builder.django.coordinator import analyzed_app_to_app_components
    from app_builder.django.writer import DjangoAppWriter

    logger.info("Writing config files and making sure hosting folder exists.")
    self.initialize()

    # GENERATE CODE
    try:
      tmp_project_dir = self.write_to_tmpdir(d_user)
    except Exception, e:
      return { "errors": traceback.format_exc() }

    logger.info("Project written to " + tmp_project_dir)

    if not django.conf.settings.PRODUCTION:
      logger.info("Not a production deployment - returning now.")
      return tmp_project_dir

    child_env = os.environ.copy()
    if "DJANGO_SETTINGS_MODULE" in child_env:
      del child_env["DJANGO_SETTINGS_MODULE"]
    # Hack to make syncdb work.
    child_env["PATH"] = "/var/www/v1factory/venv/bin:" + child_env["PATH"]

    # COPY THE CODE TO THE RIGHT DIRECTORY
    logger.info("Removing existing app code.")
    for f in os.listdir(self.app_dir):
      if f in ["db", ".git", "migrations"]:
        continue
      f_path = os.path.join(self.app_dir, f)
      if os.path.isfile(f_path):
        os.remove(f_path)
      else:
        if f != "webapp": # migrations folder is in this one
          shutil.rmtree(f_path)
    logger.info("Copying temp project dir to the real path -> " + self.app_dir)
    copytree(tmp_project_dir, self.app_dir)

    # COMMANDS TO RUN AFTER APP CODE HAS BEEN DEPLOYED
    commands = []

    commands.append('python manage.py syncdb --noinput')

    # if migrations is not yet a directory, then setup south
    if not os.path.isdir(os.path.join(self.app_dir, 'webapp', 'migrations')):
      logger.info("Web app has not yet been migrated - converting to south.")
      commands.append('python manage.py convert_to_south webapp')

    # else, try to migrate the schema
    else:
      commands.append('python manage.py schemamigration webapp --auto')
      commands.append('python manage.py migrate webapp')

    debug_info = []
    for c in commands:
      logger.debug("Running `{}`".format(c))
      try:
        log_msg = subprocess.check_output(shlex.split(c), env=child_env, cwd=self.app_dir)
      except subprocess.CalledProcessError, e:
        logger.error(repr(e.cmd) + " returned with exit code of " + str(e.returncode))
        logger.error("Command output: " + e.output)
        # TODO send error to someone! don't let this fail silently

      logger.debug(log_msg)

    return {}

  def delete(self, delete_files=True, *args, **kwargs):
    try:
      # delete app files
      if delete_files:
        os.remove(self.config_file_path)
        shutil.rmtree(self.app_dir)

      # try to delete github repo
      repo_name = self.u_name
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
	ServerName {subdomain}.appcubator.com
  {optional_alias_string}
	ServerAdmin founders@appcubator.com

	WSGIScriptAlias / {app_dir}/wsgi.py
	WSGIDaemonProcess {u_name} python-path={app_dir}:/var/www/libs/lib/python2.7/site-packages
	WSGIProcessGroup {u_name}

	<Directory {app_dir}>
	<Files wsgi.py>
	Order deny,allow
	Allow from all
	</Files>
	</Directory>

	Alias /static/ {app_dir}/static/
	<Directory {app_dir}/static/>
	Order deny,allow
	Allow from all
	</Directory>

	LogLevel info
	ErrorLog {app_dir}/error.log
	CustomLog {app_dir}/access.log combined
</VirtualHost>"""

def fillout_config(u_name, subdomain, app_dir, domain=None):
  optional_alias_string = ""
  if domain is not None:
    optional_alias_string = "ServerAlias %s" % domain

  return APACHE_CONFIG_TMPL.format(subdomain=subdomain,
                                   u_name=u_name,
                                   app_dir=app_dir,
                                   optional_alias_string=optional_alias_string)
