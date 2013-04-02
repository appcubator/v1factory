from django.http import HttpResponse, HttpRequest
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect,render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import forms, authenticate, login
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
@csrf_exempt
def get_linkedin(request):
  r = send_login_notification_message(format_full_details(request.POST))
  return HttpResponse("ok")

class MyUserCreationForm(forms.UserCreationForm):
  """Creates a user"""

  class Meta(forms.UserCreationForm.Meta):
    fields = ('username','first_name','last_name','email')

  def __init__(self, *args, **kwargs):
    super(MyUserCreationForm, self).__init__(*args, **kwargs)
    self.fields['first_name'].required = True
    self.fields['last_name'].required = True
    self.fields['email'].required = True

@require_GET
def homepage(request):
  if request.user.is_authenticated():
    return redirect('/app')

  page_context = {}
  page_context["title"] = "Homepage"
  return render(request, 'website-home.html', page_context)

@require_http_methods(["GET", "POST"])
def signup(request):
  if request.method == "GET":
    return render(request, "registration/signup.html")

  else:
    form = MyUserCreationForm(request.POST)
    if form.is_valid():
      user = form.save()
      new_user = authenticate(username=request.POST['username'],
                              password=request.POST['password1'])
      login(request, new_user)
      return redirect('/')
    else:
      return HttpResponse(simplejson.dumps({ k : v for k,v in form.errors.items() }), mimetype="application/json")


def highland_view(request):
  return redirect('/')
