from django.http import HttpResponse, HttpRequest
from django.views.decorators.http import require_GET, require_POST
from django.shortcuts import redirect,render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.utils import simplejson

import requests

# Operations
def format_full_details(details):
  lines = []
  for k,v in details.items():
    lines.append("{}: {}".format(k,v))
  return '\n'.join(lines)

def send_login_notification_message(message):
  return requests.post(
      "https://api.mailgun.net/v2/v1factory.mailgun.org/messages",
      auth=("api", "key-8iina6flmh4rtfyeh8kj5ai1maiddha8"),
      data={
             "from": "v1Factory Bot <postmaster@v1factory.mailgun.org>",
             "to": "founders@heapdocs.com",
             "subject": "Someone signed on!",
             "text": message,
           }
  )

# Handle requests
@require_POST
def get_linkedin(request):
  r = send_login_notification_message(format_full_details(request.POST))
  return HttpResponse("ok")

def signup(request):
  if request.method == "GET":
    return render(request, "signup.html")
  elif request.method == "POST":
    pass
  else:
    return HttpResponse("", status=405)
