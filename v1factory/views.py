from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from v1factory.models import App, UIElement, StaticFile, UITheme, ApiKeyUses, ApiKeyCounts
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

  print list(themes)
  return render(request, 'app-show.html', {'app'    : app,
                                           'app_id' : long(app_id),
                                           'title'  : 'The Garage',
                                           'themes' : simplejson.dumps(list(themes)),
                                           'apps'   : request.user.apps.all()})

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
  app.name = app.state['name']
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

def app_urls(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page_context = { 'app': app, 'title' : 'URLs', 'app_id': app_id }
  return render(request, 'app-urls.html', page_context)

def app_design(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page_context = { 'app': app, 'title' : 'Design' }
  return render(request, 'app-design.html', page_context)

def app_gallery(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  els = UIElement.get_library()
  themes = UITheme.objects.all();
  themes = [t.to_dict() for t in themes]
  page_context = { 'app': app,
                   'title' : 'Gallery',
                   'elements' : els,
                   'themes' : themes,
                   'app_id': app_id  }
  add_statics_to_context(page_context, app)
  return render(request, 'app-gallery.html', page_context)

def app_pages(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  els = UIElement.get_library()

  page_context = { 'app': app, 'title' : 'Pages', 'elements' : els, 'app_id': app_id }
  return render(request, 'app-pages.html', page_context)


def app_emails(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)

  page_context = { 'app': app, 'title' : 'Emails', 'app_id': app_id }
  return render(request, 'app-emails.html', page_context)

def app_analytics(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page_context = { 'app': app , 'title' : 'Analytics' }
  return render(request, 'app-analytics.html', page_context)

def app_data(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page_context = { 'app': app , 'title' : 'Data' }
  return render(request, 'app-data.html', page_context)

def app_finances(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page_context = { 'app': app , 'title' : 'Finances' }
  return render(request, 'app-finances.html', page_context)

def account(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page_context = { 'app': app, 'title' : 'Account Info' }
  return render(request, 'app-account.html', page_context)

@require_GET
@login_required
def entities(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page_context = { 'app': app, 'title' : 'Entities', 'app_id': app_id  }
  return render(request, 'app-entities.html', page_context)

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

class ThemeStaticFileForm(ModelForm):
  class Meta:
    model = StaticFile
    exclude = ('app', 'theme')

  def __init__(self, theme, *args, **kwargs):
    self.theme = theme
    super(ThemeStaticFileForm, self).__init__(*args, **kwargs)

  def save(self, *args, **kwargs):
    self.instance.theme = self.theme
    return super(ThemeStaticFileForm, self).save(*args, **kwargs)

def single_theme(f):
  def ret_f(request, theme_id, *args, **kwargs):
    # permissions plz...
    theme = get_object_or_404(UITheme, pk=theme_id)
    return f(request, theme, *args, **kwargs)
  return ret_f

def JSONResponse(serializable_obj):
  """Just a convenience function, in the middle of horrible code"""
  return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json")

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

@login_required
@single_theme
def themestaticfiles(request, theme):
  if request.method != 'GET' and request.method != 'POST':
    return HttpResponse("Method not allowed", status=405)
  if request.method == 'GET':
    sf = StaticFile.objects.filter(theme=theme).values('name','url','type')
    return JSONResponse(list(sf))
  if request.method == 'POST':
    sf_form = ThemeStaticFileForm(theme, request.POST)
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

@require_GET
@login_required
def app_info(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  els = UIElement.get_library()
  page_context = { 'app': app, 'title' : 'Info', 'elements' : els, 'app_id': app_id  }
  return render(request, 'app-info.html', page_context)

def generate_create_container(container_content):
  form_html = '<form action="/app/create/' + container_content['entity'] + '">'
  for element in container_content['elements']:
    form_html += '<input name="yolo" type="text">'
  form_html += '</form>'
  return form_html

### UIElement creation form
from django.forms import ModelForm
class UIElementForm(ModelForm):
  class Meta:
    model = UIElement

def new_uielement(request):
  if request.method == 'GET':
    new_form = UIElementForm()
    return render(request, "uielement/new_element.html", {'form': new_form} )

  elif request.method == 'POST':
    new_form = UIElementForm(request.POST)

    if new_form.is_valid():
      obj = new_form.save()
      return HttpResponse("Success")
    else:
      return render(request, "uielement/new_element.html", {'form': new_form} )

  else:
    return HttpResponse("Only GET and POST allowed", status=405)

@login_required
def designer_page(request):
  themes = UITheme.objects.all()
  page_context = { 'title' : 'Gallery', 'themes' : themes }
  return render(request, 'designer-page.html', page_context)

@require_POST
@login_required
def theme_new(request):
  if request.method=="POST":
    name = request.POST['name']
    theme = UITheme(name=name, designer=request.user)
    theme.save()
    return HttpResponse(simplejson.dumps(theme.to_dict()), mimetype="application/json")

@login_required
@single_theme
def theme_show(request, theme):
  #theme = get_object_or_404(UITheme, pk = theme_id)
  page_context = { 'title' : theme.name , 'themeId': theme.pk, 'theme' : theme._uie_state_json, 'statics' : simplejson.dumps(list(theme.statics.values()))}
  return render(request, 'designer-theme-show.html', page_context)

@require_POST
@login_required
def theme_info(request, theme_id):
  theme = get_object_or_404(UITheme, pk = theme_id)
  page_context = { 'title' : theme.name , 'themeId':  theme.pk, 'theme' : theme._uie_state_json }
  print page_context
  return HttpResponse(simplejson.dumps(page_context), mimetype="application/json")

@login_required
def theme_page_editor(request, theme_id, page_id):
  theme_id = long(theme_id)
  theme = get_object_or_404(UITheme, pk = theme_id)
  page_context = { 'theme': theme,
                   'title' : 'Design Editor',
                   'theme_state' : theme._uie_state_json,
                   'page_id': page_id,
                   'theme_id': theme_id }
  #add_statics_to_context(page_context, app)
  return render(request, 'designer-editor-main.html', page_context)

@require_POST
@login_required
@single_theme
def theme_edit(request, theme):
  if 'name' in request.POST:
    theme.name = request.POST['name']

  if 'uie_state' in request.POST:
    uie_json = request.POST['uie_state']
    theme.uie_state = simplejson.loads(uie_json)

  theme.save()
  return HttpResponse("ok")

@require_POST
@login_required
@single_theme
def theme_clone(request, theme):
  # want to start a new theme from an existing theme
  new_theme = theme.clone(user=request.user)
  return HttpResponse(simplejson.dumps(new_theme.to_dict), mimetype="application/json")

@require_POST
@login_required
@single_theme
def theme_delete(request, theme):
  # want to get a specific theme
  theme.delete()
  return HttpResponse("ok")

@login_required
@require_POST
@csrf_exempt
def app_deploy(request, app_id):
  app = get_object_or_404(App, id=app_id, owner=request.user)
  d_user = {
    'user_name' : request.user.username,
    'date_joined' : str(request.user.date_joined)
  }
  site_url = app.deploy(simplejson.dumps(d_user))
  github_url = app.github_url()
  return HttpResponse(simplejson.dumps({"site_url":site_url, "github_url":github_url}), mimetype="application/json")

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
  m = app.write_to_tmpdir(simplejson.dumps(d_user))
  return HttpResponse(m)


#FOR THE DEPLOYMENT PANEL

@login_required
@require_GET
def deploy_panel(request):
  if request.method == "GET":
    r = requests.get('http://v1factory.com/deployment/')
    if r.status_code == 200:
      page_context = {}
      page_context['deployments'] = simplejson.loads(r.content)
      return render(request, 'deploy-panel.html', page_context)
    else:
      return HttpResponse("v1factory.com returned status of %s" % r.status_code)

@require_POST
@csrf_exempt
@login_required
def deploy_local(request):
  subdomain = request.POST['subdomain']
  app_json = request.POST['app_json']
  d = Deployment.create(subdomain, app_state=simplejson.loads(app_json))
  d_user = {
    'user_name' : request.user.username,
    'date_joined' : str(request.user.date_joined)
  }
  r = d.write_to_tmpdir(simplejson.dumps(d_user))
  return HttpResponse(r)

@require_POST
@csrf_exempt
@login_required
def deploy_hosted(request):
  subdomain = request.POST['subdomain']
  app_json = request.POST['app_json']
  #this will post the data to v1factory.com
  d_user = {
    'user_name' : request.user.username,
    'date_joined' : str(request.user.date_joined)
  }
  post_data = {
    "subdomain": subdomain,
    "app_json": app_json,
    "d_user" : simplejson.dumps(d_user)
  }
  r = requests.post("http://v1factory.com/deployment/push/", data=post_data, headers={"X-Requested-With":"XMLHttpRequest"})
  return HttpResponse(r.content)

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

  # Take the domain info!
  return JSONResponse(d.domain_info)

  # afterwards in a separate worker
  #d.configure_dns(domain, staging=settings.STAGING)
