import requests
import simplejson
import subprocess
import os
import os.path

def create_github_repo(name):
  post_data = {}
  post_data['name'] = name
  post_data['has_issues'] = False
  post_data['has_wiki'] = False
  post_data['has_downloads'] = False

  r = requests.post("https://api.github.com/user/repos", data=simplejson.dumps(post_data), auth=('v1factory', 'obscurepassword321'))
  if r.status_code == 201:
    repo_info = simplejson.loads(r.content)
    return repo_info
  else:
    raise Exception(r.content)

def add_me_as_collaborator(name):
  r = requests.put("https://api.github.com/repos/v1factory/%s/collaborators/ksikka" % name, auth=('v1factory', 'obscurepassword321'))
  if r.status_code != 204:
    raise Exception(r.content)

def push(name, cwd, changes=True):

  if changes:
    child_env = os.environ.copy()
    ret_code = subprocess.call(['/var/www/v1factory/app_builder/deployment/gitscripts/git_update.sh'], env=child_env, cwd=cwd)
    assert ret_code == 0, "Failed to call git_update"

def create(name, cwd, add_ksikka=False):
  child_env = os.environ.copy()
  ret_code = subprocess.call(['git', 'init', '.'], env=child_env, cwd=cwd)
  assert ret_code == 0, "Failed to init repo"

  try:
    repo_info = create_github_repo(name)
  except Exception:
    print "COULD NOT CREATE GITHUB REPO"
    repo_info = {'ssh_url': 'git@github.com:v1factory/%s.git' % name}

  if add_ksikka:
    add_me_as_collaborator(name)

  ret_code = subprocess.call(['git', 'remote', 'add', repo_info['ssh_url']], env=child_env, cwd=cwd)
  assert ret_code == 0, "Failed to add remote"
