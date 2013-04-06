from django.http import HttpResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404

def ajax_redirect(request, *args, **kwargs):
  r = redirect(*args, **kwargs)
  if request.is_ajax():
    return HttpResponse(simplejson.dumps({ "redirect_to": r['Location'] }), mimetype='application/json')
  else:
    return r

{% for m in models %}
{{ m.import_line() }}
{% endfor %}

{% for v in form_receivers %}
{{ v.render(env) }}

{% endfor %}
