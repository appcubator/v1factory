from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.views.decorators.csrf import csrf_exempt
from django.utils import simplejson
from django.shortcuts import redirect, render, render_to_response, get_object_or_404


@require_GET
def {{ view.identifier }}(request{% for arg, data in view.args %}, {{ arg }}{% endfor %}):
    page_context = {}
    {% for arg, arg_data in view.args %}
    page_context['{{ arg_data.template_id }}'] = get_object_or_404({{ arg_data.model_id }}, pk={{ arg }})
    {% endfor %}
    # here i have to add queries
    return render(request, "{{ view.template_code_path }}", page_context){#







@require_GET
def {{ identifier }}(request{% for u in page_context %}, {{ u.arg_name }}{% endfor %}):
{% for q in view.queries.each() %}
  page_context['{{ q.identifier() }}'] = {{ q.render() }}
{% endfor %}

  return render(request, {{ view.template_repr() }}, page_context)

#}
