from django.contrib.auth import login as auth_login, logout as auth_logout
from django.contrib.auth.forms import AuthenticationForm
from django.utils.http import is_safe_url

@require_POST
def {{ form_receiver.identifier() }}(request):
  """
  Handles the login action.
  """
  redirect_to = request.REQUEST.get('next', '')

  form = AuthenticationForm(request, data=request.POST)
  if form.is_valid():
    # Make sure the redirect is kosher
    if not is_safe_url(url=redirect_to, host=request.get_host()):
      return redirect('/')

    auth_login(request, form.get_user())
    return HttpResponseRedirect(redirect_to)

  else:
    return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json")
