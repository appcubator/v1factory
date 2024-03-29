from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from v1factory.models import App, UIElement, StaticFile, UITheme, ApiKeyUses, ApiKeyCounts, TutorialLog
from v1factory.email.sendgrid_email import send_email
from v1factory.models import DomainRegistration

from app_builder.analyzer import AnalyzedApp
from app_builder.utils import get_xl_data, add_xl_data, get_model_data
from app_builder.deployment.models import Deployment
from app_builder.validator import validate_app_state

import requests
import traceback
import datetime

def add_statics_to_context(context, app):
  context['statics'] = simplejson.dumps(list(StaticFile.objects.filter(app=app).values()))
  return context

@login_required
def app_list(request):
  if request.user.apps.count() == 0:
    return redirect(app_new)
  else:
    return redirect(app_page, request.user.apps.all()[0].id)

@login_required
def app_new(request):
  if request.method == 'GET':
    return render(request, 'apps-new.html')
  elif request.method == 'POST':
    app_name = "Unnamed"
    if 'name' in request.POST:
      app_name = request.POST['name']
    a = App(name=app_name, owner=request.user)
    # set the name in the app state
    s = a.state
    s['name'] = a.name
    a.state = s
    try:
      a.full_clean()
    except Exception, e:
      return render(request,  'apps-new.html', {'old_name': app_name, 'errors':e}, status=400)
    a.save()
    return redirect(app_page, a.id)

@require_GET
@login_required
def app_page(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)

  themes = UITheme.objects.all();
  themes = [t.to_dict() for t in themes]

  return render(request, 'app-show.html', {'app'    : app,
                                           'app_id' : long(app_id),
                                           'title'  : 'The Garage',
                                           'themes' : simplejson.dumps(list(themes)),
                                           'apps'   : request.user.apps.all(),
                                           'user'   : request.user})

@require_POST
@login_required
def app_delete(request, app_id):
  app = get_object_or_404(App, id=app_id, owner=request.user)
  app.delete()
  return redirect("/")

@login_required
def app_state(request, app_id):
  app = get_object_or_404(App, id=app_id, owner=request.user)
  if request.method == 'GET':
    state = app_get_state(request, app)
    return JSONResponse(state)
  elif request.method == 'POST':
    status, message = app_save_state(request, app)
    return HttpResponse(message, status=status)
  else:
    return HttpResponse("GET or POST only", status=405)

@require_GET
@login_required
def app_get_state(request, app):
  return app.state

@require_POST
@login_required
def app_save_state(request, app):
  old_state = app.state
  app._state_json = request.body
  app.state['name'] = app.name
  try:
    app.full_clean()
  except Exception, e:
    return (400, str(e))
  #app.save()
  state_err = validate_state(app.state)
  if state_err is not None:
    return (400, state_err)
  else:
    app.save()
    return (200, "ok")

def validate_state(app_state):

  # type check
  state_errs = validate_app_state(app_state)
  if len(state_errs) > 0:
    return "\n\n".join(state_errs)

  # other checks
  try:
    a = AnalyzedApp(app_state)
  except Exception, e:
    return traceback.format_exc(100)

  # winning
  return None

@login_required
def uie_state(request, app_id):
  app = get_object_or_404(App, id=app_id, owner=request.user)
  if request.method == 'GET':
    state = app_get_uie_state(request, app)
    return JSONResponse(state)
  elif request.method == 'POST':
    status, message = app_save_uie_state(request, app)
    return HttpResponse(message, status=status)
  else:
    return HttpResponse("GET or POST only", status=405)


@csrf_exempt
def less_sheet(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  els = UIElement.get_library().values()
  my_els = els.filter(app=app)
  page_context = { 'app': app,
                   'title' : 'Editor',
                   'gallery_elements' : els,
                   'elements' : simplejson.dumps(list(els)),
                   'myuielements' : simplejson.dumps(list(my_els)),
                   'app_id': app_id }
  add_statics_to_context(page_context, app)
  return render(request, 'app-editor-less-gen.html', page_context)

@csrf_exempt
def css_sheet(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  els = UIElement.get_library().values()
  my_els = els.filter(app=app)
  page_context = { 'app': app,
                   'title' : 'Editor',
                   'gallery_elements' : els,
                   'elements' : simplejson.dumps(list(els)),
                   'myuielements' : simplejson.dumps(list(my_els)),
                   'app_id': app_id }
  add_statics_to_context(page_context, app)
  return render(request, 'app-editor-css-gen.html', page_context)


@require_GET
@login_required
def app_get_uie_state(request, app):
  return app.uie_state

@require_POST
@login_required
def app_save_uie_state(request, app):
  app._uie_state_json = request.body
  try:
    app.full_clean()
  except Exception, e:
    return (400, str(e))
  app.save()
  return (200, 'ok')


def app_emails(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)

  page_context = { 'app': app, 'title' : 'Emails', 'app_id': app_id }
  return render(request, 'app-emails.html', page_context)


@login_required
@csrf_exempt
@require_POST
def process_excel(request, app_id):
  app_id = long(app_id)
  file_name = request.FILES['file_name']
  entity_name = request.POST['entity_name']
  fields = request.POST['fields']
  fe_data = {'model_name' : entity_name, 'fields' : fields}
  app = get_object_or_404(App, id=app_id, owner=request.user)
  try:
    d = Deployment.objects.get(subdomain=app.subdomain())
  except Deployment.DoesNotExist:
    raise Exception("App has not been deployed yet")
  state = app.get_state()
  xl_data = get_xl_data(file_name)
  app_state_entities = [e['name'] for e in state['entities'] ]
  for sheet in xl_data:
    add_xl_data(xl_data, fe_data, app_state_entities, d.app_dir + "/db")
  return HttpResponse("ok")

@login_required
@csrf_exempt
@require_POST
def process_user_excel(request, app_id):
  f = request.FILES['file_name']
  app = get_object_or_404(App, id=app_id, owner=request.user)

  data = { "api_secret": "uploadinG!!" }
  files = { 'excel_file': f }
  if settings.DEBUG and not settings.STAGING:
    try:
      r = requests.post("http://localhost:8001/" + "user_excel_import/", data=data, files=files)
    except Exception:
      print "To test excel in dev mode, you have to have the child webapp running on port 8001"
  else:
    r = requests.post(app.url() + "user_excel_import/", data=data, files=files)

  return HttpResponse(r.content, status=r.status_code, mimetype="application/json")


@login_required
@require_POST
def fetch_data(request, app_id):
  app_id = long(app_id)
  model_name = request.POST['model_name']
  app = get_object_or_404(App, id=app_id, owner=request.user)
  try:
    d = Deployment.objects.get(subdomain=app.subdomain())
  except Deployment.DoesNotExist:
    raise Exception("App has not been deployed yet")
  return JSONResponse(get_model_data(model_name, d.app_dir + "/db"))
  
from django.forms import ModelForm
class StaticFileForm(ModelForm):
  class Meta:
    model = StaticFile
    exclude = ('app', 'theme')

  def __init__(self, app, *args, **kwargs):
    self.app = app
    super(StaticFileForm, self).__init__(*args, **kwargs)

  def save(self, *args, **kwargs):
    self.instance.app = self.app
    return super(StaticFileForm, self).save(*args, **kwargs)


def JSONResponse(serializable_obj, **kwargs):
  """Just a convenience function, in the middle of horrible code"""
  return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)

@login_required
def staticfiles(request, app_id):
  if request.method != 'GET' and request.method != 'POST':
    return HttpResponse("Method not allowed", status=405)
  else:
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id, owner=request.user)
    if request.method == 'GET':
      sf = StaticFile.objects.filter(app=app).values('name','url','type')
      return JSONResponse(list(sf))
    if request.method == 'POST':
      sf_form = StaticFileForm(app, request.POST)
      if sf_form.is_valid():
        sf_form.save()
        return JSONResponse({})
      else:
        return JSONResponse({ "error": "One of the fields was not valid." })

@require_GET
@login_required
def app_editor(request, app_id, page_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  els = UIElement.get_library().values()
  my_els = els.filter(app=app)
  page_context = { 'app': app,
                   'title' : 'Editor',
                   'gallery_elements' : els,
                   'elements' : simplejson.dumps(list(els)),
                   'myuielements' : simplejson.dumps(list(my_els)),
                   'page_id': page_id,
                   'app_id': app_id }
  add_statics_to_context(page_context, app)
  return render(request, 'app-editor-main.html', page_context)


@login_required
@require_POST
@csrf_exempt
def app_deploy(request, app_id):
  app = get_object_or_404(App, id=app_id, owner=request.user)
  d_user = {
    'user_name' : request.user.username,
    'date_joined' : str(request.user.date_joined)
  }
  result = app.deploy(d_user)
  status = 500 if 'errors' in result else 200
  return HttpResponse(simplejson.dumps(result), status=status, mimetype="application/json")

@login_required
@require_POST
@csrf_exempt
def app_deploy_local(request, app_id):
  assert not settings.PRODUCTION, "You should only deploy local if this is a dev machine"
  app = get_object_or_404(App, id=app_id, owner=request.user)
  d_user = {
    'user_name' : request.user.username,
    'date_joined' : str(request.user.date_joined)
  }
  result = {}
  try:
    result['site_url'] = app.write_to_tmpdir(d_user)
    result['github_url'] = result['site_url']
    status = 200
  except Exception, e:
    result['errors'] = traceback.format_exc()
    status = 500
  return JSONResponse(result, status=status)


@require_POST
@csrf_exempt
def send_hosted_email(request):
  # Need to log IP addresses to ensure we do not get freeloaders
  # that use this as a free service
  from_email = request.POST['from_email']
  to_email = request.POST['to_email']
  subject = request.POST['subject']
  text = request.POST['text']
  html = request.POST['html']
  api_key = request.POST['api_key']
  api_key_count = None
  try:
    api_key_count = ApiKeyCounts.objects.get(api_key=api_key)
  except ApiKeyCounts.DoesNotExist:
    api_new_entry = ApiKeyCounts(api_key=api_key, api_count=0)
    api_new_entry.save()
  if api_key_count is None:
    api_key_count = ApiKeyCounts.objects.get(api_key=api_key)
  #TODO(nkhadke): Make this more sophisticated later on.
  if api_key_count.api_count < 200:
    api_key_count.api_count += 1
    api_use = ApiKeyUses(api_key=api_key_count)
    api_use.save()
    send_email(from_email, to_email, subject, text, html)
    return HttpResponse("Email sent successfully")
  else:
    return HttpResponse("API quota reached")

@require_POST
@csrf_exempt
def check_availability(request, domain):
  domain_is_available = DomainRegistration.check_availability(domain)

  if domain_is_available:
    return JSONResponse(True)
  else:
    return JSONResponse(False)

@require_POST
@login_required
@csrf_exempt
def register_domain(request, domain):
  # Protect against trolls
  assert len(domain) < 50

  # Check domain cap
  if request.user.domains.count() >= DomainRegistration.MAX_FREE_DOMAINS:
    return JSONResponse({"error":0})

  # Try to register
  try:
    d = DomainRegistration.register_domain(domain, test_only=settings.DEBUG)
  except Exception, e:
    return JSONResponse({ "errors": str(e) })

  # TODO afterwards in a separate worker
  d.configure_dns(domain, staging=settings.STAGING)

  # Give client the domain info
  return JSONResponse(d.domain_info)

@require_POST
@login_required
@csrf_exempt
def sub_check_availability(request, subdomain):
  domain_is_available = not App.objects.filter(subdomain=subdomain).exists()

  if domain_is_available:
    return JSONResponse(True)
  else:
    return JSONResponse(False)

@require_POST
@login_required
@csrf_exempt
def sub_register_domain(request, app_id, subdomain):
  app = get_object_or_404(App, id=app_id, owner=request.user)
  app.subdomain = subdomain
  app.full_clean()
  app.save()
  d_user = {
    'user_name' : request.user.username,
    'date_joined' : str(request.user.date_joined)
  }
  app.deploy(d_user)
  return HttpResponse("ok")

@require_POST
@login_required
def log_slide(request):
  title     = request.POST['title']
  directory = request.POST['directory']

  if title is not None or directory is not None:
    TutorialLog.create_log(request.user, title, directory)

  d = {}
  d['percentage'] = TutorialLog.get_percentage(request.user)
  d['feedback'] = TutorialLog.is_donewithfeedback(request.user)

  return JSONResponse(d)

@require_POST
@login_required
def log_feedback(request):
  user     = request.user.first_name
  like     = request.POST['like']
  dislike  = request.POST['dislike']
  features = request.POST['features']


  message =  user + " says.\n\n Like: \n" + like + "\n\n Dislike: \n" + dislike +  "\n\n Feature request: \n" + features

  TutorialLog.create_feedbacklog(request.user, message)

  requests.post(
      "https://api.mailgun.net/v2/v1factory.mailgun.org/messages",
      auth=("api", "key-8iina6flmh4rtfyeh8kj5ai1maiddha8"),
      data={
             "from": "v1Factory Bot <postmaster@v1factory.mailgun.org>",
             "to": "team@appcubator.com",
             "subject": "Someone has some feedback!",
             "text": message
           }
  )

  return JSONResponse("ok")
