from django.http import HttpResponse, HttpRequest
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, get_object_or_404

{% for m in models %}
{{ m.import_line() }}
{% endfor %}

{% for v in form_receivers %}
@require_POST
def {{ v.identifier() }}(request):
# create an object
  obj = {{ v.model.identifier() }}()
  {% for field in v.included_fields %}
  obj.{{ field.identifier() }} = request.POST['{{ field.name }}']{% endfor %}
  obj.save()
  return redirect('/')

{% endfor %}
