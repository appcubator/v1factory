from django.http import HttpResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404
from django.contrib.auth.models import User
from twitter.models import Tweet
@require_GET
def view_homepage(request):
  page_context = {}
  page_context['q0'] = Tweet.objects.all()
  return render(request, 'twitter/homepage.html', page_context)


@require_GET
@login_required
def view_new_tweet(request):
  page_context = {}
  return render(request, 'twitter/new_tweet.html', page_context)
