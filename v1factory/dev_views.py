from django.http import HttpResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from django.core import serializers
from v1factory.models import App
from app_builder.models import Class
import requests

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
  return render(request, 'dev/app-show.html', {'app' : app, 'title' : 'The Office' })

@login_required
def app_template(request, app_id, page_name):
  if request.method == 'GET':
    app = get_object_or_404(App, id=app_id, owner=request.user)
    page = get_object_or_404(app.templates, name__iexact=page_name)
    return HttpResponse(page.html)
  elif request.method == 'POST':
    return app_save_page(request, app_id, page_name)
  else:
    return HttpResponse("", status=405)
    
@require_POST
@login_required
def app_save_page(request, app_id, page_name):
  if 'content' not in request.POST:
    return HttpResponse("you must supply \"content\" as a field", status=400)
  app = get_object_or_404(App, id=app_id, owner=request.user)
  page = app.templates.get_or_create(name__iexact=page_name, defaults={ 'name': page_name })
  page.html = request.POST['content']
  try:
    page.full_clean()
  except Exception:
    return HttpResponse("error validating the template object", status=400)
  page.save()
  app.templates.add(page) # associate with this app
  return HttpResponse("ok")

def app_design(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app, 'title' : 'Design' }
  return render(request, 'dev/app-design.html', page_context)

def app_urls(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app, 'title' : 'URLs'}
  # get schema of app
  schema = [ c.to_dict() for c in app.classes.all() ]
  page_context['schema'] = schema
  list_of_pages =  [c.name for c in app.templates.all() ]
  page_context['pages'] = list_of_pages
  return render(request, 'dev/app-urls.html', page_context)

def app_editor(request, app_id, page_name):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  page_context = { 'app': app, 'title' : 'Editor', 'page_name' : page_name }
  # get schema of app
  schema = [ c.to_dict() for c in app.classes.all() ]
  page_context['schema'] = simplejson.dumps(schema)

  page = get_object_or_404(app.templates, name__iexact=page_name)
  page_context['uielements'] = page.html

  list_of_pages =  [c.name for c in app.templates.all() ]
  page_context['pages'] = list_of_pages
  return render(request, 'dev/editor.html', page_context)

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
  page_context = { 'app': app, 'title' : 'Entities' }
  schema = [ c.to_dict() for c in app.classes.all() ]
  page_context['schema'] = simplejson.dumps(schema)
  return render(request, 'dev/app-entities.html', page_context)

@require_POST
@login_required
def sync_schema(request, app_id):
  app_id = long(app_id)
  app = get_object_or_404(App, id=app_id)
  classes = simplejson.loads(request.raw_post_data)

  # function to execute for each new class
  def add_app_class_relation(cls):
    app.classes.add(cls)

  Class.sync_classes(classes, add_app_class_relation)
  return HttpResponse("ok")

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