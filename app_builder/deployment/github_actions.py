from git import Repo
import requests
import simplejson

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

def push_github(name, cwd, no_github=False, changes=True):
  if no_github:
    repo = Repo.init(cwd)
    repo_info = create_github_repo(name)
    add_me_as_collaborator(name)
    repo.create_remote("origin", repo_info['ssh_url'])

  else:
    repo = Repo(cwd)

  if changes:
    repo.index.add(repo.untracked_files)
    repo.index.commit("changed")
    if no_github:
      repo.git.push("origin", "master", set_upstream=True)
