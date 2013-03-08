from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from v1factory.models import App, UIElement, StaticFile

def add_statics_to_context(context, app):
  context['statics'] = simplejson.dumps(list(StaticFile.objects.filter(app=app).values()))
  return context

@login_required
def app_list(request):
  if request.user.apps.count() == 0:
    return redirect(app_new)
  elif request.user.apps.count() == 1:
    return redirect(app_page, request.user.apps.all()[0].id)
  else:
    page_context = { 'apps': request.user.apps.all() }
    return render(request, 'dev/apps-show.html', page_context)


@login_required
def app_new(request):
  if request.method == 'GET':
    return render(request, 'dev/apps-new.html')
  elif request.method == 'POST':
    a = App(name="YOLO app", owner=request.user)
    a.save()
    a.name += str(a.id)
    a.save()
    return redirect(app_page, a.id)

@require_GET
@login_required
def app_page(request, app_id):
  app = get_object_or_404(App.objects.values('id', 'name'), id=app_id, owner=request.user)
  return render(request, 'dev/app-show.html', {'app' : app, 'title' : 'The Garage' })

@login_required
def app_state(request, app_id):
  app = get_object_or_404(App, id=app_id)
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
  app._state_json = request.body
  try:
    app.full_clean()
  except Exception, e:
    return (400, str(e))
  app.save()
  return (200, 'ok')

@login_required
def uie_state(request, app_id):
  app = get_object_or_404(App, id=app_id)
  if request.method == 'GET':
    state = app_get_uie_state(request, app)
    return JSONResponse(state)
  elif request.method == 'POST':
    status, message = app_save_uie_state(request, app)
    return HttpResponse(message, status=status)
  else:
    return HttpResponse("GET or POST only", status=405)

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

@login_required
@require_POST
def app_deploy(request, app_id):
  app = get_object_or_404(App, id=app_id)
  app.deploy()
  return HttpResponse("")

def app_urls(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app, 'title' : 'URLs', 'app_id': app_id }
  return render(request, 'dev/app-urls.html', page_context)

def app_design(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app, 'title' : 'Design' }
  return render(request, 'dev/app-design.html', page_context)

def app_gallery(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  els = UIElement.get_library()

  page_context = { 'app': app, 'title' : 'Gallery', 'elements' : els, 'app_id': app_id  }
  add_statics_to_context(page_context, app)
  return render(request, 'dev/app-gallery.html', page_context)

def app_pages(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  els = UIElement.get_library()

  page_context = { 'app': app, 'title' : 'Pages', 'elements' : els, 'app_id': app_id }
  return render(request, 'dev/app-pages.html', page_context)

def app_analytics(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app , 'title' : 'Analytics' }
  return render(request, 'dev/app-analytics.html', page_context)

def app_data(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app , 'title' : 'Data' }
  return render(request, 'dev/app-data.html', page_context)

def app_finances(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app , 'title' : 'Finances' }
  return render(request, 'dev/app-finances.html', page_context)

def account(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app, 'title' : 'Account Info' }
  return render(request, 'dev/app-account.html', page_context)

@require_GET
@login_required
def entities(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app, 'title' : 'Entities', 'app_id': app_id  }
  return render(request, 'dev/app-entities.html', page_context)

from django.forms import ModelForm
class StaticFileForm(ModelForm):
  class Meta:
    model = StaticFile
    exclude = ('app',)

  def __init__(self, app, *args, **kwargs):
    self.app = app
    super(StaticFileForm, self).__init__(*args, **kwargs)

  def save(self, *args, **kwargs):
    self.instance.app = self.app
    return super(StaticFileForm, self).save(*args, **kwargs)


def JSONResponse(serializable_obj):
  return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json")

@login_required
def staticfiles(request, app_id):
  if request.method != 'GET' and request.method != 'POST':
    return HttpResponse("Method not allowed", status=405)
  else:
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
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
  app = get_object_or_404(App, id=app_id)
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
  return render(request, 'dev/editor-main.html', page_context)

@require_GET
@login_required
def app_info(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  els = UIElement.get_library()
  page_context = { 'app': app, 'title' : 'Info', 'elements' : els, 'app_id': app_id  }
  return render(request, 'dev/app-info.html', page_context)

# IN THE WORKS
def generate_html(request, app_id, page_name):
  app = get_object_or_404(App, id=app_id)
  page = get_object_or_404(app.templates, name__iexact='homepage')
  uielements = simplejson.loads(page.html)[0]

  print uielements
  generated_html = '<html>'
  for key, val in uielements.iteritems():
    print key
    if key == 'container-create':
      print 'containiiii'
      generated_html += generate_create_container(val)
    else:
      if val.type is 'widget-5':
        generated_html += '<input name="yolo" type="text">'
      else:
        generated_html += '<span>YOLOOOO</span>'

  return HttpResponse(generated_html)

def generate_create_container(container_content):
  print container_content
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
