from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import simplejson
from django.shortcuts import redirect, render, render_to_response, get_object_or_404


@require_GET
def {{ view.identifier }}(request{% for name, entity in view.page_context %}, {{ name }}{% endfor %}):
    return render("{{ view._django_template.filename }}"){#







@require_GET
def {{ identifier }}(request{% for u in page_context %}, {{ u.arg_name }}{% endfor %}):
  page_context = {}
  {% for ud in url_data %}
  page_context['{{ ud. }}'] = get_object_or_404({{ m.identifier() }}, pk={{ m.foreign_key_name() }})
  {% endfor %}
{% for q in view.queries.each() %}
  page_context['{{ q.identifier() }}'] = {{ q.render() }}
{% endfor %}

  return render(request, {{ view.template_repr() }}, page_context)

#}
