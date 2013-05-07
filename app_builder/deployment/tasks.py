from celery import task
import subprocess
import os
import os.path

@task()
def add(x,y):
  return x+y

@task()
def push(name, cwd, changes=True):
  print changes
  if changes:
    child_env = os.environ.copy()
    print "HERE"
    ret_code = subprocess.call(['git', 'add', '.'], env=child_env, cwd=cwd)
    print "Git add: ", ret_code
    ret_code = subprocess.call(['git', 'commit', '-a', '-m', '"changes"'], env=child_env, cwd=cwd)
    print "Git commit: ", ret_code
    ret_code = subprocess.call(['git', 'push', '-u', 'origin', 'master'], env=child_env, cwd=cwd)
    print "Git push: ", ret_code
