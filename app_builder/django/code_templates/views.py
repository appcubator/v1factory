from django.http import HttpResponse, HttpRequest, HttpResponseRedirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404
from django.conf import settings

{% for m in models %}
{{ m.import_line() }}
{% endfor %}

#def logout(request, next_page=None,
#       template_name='registration/logged_out.html',
#       redirect_field_name=REDIRECT_FIELD_NAME,
#       current_app=None, extra_context=None):
#  """
#  Logs out the user and displays 'You are logged out' message.
#  """
#  auth_logout(request)
#
#  if redirect_field_name in request.REQUEST:
#    next_page = request.REQUEST[redirect_field_name]
#    # Security check -- don't allow redirection to a different host.
#    if not is_safe_url(url=next_page, host=request.get_host()):
#      next_page = request.path
#
#  if next_page:
#    # Redirect to this page until the session has been cleared.
#    return HttpResponseRedirect(next_page)
#
#  current_site = get_current_site(request)
#  context = {
#    'site': current_site,
#    'site_name': current_site.name,
#    'title': _('Logged out')
#  }
#  if extra_context is not None:
#    context.update(extra_context)
#  return TemplateResponse(request, template_name, context,
#    current_app=current_app)

{% for v in views %}
{{ v.render() }}
{% endfor %}
