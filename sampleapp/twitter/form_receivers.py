from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404

from twitter.model_forms import TweetForm3
from twitter.model_forms import TweetForm1


@require_POST
def save_TweetForm3(request):
  new_form = TweetForm3(request.user, request.POST)
  if new_form.is_valid():
    obj = new_form.save()
    return HttpResponse("OK")
  else:
    return HttpResponse(simplejson.dumps({ "errors" : [(k, v[0].__unicode__()) for k, v in new_form.errors.items()] }), status=400)

@require_POST
def save_TweetForm1(request):
  new_form = TweetForm1(request.user, request.POST)
  if new_form.is_valid():
    obj = new_form.save()
    return HttpResponse("OK")
  else:
    return HttpResponse(simplejson.dumps({ "errors" : [(k, v[0].__unicode__()) for k, v in new_form.errors.items()] }), status=400)
