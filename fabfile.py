from __future__ import with_statement
from fabric.api import local, settings, abort, run, cd, env, hosts
from fabric.contrib.console import confirm

@hosts('v1factory.com')
def pull_prod():
  code_dir = '/var/www/v1factory'
  with cd(code_dir):
    run("git pull")
    run("touch prod_wsgi.py")

@hosts('staging.appcubator.com')
def pull_staging():
  code_dir = '/var/www/v1factory'
  with cd(code_dir):
    run("git pull")
    run("touch staging_wsgi.py")
