"""TODO

1. view functions
2. supporting model functions
3. create basic deployer interface

"""






from app_builder.deployment.models import Deployment

# user facing actions
#1. initialize(subdomain) - setup a blank app at the requested subdomain, get a deploy token back.
#2. deploy(src tree, dest subdomain) - push new code to the requested subdomain
#3. destroy - deactivate the subdomain.

@require_GET
@login_required
def list_deployments(request):
  d = Deployment.objects.all()
  if request.is_ajax():
    return HttpResponse(simplejson.dumps(d.values()), mimetype="application/json")
  else:
    # render an html page.

@require_GET
def available_check(request):
  if Deployment.objects.filter(subdomain=request.GET['subdomain']).exists():
    return HttpResponse("0")
  else:
    return HttpResponse("1")

@require_POST
@login_required
def init_subdomain(request):
  s = request.POST['subdomain']
  if Deployment.objects.filter(subdomain=request.POST['subdomain']).exists():
    return HttpResponse("This subdomain is already taken.", status=409)
  d = Deployment.create(s, init=True)
  try:
    d.save()
  except Exception, e:
    return HttpResponse("Error saving the deployment object. Error msg: " + e.msg)
  try:
    d.initialize()
  except Exception, e:
    d.delete()
    return HttpResponse("Error creating initial directories. Error msg: " + e.msg)

@require_POST
@login_required
def deploy_code(request):
  s = request.POST['subdomain']
  app_json = request.POST['app_state']
  d = get_object_or_404(Deployment, subdomain=s)
  d.update_app_state_json(app_json)
  d.deploy()

@require_POST
@login_required
def delete_deployment(request):
  s = request.POST['subdomain']
  d = get_object_or_404(Deployment, subdomain=s)
  d.delete()
  return HttpResponse("ok")










