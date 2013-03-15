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
def {{ v.identifier() }}(request, {% for m in v.url.model_refs() %}{{ m.foreign_key_name() }}, {% endfor %}):
  page_context = {}
  {% for m in v.url.model_refs() %}
  page_context['{{ m.identifier().lower() }}'] = get_object_or_404({{ m.identifier() }}, pk={{ m.foreign_key_name() }})
  {% endfor %}
  {% for q in v.queries.each() %}
  page_context['{{ q.identifier() }}'] = {{ q.model.identifier() }}.objects.all()
  {% endfor %}
  return render(request, {{ v.template_repr() }}, page_context)

{% endfor %}
