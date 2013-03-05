from django.http import HttpResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404

{% for m in models %}
{{ m.import_line() }}
{% endfor %}

{% for v in views %}
@require_GET
def {{ v.identifier() }}(request, {% for u in v.url_keys() %}{{ u }}, {% endfor %}):
  page_context = {}
  {% for q in v.queries() %}
  page_context[{{ q.identifier_repr() }}] = {{ q.execute_line() }}
  {% endfor %}
  return render(request, {{ v.template_repr() }}, page_context)

{% endfor %}
