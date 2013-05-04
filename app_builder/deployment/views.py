"""TODO

1. view functions
2. supporting model functions
3. create basic deployer interface

"""
import re
import datetime
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from app_builder.deployment.models import Deployment
from django.views.decorators.csrf import csrf_exempt
import github_actions
import sys
import subprocess

class ProJSON(simplejson.JSONEncoder):
  """It's about time we handled datetime"""
  def default(self, obj):
    if isinstance(obj, datetime.datetime):
      return obj.isoformat()
    else:
      return super(DateTimeJSONEncoder, self).default(obj)

@require_GET
#@login_required
def list_deployments(request):
  d = Deployment.objects.all()
  return HttpResponse(simplejson.dumps(list(d.values()), cls=ProJSON), mimetype="application/json")

def is_valid_subdomain(subdomain):
  return len(subdomain) >= 2 and len(subdomain) <= 20 and re.match(r'[a-z0-9][a-z0-9\-]*[a-z0-9]$', subdomain)

@require_GET
def available_check(request):
  subdomain = request.GET['subdomain']
  assert(is_valid_subdomain(subdomain))
  if Deployment.objects.filter(subdomain=subdomain).exists():
    return HttpResponse("0")
  else:
    return HttpResponse("1")

@require_POST
@csrf_exempt
#@login_required
def deploy_code(request):
  s = request.POST['subdomain']
  u_name = request.POST['u_name']
  app_json = request.POST['app_json']
  css = request.POST['css']
  d_user = request.POST['d_user']
  try:
    d = Deployment.objects.get(u_name=u_name)
  except Deployment.DoesNotExist:
    d = Deployment.create(s, u_name=u_name, app_state=simplejson.loads(app_json))
    d.initialize()
    github_actions.create(u_name, d.app_dir)
  else:
    d.update_app_state(simplejson.loads(app_json))
  d.update_css(css)
  d.full_clean()
  msgs = d.deploy(d_user)
  github_actions.push(u_name, d.app_dir)
  d.save()
  ret_code = subprocess.call(["sudo", "/var/www/v1factory/reload_apache.sh"])
  ret_code = 0
  assert(ret_code == 0)
  return HttpResponse(msgs)

@require_POST
@csrf_exempt
#@login_required
def delete_deployment(request):
  u_name = request.POST['u_name']
  d = get_object_or_404(Deployment, u_name=u_name)
  d.delete()
  return HttpResponse("ok")
