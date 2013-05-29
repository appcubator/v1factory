from django.contrib.auth import login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.utils.http import is_safe_url

@require_POST
def {{ form_receiver.identifier() }}(request):
  """
  Handles the login action.
  """
  #redirect_to = request.REQUEST.get('next', '')
  redirect_to = "{{ form_receiver.goto_view.view_path() }}"

  form = AuthenticationForm(None, data=request.POST)
  if form.is_valid():
    # Make sure the redirect is kosher
    if not is_safe_url(url=redirect_to, host=request.get_host()):
      return ajax_redirect(request, '/')

    auth_login(request, form.get_user())
    return ajax_redirect(request, redirect_to)

  else:
    return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json")
