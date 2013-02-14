"""
from django.http import HttpResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from django.core import serializers
from models import App
import requests


@require_GET
@login_required
def app_page(request, app_id):
  app = get_object_or_404(App.objects.values('id', 'name'), id=app_id, owner=request.user)
  return render(request, 'app-show.html', {'app' : app, 'title' : 'The Office' })

@require_POST
@login_required
def app_save_page(request, app_id, page_id):
  app = get_object_or_404(App.objects.values('id', 'name'), id=app_id, owner=request.user)

@require_POST
@login_required
def app_create_page(request, app_id):
  if name not in request.POST:
    return HttpResponse("you must supply the name of the new page", status_code=400)
  app = get_object_or_404(App.objects.values('id', 'name'), id=app_id, owner=request.user)
  page = Template(name=request.POST['name'])
  page.save()
  app.templates.add(page)
 
 """
